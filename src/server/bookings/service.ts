import { randomBytes } from "node:crypto";

import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { DISCOUNT_RULES, LOYALTY_TIER_THRESHOLDS } from "@/lib/constants";
import { demoPromoCodes } from "@/lib/demo-data";
import { connectToDatabase } from "@/lib/db";
import { env, isMockPaymentEnabled, isPayPalEnabled } from "@/lib/env";
import { AppError } from "@/lib/errors";
import {
  createBookingSchema,
  mockPaymentConfirmSchema,
  paypalCaptureSchema,
  paypalOrderSchema,
  bookingQuoteSchema,
  type BookingQuoteInput,
  type CreateBookingInput,
  type MockPaymentConfirmInput,
  type PayPalCaptureInput,
  type PayPalOrderInput,
} from "@/lib/validations/booking";
import { Booking } from "@/models/Booking";
import { Event } from "@/models/Event";
import { Payment } from "@/models/Payment";
import { PromoCode } from "@/models/PromoCode";
import { Ticket } from "@/models/Ticket";
import { TicketType } from "@/models/TicketType";
import { User } from "@/models/User";
import { buildValidatedSelections } from "@/server/bookings/pricing";
import { getPublicEventBySlug } from "@/server/events/service";
import { logNotification, createInAppNotification } from "@/server/notifications/service";
import {
  capturePayPalOrder,
  createPayPalOrder,
  getPayPalChargeDetails,
} from "@/server/payments/paypal";
import { issueTicketsForBooking } from "@/server/tickets/service";
import type { BookingQuote } from "@/types/booking";

type UserSnapshot = {
  id: string;
  role: "USER" | "ADMIN";
  loyaltyPoints: number;
  studentVerificationStatus: string;
};

type MutableBookingRecord = {
  _id: Types.ObjectId;
  bookingCode: string;
  status: string;
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  paymentId?: Types.ObjectId | null;
  promoCodeId?: Types.ObjectId | null;
  confirmedAt?: Date | null;
  loyaltyPointsRedeemed: number;
  loyaltyPointsEarned: number;
  pricing: {
    finalAmount: number;
    currency: string;
  };
  ticketSelections: Array<{
    ticketTypeId: Types.ObjectId;
    quantity: number;
    name: string;
  }>;
  save: () => Promise<unknown>;
};

type MutablePaymentRecord = {
  _id: Types.ObjectId;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  reference: string;
  paidAt?: Date | null;
  meta: Record<string, unknown>;
  save: () => Promise<unknown>;
};

