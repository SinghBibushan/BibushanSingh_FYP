import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { DISCOUNT_RULES, LOYALTY_TIER_THRESHOLDS } from "@/lib/constants";
import { demoPromoCodes } from "@/lib/demo-data";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import {
  createBookingSchema,
  mockPaymentConfirmSchema,
  bookingQuoteSchema,
  type BookingQuoteInput,
  type CreateBookingInput,
  type MockPaymentConfirmInput,
} from "@/lib/validations/booking";
import { Booking } from "@/models/Booking";
import { Event } from "@/models/Event";
import { Payment } from "@/models/Payment";
import { PromoCode } from "@/models/PromoCode";
import { TicketType } from "@/models/TicketType";
import { User } from "@/models/User";
import { getPublicEventBySlug } from "@/server/events/service";
import { logNotification, createInAppNotification } from "@/server/notifications/service";
import { issueTicketsForBooking } from "@/server/tickets/service";
import type { BookingQuote } from "@/types/booking";

type UserSnapshot = {
  id: string;
  role: "USER" | "ADMIN";
  loyaltyPoints: number;
  studentVerificationStatus: string;
};

function makeBookingCode() {
  return `EVE-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString()
    .slice(-6)}`;
}

function makePaymentReference() {
  return `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function deriveLoyaltyTier(points: number) {
  if (points >= LOYALTY_TIER_THRESHOLDS.GOLD) {
    return "GOLD";
  }

  if (points >= LOYALTY_TIER_THRESHOLDS.SILVER) {
    return "SILVER";
  }

  return "BRONZE";
}

async function getAuthenticatedUserSnapshot() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  await connectToDatabase();
  const user = await User.findById(session.sub);

  if (!user) {
    throw new Error("User account not found.");
  }

  return {
    id: String(user._id),
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    studentVerificationStatus: user.studentVerificationStatus,
  } satisfies UserSnapshot;
}

async function resolvePromoCode(rawCode: string | undefined, eventId: string) {
  const code = rawCode?.trim().toUpperCase();

  if (!code) {
    return null;
  }

  if (env.MONGODB_URI) {
    const promo = await PromoCode.findOne({ code, isActive: true }).lean();

    if (!promo) {
      throw new Error("Promo code not found.");
    }

    return {
      id: String(promo._id),
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      maxDiscountAmount: promo.maxDiscountAmount,
      minimumSubtotal: promo.minimumSubtotal,
      appliesToEvent:
        !promo.applicableEventIds?.length ||
        promo.applicableEventIds.some((id: Types.ObjectId) => String(id) === eventId),
      usageRemaining:
        promo.usageLimit === 0 ? Infinity : Math.max(promo.usageLimit - promo.usedCount, 0),
      isActive:
        promo.isActive &&
        new Date(promo.validFrom) <= new Date() &&
        new Date(promo.validUntil) >= new Date(),
    };
  }

  const promo = demoPromoCodes.find((item) => item.code === code && item.isActive);

  if (!promo) {
    throw new Error("Promo code not found.");
  }

  return {
    id: promo.code,
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    maxDiscountAmount: promo.maxDiscountAmount,
    minimumSubtotal: promo.minimumSubtotal,
    appliesToEvent:
      promo.applicableSlugs.length === 0 || promo.applicableSlugs.includes(eventId),
    usageRemaining: Infinity,
    isActive: true,
  };
}

export async function quoteBooking(input: BookingQuoteInput) {
  const data = bookingQuoteSchema.parse(input);
  const user = await getAuthenticatedUserSnapshot();
  const event = await getPublicEventBySlug(data.eventSlug);

  if (!event) {
    throw new Error("Event not found.");
  }

  const selections = data.selections
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const ticket = event.ticketTypes.find((type) => type.id === item.ticketTypeId);

      if (!ticket) {
        throw new Error("Invalid ticket selection.");
      }

      if (item.quantity > ticket.quantityRemaining) {
        throw new Error(`Only ${ticket.quantityRemaining} seat(s) remain for ${ticket.name}.`);
      }

      return {
        ticketTypeId: ticket.id,
        name: ticket.name,
        unitPrice: ticket.price,
        quantity: item.quantity,
        lineTotal: ticket.price * item.quantity,
      };
    });

  if (selections.length === 0) {
    throw new Error("Select at least one ticket.");
  }

  const subtotal = selections.reduce((sum, selection) => sum + selection.lineTotal, 0);
  const currency = event.ticketTypes[0]?.currency ?? "NPR";
  const totalQuantity = selections.reduce((sum, selection) => sum + selection.quantity, 0);
  const discounts: BookingQuote["discounts"] = [];
  let runningTotal = subtotal;
  let promoCodeId: string | null = null;
  let appliedPromoCode: string | null = null;
  let studentDiscountApplied = false;
  let groupDiscountApplied = false;

  const promo = await resolvePromoCode(data.promoCode, event.slug);

  if (promo) {
    if (!promo.isActive) {
      throw new Error("Promo code has expired or is inactive.");
    }

    if (!promo.appliesToEvent) {
      throw new Error("Promo code is not valid for this event.");
    }

    if (promo.usageRemaining <= 0) {
      throw new Error("Promo code usage limit reached.");
    }

    if (subtotal < promo.minimumSubtotal) {
      throw new Error(`Promo code requires a subtotal of at least NPR ${promo.minimumSubtotal}.`);
    }

    let promoAmount =
      promo.discountType === "PERCENTAGE"
        ? Math.round((runningTotal * promo.discountValue) / 100)
        : promo.discountValue;

    if (promo.maxDiscountAmount) {
      promoAmount = Math.min(promoAmount, promo.maxDiscountAmount);
    }

    promoAmount = Math.min(promoAmount, runningTotal);

    if (promoAmount > 0) {
      discounts.push({
        type: "PROMO",
        label: `Promo code ${promo.code}`,
        amount: promoAmount,
      });
      runningTotal -= promoAmount;
      promoCodeId = promo.id;
      appliedPromoCode = promo.code;
    }
  }

  if (data.useStudentDiscount) {
    if (user.studentVerificationStatus !== "APPROVED") {
      throw new Error("Student discount requires an approved verification.");
    }

    const amount = Math.min(
      Math.round((runningTotal * DISCOUNT_RULES.studentPercentage) / 100),
      runningTotal,
    );

    if (amount > 0) {
      discounts.push({
        type: "STUDENT",
        label: `${DISCOUNT_RULES.studentPercentage}% student discount`,
        amount,
      });
      runningTotal -= amount;
      studentDiscountApplied = true;
    }
  }

  if (totalQuantity >= DISCOUNT_RULES.groupThreshold) {
    const amount = Math.min(
      Math.round((runningTotal * DISCOUNT_RULES.groupPercentage) / 100),
      runningTotal,
    );

    if (amount > 0) {
      discounts.push({
        type: "GROUP",
        label: `${DISCOUNT_RULES.groupPercentage}% group discount`,
        amount,
      });
      runningTotal -= amount;
      groupDiscountApplied = true;
    }
  }

  const redeemableCap = Math.floor(
    (subtotal * DISCOUNT_RULES.maxLoyaltyRedemptionPercentage) / 100,
  );
  const requestedRedemption = data.loyaltyPointsToRedeem ?? 0;
  const allowedRedemption = Math.min(
    requestedRedemption,
    user.loyaltyPoints,
    redeemableCap,
    runningTotal,
  );

  if (allowedRedemption > 0) {
    discounts.push({
      type: "LOYALTY",
      label: `Loyalty redemption (${allowedRedemption} points)`,
      amount: allowedRedemption * DISCOUNT_RULES.loyaltyRedemptionValuePerPoint,
    });
    runningTotal -= allowedRedemption * DISCOUNT_RULES.loyaltyRedemptionValuePerPoint;
  }

  const totalDiscount = discounts.reduce((sum, line) => sum + line.amount, 0);
  const loyaltyPointsEarned = Math.floor(
    runningTotal * DISCOUNT_RULES.pointsPerCurrencyUnit,
  );

  return {
    eventId: event.id,
    eventSlug: event.slug,
    eventTitle: event.title,
    currency,
    selections,
    subtotal,
    discounts,
    totalDiscount,
    finalAmount: runningTotal,
    promoCode: appliedPromoCode,
    studentDiscountApplied,
    groupDiscountApplied,
    loyaltyPointsRedeemed: allowedRedemption,
    loyaltyPointsEarned,
    promoCodeId,
  };
}

async function getPersistentEvent(slug: string) {
  if (!env.MONGODB_URI) {
    throw new Error("Database is required for booking creation.");
  }

  await connectToDatabase();
  const event = await Event.findOne({ slug, status: "PUBLISHED" }).lean();

  if (!event) {
    throw new Error("Published event not found in database.");
  }

  const ticketTypes = await TicketType.find({ eventId: event._id }).lean();

  return {
    event,
    ticketTypes,
  };
}

export async function createBooking(input: CreateBookingInput) {
  const data = createBookingSchema.parse(input);
  const user = await getAuthenticatedUserSnapshot();
  const quote = await quoteBooking(data);
  const { event, ticketTypes } = await getPersistentEvent(data.eventSlug);

  for (const selection of quote.selections) {
    const ticket = ticketTypes.find((item) => String(item._id) === selection.ticketTypeId);

    if (!ticket) {
      throw new Error("Ticket type not found in database.");
    }

    const remaining = ticket.quantityTotal - ticket.quantitySold;

    if (selection.quantity > remaining) {
      throw new Error(`Availability changed for ${ticket.name}. Please refresh the quote.`);
    }
  }

  const bookingCode = makeBookingCode();
  const paymentReference = makePaymentReference();

  const booking = await Booking.create({
    bookingCode,
    userId: new Types.ObjectId(user.id),
    eventId: event._id,
    ticketSelections: quote.selections.map((selection) => ({
      ticketTypeId: new Types.ObjectId(selection.ticketTypeId),
      name: selection.name,
      unitPrice: selection.unitPrice,
      quantity: selection.quantity,
    })),
    pricing: {
      subtotal: quote.subtotal,
      discounts: quote.discounts,
      totalDiscount: quote.totalDiscount,
      finalAmount: quote.finalAmount,
      currency: quote.currency,
    },
    promoCodeId:
      quote.promoCodeId && Types.ObjectId.isValid(quote.promoCodeId)
        ? new Types.ObjectId(quote.promoCodeId)
        : null,
    studentDiscountApplied: quote.studentDiscountApplied,
    groupDiscountApplied: quote.groupDiscountApplied,
    loyaltyPointsEarned: quote.loyaltyPointsEarned,
    loyaltyPointsRedeemed: quote.loyaltyPointsRedeemed,
  });

  const payment = await Payment.create({
    bookingId: booking._id,
    provider: "MOCK",
    status: "INITIATED",
    amount: quote.finalAmount,
    currency: quote.currency,
    reference: paymentReference,
    meta: {
      mode: "mock",
      eventSlug: quote.eventSlug,
    },
  });

  booking.paymentId = payment._id;
  await booking.save();

  return {
    message: "Booking created. Complete the mock payment to confirm it.",
    bookingCode,
    paymentReference,
    amount: quote.finalAmount,
  };
}

export async function getBookingDetails(bookingCode: string) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  await connectToDatabase();
  const booking = await Booking.findOne({ bookingCode })
    .populate("eventId")
    .populate("paymentId")
    .lean();

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (session.role !== "ADMIN" && String(booking.userId) !== session.sub) {
    throw new Error("Unauthorized.");
  }

  return booking;
}

export async function confirmMockPayment(input: MockPaymentConfirmInput) {
  if (!env.MONGODB_URI) {
    throw new Error("Database is required for payment confirmation.");
  }

  const data = mockPaymentConfirmSchema.parse(input);
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  await connectToDatabase();

  const booking = await Booking.findOne({ bookingCode: data.bookingCode });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (session.role !== "ADMIN" && String(booking.userId) !== session.sub) {
    throw new Error("Unauthorized.");
  }

  const payment = await Payment.findById(booking.paymentId);

  if (!payment) {
    throw new Error("Payment record not found.");
  }

  if (data.outcome === "failed") {
    payment.status = "FAILED";
    payment.meta = { ...payment.meta, failedAt: new Date().toISOString() };
    await payment.save();

    booking.status = "EXPIRED";
    await booking.save();

    const user = await User.findById(booking.userId);
    if (user) {
      await logNotification({
        userId: String(user._id),
        email: user.email,
        channel: "EMAIL",
        type: "PAYMENT_FAILED",
        subject: "Mock payment failed",
        message: `Your EventEase payment for booking ${booking.bookingCode} was marked as failed. You can create a new booking and try again.`,
        payload: {
          bookingCode: booking.bookingCode,
          paymentReference: payment.reference,
        },
      });

      // Create in-app notification
      await createInAppNotification({
        userId: String(user._id),
        type: "PAYMENT_SUCCESS",
        title: "Payment Failed",
        message: `Your payment for booking ${booking.bookingCode} failed. Please try again.`,
        link: "/bookings",
        metadata: {
          bookingCode: booking.bookingCode,
        },
      });
    }

    return {
      message: "Mock payment marked as failed.",
      bookingCode: booking.bookingCode,
      status: booking.status,
    };
  }

  if (booking.status === "CONFIRMED" && payment.status === "SUCCESS") {
    return {
      message: "Booking is already confirmed.",
      bookingCode: booking.bookingCode,
      status: booking.status,
    };
  }

  const ticketIds = booking.ticketSelections.map(
    (selection: { ticketTypeId: Types.ObjectId }) => selection.ticketTypeId,
  );
  const ticketTypes = await TicketType.find({ _id: { $in: ticketIds } });

  for (const selection of booking.ticketSelections) {
    const ticket = ticketTypes.find((item) => String(item._id) === String(selection.ticketTypeId));

    if (!ticket) {
      throw new Error("Ticket type not found.");
    }

    const remaining = ticket.quantityTotal - ticket.quantitySold;

    if (selection.quantity > remaining) {
      throw new Error(`Not enough remaining seats for ${selection.name}.`);
    }
  }

  for (const selection of booking.ticketSelections) {
    await TicketType.findByIdAndUpdate(selection.ticketTypeId, {
      $inc: { quantitySold: selection.quantity },
    });
  }

  if (booking.promoCodeId) {
    await PromoCode.findByIdAndUpdate(booking.promoCodeId, {
      $inc: { usedCount: 1 },
    });
  }

  const user = await User.findById(booking.userId);
  const event = await Event.findById(booking.eventId);

  if (user) {
    user.loyaltyPoints = Math.max(
      0,
      user.loyaltyPoints - booking.loyaltyPointsRedeemed + booking.loyaltyPointsEarned,
    );
    user.loyaltyTier = deriveLoyaltyTier(user.loyaltyPoints);
    await user.save();
  }

  payment.status = "SUCCESS";
  payment.paidAt = new Date();
  payment.meta = { ...payment.meta, confirmedAt: new Date().toISOString() };
  await payment.save();

  booking.status = "CONFIRMED";
  booking.confirmedAt = new Date();
  await booking.save();
  await issueTicketsForBooking(String(booking._id));

  if (user && event) {
    await logNotification({
      userId: String(user._id),
      email: user.email,
      channel: "EMAIL",
      type: "BOOKING_CONFIRMED",
        subject: "Booking confirmed and tickets issued",
        message: `Your booking ${booking.bookingCode} for ${event.title} is confirmed. Your PDF tickets are now available in EventEase.`,
        payload: {
          bookingCode: booking.bookingCode,
          eventTitle: event.title,
          ticketsUrl: `${env.APP_URL}/tickets`,
        },
      });

    // Create in-app notification
    await createInAppNotification({
      userId: String(user._id),
      type: "BOOKING_CONFIRMED",
      title: "Booking Confirmed!",
      message: `Your booking ${booking.bookingCode} for ${event.title} is confirmed. Your tickets are ready!`,
      link: "/tickets",
      metadata: {
        bookingCode: booking.bookingCode,
        eventTitle: event.title,
      },
    });
  }

  return {
    message: "Mock payment successful. Booking confirmed.",
    bookingCode: booking.bookingCode,
    status: booking.status,
  };
}

export async function cancelBooking(bookingCode: string) {
  if (!env.MONGODB_URI) {
    throw new Error("Database is required for booking cancellation.");
  }

  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  await connectToDatabase();

  const booking = await Booking.findOne({ bookingCode });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (session.role !== "ADMIN" && String(booking.userId) !== session.sub) {
    throw new Error("Unauthorized.");
  }

  if (booking.status === "CANCELLED") {
    throw new Error("Booking is already cancelled.");
  }

  if (booking.status !== "CONFIRMED") {
    throw new Error("Only confirmed bookings can be cancelled.");
  }

  // Refund tickets
  for (const selection of booking.ticketSelections) {
    await TicketType.findByIdAndUpdate(selection.ticketTypeId, {
      $inc: { quantitySold: -selection.quantity },
    });
  }

  // Refund loyalty points
  const user = await User.findById(booking.userId);
  const event = await Event.findById(booking.eventId);

  if (user) {
    user.loyaltyPoints = Math.max(
      0,
      user.loyaltyPoints + booking.loyaltyPointsRedeemed - booking.loyaltyPointsEarned,
    );
    user.loyaltyTier = deriveLoyaltyTier(user.loyaltyPoints);
    await user.save();
  }

  booking.status = "CANCELLED";
  await booking.save();

  if (user && event) {
    await logNotification({
      userId: String(user._id),
      email: user.email,
      channel: "EMAIL",
      type: "BOOKING_CANCELLED",
      subject: "Booking cancelled",
      message: `Your booking ${booking.bookingCode} for ${event.title} has been cancelled. Your loyalty points have been refunded.`,
      payload: {
        bookingCode: booking.bookingCode,
        eventTitle: event.title,
      },
    });

    // Create in-app notification
    await createInAppNotification({
      userId: String(user._id),
      type: "BOOKING_CANCELLED",
      title: "Booking Cancelled",
      message: `Your booking ${booking.bookingCode} for ${event.title} has been cancelled.`,
      link: "/bookings",
      metadata: {
        bookingCode: booking.bookingCode,
        eventTitle: event.title,
      },
    });
  }

  return {
    message: "Booking cancelled successfully.",
    bookingCode: booking.bookingCode,
    status: booking.status,
  };
}
