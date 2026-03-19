import { loadEnvFile } from "node:process";

import bcrypt from "bcryptjs";
import mongoose, { Types } from "mongoose";

import { demoEvents, demoPromoCodes } from "../src/lib/demo-data";
import { Booking } from "../src/models/Booking";
import { Event } from "../src/models/Event";
import { NotificationLog } from "../src/models/NotificationLog";
import { Payment } from "../src/models/Payment";
import { PromoCode } from "../src/models/PromoCode";
import { StudentVerification } from "../src/models/StudentVerification";
import { Ticket } from "../src/models/Ticket";
import { TicketType } from "../src/models/TicketType";
import { User } from "../src/models/User";

loadEnvFile();

export const DEMO_ADMIN = {
  name: "EventEase Admin",
  email: "admin@gmail.com",
  password: "Password123",
};

const LEGACY_DEMO_ADMIN_EMAIL = "admin@eventease.demo";

export const DEMO_USER = {
  name: "Demo User",
  email: "user@gmail.com",
  password: "Password123",
};

const LEGACY_DEMO_USER_EMAIL = "user@eventease.demo";

export async function connectScriptDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured. Fill it in .env before seeding.");
  }

  await mongoose.connect(mongoUri, {
    bufferCommands: false,
  });
}

function makeTicketCode() {
  return `TIX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function makeBookingCode() {
  return `EVE-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
    .toString()
    .slice(-6)}`;
}

function makePaymentReference() {
  return `PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function seedUsers() {
  const adminPasswordHash = await bcrypt.hash(DEMO_ADMIN.password, 10);
  const userPasswordHash = await bcrypt.hash(DEMO_USER.password, 10);

  const admin = await User.findOneAndUpdate(
    {
      $or: [{ email: DEMO_ADMIN.email }, { email: LEGACY_DEMO_ADMIN_EMAIL }],
    },
    {
      name: DEMO_ADMIN.name,
      email: DEMO_ADMIN.email,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      loyaltyPoints: 0,
      loyaltyTier: "BRONZE",
      studentVerificationStatus: "PENDING",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const user = await User.findOneAndUpdate(
    {
      $or: [{ email: DEMO_USER.email }, { email: LEGACY_DEMO_USER_EMAIL }],
    },
    {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      passwordHash: userPasswordHash,
      role: "USER",
      emailVerifiedAt: new Date(),
      loyaltyPoints: 320,
      loyaltyTier: "BRONZE",
      phone: "+977-9800000000",
      studentVerificationStatus: "APPROVED",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return { admin, user };
}

async function seedEvents() {
  const eventIdsBySlug = new Map<string, Types.ObjectId>();
  const ticketTypeIdsBySlug = new Map<string, Types.ObjectId[]>();

  for (const demoEvent of demoEvents) {
    const event = await Event.findOneAndUpdate(
      { slug: demoEvent.slug },
      {
        title: demoEvent.title,
        slug: demoEvent.slug,
        summary: demoEvent.summary,
        description: demoEvent.description,
        category: demoEvent.category,
        posterUrl: "",
        status: "PUBLISHED",
        startsAt: new Date(demoEvent.startsAt),
        endsAt: new Date(demoEvent.endsAt),
        city: demoEvent.city,
        venueName: demoEvent.venueName,
        venueAddress: demoEvent.venueAddress,
        mapUrl: demoEvent.mapUrl,
        organizerName: demoEvent.organizerName,
        organizerEmail: demoEvent.organizerEmail,
        tags: demoEvent.tags,
        settings: {
          featured: demoEvent.featured,
          highlighted: demoEvent.featured,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    eventIdsBySlug.set(demoEvent.slug, event._id as Types.ObjectId);

    const ticketIds: Types.ObjectId[] = [];
    for (const ticketType of demoEvent.ticketTypes) {
      const ticket = await TicketType.findOneAndUpdate(
        {
          eventId: event._id,
          name: ticketType.name,
        },
        {
          eventId: event._id,
          name: ticketType.name,
          description: ticketType.description,
          price: ticketType.price,
          currency: ticketType.currency,
          quantityTotal: ticketType.quantityTotal,
          quantitySold: ticketType.quantitySold,
          saleStartsAt: new Date(demoEvent.startsAt),
          saleEndsAt: new Date(demoEvent.endsAt),
          perUserLimit: 6,
          benefits: ticketType.benefits,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      ticketIds.push(ticket._id as Types.ObjectId);
    }

    ticketTypeIdsBySlug.set(demoEvent.slug, ticketIds);
    event.ticketTypeIds = ticketIds;
    await event.save();
  }

  return { eventIdsBySlug, ticketTypeIdsBySlug };
}

async function seedPromoCodes(eventIdsBySlug: Map<string, Types.ObjectId>) {
  for (const promo of demoPromoCodes) {
    await PromoCode.findOneAndUpdate(
      { code: promo.code },
      {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        maxDiscountAmount: promo.maxDiscountAmount,
        validFrom: new Date("2026-01-01T00:00:00.000Z"),
        validUntil: new Date("2026-12-31T23:59:59.999Z"),
        usageLimit: 100,
        usedCount: 2,
        applicableEventIds: promo.applicableSlugs
          .map((slug) => eventIdsBySlug.get(slug))
          .filter(Boolean),
        minimumSubtotal: promo.minimumSubtotal,
        isActive: promo.isActive,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function seedVerification(userId: Types.ObjectId, adminId: Types.ObjectId) {
  const verification = await StudentVerification.findOneAndUpdate(
    { userId },
    {
      userId,
      documentPath: "uploads/demo-student-id.png",
      status: "APPROVED",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      notes: "Approved for demo purposes.",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await User.findByIdAndUpdate(userId, {
    studentVerificationId: verification._id,
    studentVerificationStatus: "APPROVED",
  });
}

async function seedDemoConfirmedBooking(input: {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  ticketTypeIds: Types.ObjectId[];
}) {
  const event = await Event.findById(input.eventId);
  const ticketTypes = await TicketType.find({ _id: { $in: input.ticketTypeIds } }).sort({
    price: 1,
  });

  if (!event || ticketTypes.length === 0) {
    return;
  }

  const existing = await Booking.findOne({ userId: input.userId, eventId: input.eventId });
  if (existing) {
    return;
  }

  const selected = ticketTypes[0];
  const subtotal = selected.price * 2;
  const booking = await Booking.create({
    bookingCode: makeBookingCode(),
    userId: input.userId,
    eventId: input.eventId,
    ticketSelections: [
      {
        ticketTypeId: selected._id,
        name: selected.name,
        unitPrice: selected.price,
        quantity: 2,
      },
    ],
    status: "CONFIRMED",
    pricing: {
      subtotal,
      discounts: [],
      totalDiscount: 0,
      finalAmount: subtotal,
      currency: "NPR",
    },
    studentDiscountApplied: false,
    groupDiscountApplied: false,
    loyaltyPointsEarned: 180,
    loyaltyPointsRedeemed: 0,
    confirmedAt: new Date(),
  });

  const payment = await Payment.create({
    bookingId: booking._id,
    provider: "MOCK",
    status: "SUCCESS",
    amount: subtotal,
    currency: "NPR",
    reference: makePaymentReference(),
    meta: { mode: "seed-demo" },
    paidAt: new Date(),
  });

  booking.paymentId = payment._id;
  await booking.save();

  await TicketType.findByIdAndUpdate(selected._id, {
    $inc: { quantitySold: 2 },
  });

  for (let index = 0; index < 2; index += 1) {
    await Ticket.create({
      ticketCode: makeTicketCode(),
      bookingId: booking._id,
      eventId: input.eventId,
      userId: input.userId,
      ticketTypeId: selected._id,
      holderName: DEMO_USER.name,
      qrPayload: JSON.stringify({
        bookingCode: booking.bookingCode,
        eventTitle: event.title,
        seatIndex: index + 1,
      }),
      pdfPath: "",
      status: "ACTIVE",
      issuedAt: new Date(),
    });
  }

  await NotificationLog.create({
    userId: input.userId,
    channel: "EMAIL",
    type: "BOOKING_CONFIRMED",
    subject: "Seeded booking confirmation",
    payload: {
      bookingCode: booking.bookingCode,
      eventTitle: event.title,
      message: "Demo notification created during seeding.",
    },
    status: "SENT",
    sentAt: new Date(),
  });
}

export async function seedDatabase() {
  const { admin, user } = await seedUsers();
  const { eventIdsBySlug, ticketTypeIdsBySlug } = await seedEvents();
  await seedPromoCodes(eventIdsBySlug);
  await seedVerification(admin._id as Types.ObjectId, admin._id as Types.ObjectId);
  await seedVerification(user._id as Types.ObjectId, admin._id as Types.ObjectId);

  const firstEventId = eventIdsBySlug.get(demoEvents[0].slug);
  const firstTicketTypeIds = ticketTypeIdsBySlug.get(demoEvents[0].slug);

  if (firstEventId && firstTicketTypeIds) {
    await seedDemoConfirmedBooking({
      userId: user._id as Types.ObjectId,
      eventId: firstEventId,
      ticketTypeIds: firstTicketTypeIds,
    });
  }

  return {
    adminEmail: DEMO_ADMIN.email,
    adminPassword: DEMO_ADMIN.password,
    userEmail: DEMO_USER.email,
    userPassword: DEMO_USER.password,
  };
}

export async function resetDatabase() {
  await Promise.all([
    NotificationLog.deleteMany({}),
    Ticket.deleteMany({}),
    Payment.deleteMany({}),
    Booking.deleteMany({}),
    PromoCode.deleteMany({}),
    StudentVerification.deleteMany({}),
    TicketType.deleteMany({}),
    Event.deleteMany({}),
    User.deleteMany({}),
  ]);
}

export async function disconnectScriptDatabase() {
  await mongoose.disconnect();
}