function makeBookingCode() {
  return `EVE-${Date.now().toString(36).toUpperCase()}-${randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
}

function makePaymentReference() {
  return `PAY-${randomBytes(4).toString("hex").toUpperCase()}`;
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

function getConfiguredPaymentProvider() {
  if (isMockPaymentEnabled) {
    return "MOCK" as const;
  }

  if (isPayPalEnabled) {
    return "PAYPAL" as const;
  }

  throw new AppError(
    "No payment provider is configured. Enable mock payments or configure PayPal.",
    503,
    "PAYMENT_NOT_CONFIGURED",
  );
}

async function getBookingForPaymentAction(bookingCode: string) {
  const session = await getSession();

  if (!session) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  await connectToDatabase();

  const booking = await Booking.findOne({ bookingCode });

  if (!booking) {
    throw new AppError("Booking not found.", 404, "NOT_FOUND");
  }

  if (session.role !== "ADMIN" && String(booking.userId) !== session.sub) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  const payment = await Payment.findById(booking.paymentId);

  if (!payment) {
    throw new AppError("Payment record not found.", 404, "NOT_FOUND");
  }

  return {
    booking: booking as unknown as MutableBookingRecord,
    payment: payment as unknown as MutablePaymentRecord,
  };
}

async function finalizeSuccessfulPayment(input: {
  booking: MutableBookingRecord;
  payment: MutablePaymentRecord;
  paymentMeta?: Record<string, unknown>;
}) {
  const { booking, payment, paymentMeta } = input;

  if (!booking || !payment) {
    throw new AppError("Payment record not found.", 404, "NOT_FOUND");
  }

  if (booking.status === "CONFIRMED" && payment.status === "SUCCESS") {
    return {
      message: "Booking is already confirmed.",
      bookingCode: booking.bookingCode,
      status: booking.status,
    };
  }

  const reservedSelections: Array<{
    ticketTypeId: Types.ObjectId;
    quantity: number;
  }> = [];

  try {
    for (const selection of booking.ticketSelections) {
      const updatedTicket = await TicketType.findOneAndUpdate(
        {
          _id: selection.ticketTypeId,
          $expr: {
            $gte: [{ $subtract: ["$quantityTotal", "$quantitySold"] }, selection.quantity],
          },
        },
        {
          $inc: { quantitySold: selection.quantity },
        },
        { new: true },
      );

      if (!updatedTicket) {
        throw new AppError(
          `Not enough remaining seats for ${selection.name}.`,
          409,
          "INSUFFICIENT_AVAILABILITY",
        );
      }

      reservedSelections.push({
        ticketTypeId: selection.ticketTypeId,
        quantity: selection.quantity,
      });
    }
  } catch (error) {
    await Promise.all(
      reservedSelections.map((selection) =>
        TicketType.findByIdAndUpdate(selection.ticketTypeId, {
          $inc: { quantitySold: -selection.quantity },
        }),
      ),
    );

    throw error;
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

  const paidAt = new Date();
  payment.status = "SUCCESS";
  payment.paidAt = paidAt;
  payment.meta = {
    ...payment.meta,
    ...(paymentMeta ?? {}),
    confirmedAt: paidAt.toISOString(),
  };
  await payment.save();

  booking.status = "CONFIRMED";
  booking.confirmedAt = paidAt;
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
    message: "Payment successful. Booking confirmed.",
    bookingCode: booking.bookingCode,
    status: booking.status,
  };
}

async function getAuthenticatedUserSnapshot() {
  const session = await getSession();

  if (!session) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  await connectToDatabase();
  const user = await User.findById(session.sub);

  if (!user) {
    throw new AppError("User account not found.", 404, "NOT_FOUND");
  }

  return {
    id: String(user._id),
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    studentVerificationStatus: user.studentVerificationStatus,
  } satisfies UserSnapshot;
}

async function resolvePromoCode(input: {
  rawCode: string | undefined;
  eventId: string;
  eventSlug: string;
}) {
  const code = input.rawCode?.trim().toUpperCase();

  if (!code) {
    return null;
  }

  if (env.MONGODB_URI) {
    const promo = await PromoCode.findOne({ code, isActive: true }).lean();

    if (!promo) {
      throw new AppError("Promo code not found.", 404, "NOT_FOUND");
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
        promo.applicableEventIds.some(
          (id: Types.ObjectId) => String(id) === input.eventId,
        ),
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
    throw new AppError("Promo code not found.", 404, "NOT_FOUND");
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
      promo.applicableSlugs.length === 0 ||
      promo.applicableSlugs.includes(input.eventSlug),
    usageRemaining: Infinity,
    isActive: true,
  };
}

export async function quoteBooking(input: BookingQuoteInput) {
  const data = bookingQuoteSchema.parse(input);
  const user = await getAuthenticatedUserSnapshot();
  const event = await getPublicEventBySlug(data.eventSlug);

  if (!event) {
    throw new AppError("Event not found.", 404, "NOT_FOUND");
  }

  const selections = buildValidatedSelections(event.ticketTypes, data.selections);

  const subtotal = selections.reduce((sum, selection) => sum + selection.lineTotal, 0);
  const currency = event.ticketTypes[0]?.currency ?? "NPR";
  const totalQuantity = selections.reduce((sum, selection) => sum + selection.quantity, 0);
  const discounts: BookingQuote["discounts"] = [];
  let runningTotal = subtotal;
  let promoCodeId: string | null = null;
  let appliedPromoCode: string | null = null;
  let studentDiscountApplied = false;
  let groupDiscountApplied = false;

  const promo = await resolvePromoCode({
    rawCode: data.promoCode,
    eventId: event.id,
    eventSlug: event.slug,
  });

  if (promo) {
    if (!promo.isActive) {
      throw new AppError("Promo code has expired or is inactive.", 400, "PROMO_INACTIVE");
    }

    if (!promo.appliesToEvent) {
      throw new AppError(
        "Promo code is not valid for this event.",
        400,
        "PROMO_EVENT_MISMATCH",
      );
    }

    if (promo.usageRemaining <= 0) {
      throw new AppError("Promo code usage limit reached.", 400, "PROMO_EXHAUSTED");
    }

    if (subtotal < promo.minimumSubtotal) {
      throw new AppError(
        `Promo code requires a subtotal of at least NPR ${promo.minimumSubtotal}.`,
        400,
        "PROMO_MINIMUM_NOT_MET",
      );
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
      throw new AppError(
        "Student discount requires an approved verification.",
        400,
        "STUDENT_VERIFICATION_REQUIRED",
      );
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
    throw new AppError("Database is required for booking creation.", 503, "DB_REQUIRED");
  }

  await connectToDatabase();
  const event = await Event.findOne({ slug, status: "PUBLISHED" }).lean();

  if (!event) {
    throw new AppError("Published event not found in database.", 404, "NOT_FOUND");
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
  const paymentProvider = getConfiguredPaymentProvider();
  const paypalCharge =
    paymentProvider === "PAYPAL"
      ? getPayPalChargeDetails({
          amount: quote.finalAmount,
          currency: quote.currency,
        })
      : null;

  for (const selection of quote.selections) {
    const ticket = ticketTypes.find((item) => String(item._id) === selection.ticketTypeId);

    if (!ticket) {
      throw new AppError("Ticket type not found in database.", 404, "NOT_FOUND");
    }

    const remaining = ticket.quantityTotal - ticket.quantitySold;

    if (selection.quantity > remaining) {
      throw new AppError(
        `Availability changed for ${ticket.name}. Please refresh the quote.`,
        409,
        "INSUFFICIENT_AVAILABILITY",
      );
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
    provider: paymentProvider,
    status: "INITIATED",
    amount: quote.finalAmount,
    currency: quote.currency,
    reference: paymentReference,
    meta: {
      mode: paymentProvider.toLowerCase(),
      eventSlug: quote.eventSlug,
      ...(paypalCharge
        ? {
            payableAmount: paypalCharge.payableAmount,
            payableCurrency: paypalCharge.payableCurrency,
            exchangeRate: paypalCharge.exchangeRate,
          }
        : {}),
    },
  });

  booking.paymentId = payment._id;
  await booking.save();

  return {
    message:
      paymentProvider === "PAYPAL"
        ? "Booking created. Complete the PayPal payment to confirm it."
        : "Booking created. Complete the mock payment to confirm it.",
    bookingCode,
    paymentReference,
    amount: quote.finalAmount,
    paymentProvider,
  };
}

export async function getBookingDetails(bookingCode: string) {
  const session = await getSession();

  if (!session) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  await connectToDatabase();
  const booking = await Booking.findOne({ bookingCode })
    .populate("eventId")
    .populate("paymentId")
    .lean();

  if (!booking) {
    throw new AppError("Booking not found.", 404, "NOT_FOUND");
  }

  if (session.role !== "ADMIN" && String(booking.userId) !== session.sub) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  return booking;
}

export async function confirmMockPayment(input: MockPaymentConfirmInput) {
  if (!isMockPaymentEnabled) {
    throw new AppError("Mock payment is disabled.", 400, "MOCK_PAYMENT_DISABLED");
  }

  if (!env.MONGODB_URI) {
    throw new AppError(
      "Database is required for payment confirmation.",
      503,
      "DB_REQUIRED",
    );
  }

  const data = mockPaymentConfirmSchema.parse(input);
  const { booking, payment } = await getBookingForPaymentAction(data.bookingCode);

  if (payment.provider !== "MOCK") {
    throw new AppError("This booking is not using mock payment.", 400, "INVALID_PAYMENT_PROVIDER");
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
        type: "EVENT_UPDATE",
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

  return finalizeSuccessfulPayment({
    booking,
    payment,
    paymentMeta: {
      providerStatus: "SUCCESS",
    },
  });
}

export async function createPayPalPaymentOrder(input: PayPalOrderInput) {
  if (isMockPaymentEnabled) {
    throw new AppError("PayPal checkout is unavailable while mock payment is enabled.", 400, "PAYPAL_DISABLED");
  }

  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for PayPal checkout.", 503, "DB_REQUIRED");
  }

  const data = paypalOrderSchema.parse(input);
  const { booking, payment } = await getBookingForPaymentAction(data.bookingCode);

  if (payment.provider !== "PAYPAL") {
    throw new AppError("This booking is not using PayPal.", 400, "INVALID_PAYMENT_PROVIDER");
  }

  if (payment.status === "SUCCESS" || booking.status === "CONFIRMED") {
    throw new AppError("This booking has already been paid.", 400, "ALREADY_PAID");
  }

  const event = await Event.findById(booking.eventId).lean();

  if (!event) {
    throw new AppError("Event not found.", 404, "NOT_FOUND");
  }

  const charge = getPayPalChargeDetails({
    amount: booking.pricing.finalAmount,
    currency: booking.pricing.currency,
  });

  const order = await createPayPalOrder({
    bookingCode: booking.bookingCode,
    title: event.title,
    charge,
  });

  payment.meta = {
    ...payment.meta,
    orderId: order.orderId,
    orderStatus: order.status,
    payableAmount: charge.payableAmount,
    payableCurrency: charge.payableCurrency,
    exchangeRate: charge.exchangeRate,
    orderCreatedAt: new Date().toISOString(),
  };
  await payment.save();

  return {
    orderId: order.orderId,
    status: order.status,
    amount: charge.payableAmount,
    currency: charge.payableCurrency,
  };
}

export async function capturePayPalPayment(input: PayPalCaptureInput) {
  if (isMockPaymentEnabled) {
    throw new AppError("PayPal checkout is unavailable while mock payment is enabled.", 400, "PAYPAL_DISABLED");
  }

  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for PayPal checkout.", 503, "DB_REQUIRED");
  }

  const data = paypalCaptureSchema.parse(input);
  const { booking, payment } = await getBookingForPaymentAction(data.bookingCode);

  if (payment.provider !== "PAYPAL") {
    throw new AppError("This booking is not using PayPal.", 400, "INVALID_PAYMENT_PROVIDER");
  }

  const storedOrderId =
    typeof payment.meta?.orderId === "string" ? payment.meta.orderId : null;

  if (storedOrderId && storedOrderId !== data.orderId) {
    throw new AppError("PayPal order does not match this booking.", 409, "ORDER_MISMATCH");
  }

  const capture = await capturePayPalOrder(data.orderId);

  return finalizeSuccessfulPayment({
    booking,
    payment,
    paymentMeta: {
      orderId: capture.orderId,
      orderStatus: capture.orderStatus,
      captureId: capture.captureId,
      captureStatus: capture.captureStatus,
      payerId: capture.payerId,
      payerEmail: capture.payerEmail,
    },
  });
}

export async function cancelBooking(bookingCode: string) {
  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for booking cancellation.", 503, "DB_REQUIRED");
  }

  const session = await getSession();

  if (!session) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  await connectToDatabase();

  const booking = await Booking.findOne({ bookingCode });

  if (!booking) {
    throw new AppError("Booking not found.", 404, "NOT_FOUND");
  }

  if (session.role !== "ADMIN" && String(booking.userId) !== session.sub) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (booking.status === "CANCELLED") {
    throw new AppError("Booking is already cancelled.", 400, "ALREADY_CANCELLED");
  }

  if (booking.status !== "CONFIRMED") {
    throw new AppError(
      "Only confirmed bookings can be cancelled.",
      400,
      "INVALID_BOOKING_STATE",
    );
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

  await Ticket.updateMany({ bookingId: booking._id }, { status: "CANCELLED" });
  await Payment.findByIdAndUpdate(booking.paymentId, {
    status: "REFUNDED",
    meta: {
      cancelledAt: new Date().toISOString(),
      reason: "booking_cancelled",
    },
  });

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
