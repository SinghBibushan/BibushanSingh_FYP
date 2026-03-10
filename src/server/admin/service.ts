import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { demoEvents, demoPromoCodes } from "@/lib/demo-data";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import {
  adminEventSchema,
  adminPromoCodeSchema,
  studentReviewSchema,
  type AdminEventInput,
  type AdminPromoCodeInput,
  type StudentReviewInput,
} from "@/lib/validations/admin";
import { slugify } from "@/lib/utils";
import { AuditLog } from "@/models/AuditLog";
import { Booking } from "@/models/Booking";
import { Event } from "@/models/Event";
import { PromoCode } from "@/models/PromoCode";
import { StudentVerification } from "@/models/StudentVerification";
import { TicketType } from "@/models/TicketType";
import { User } from "@/models/User";

async function requireAdminApiSession() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  if (session.role !== "ADMIN") {
    throw new Error("Forbidden.");
  }

  return session;
}

async function writeAuditLog(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}) {
  if (!env.MONGODB_URI) {
    return;
  }

  await AuditLog.create({
    actorUserId: new Types.ObjectId(input.actorUserId),
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    before: input.before ?? null,
    after: input.after ?? null,
  });
}

export async function getAdminOverview() {
  await requireAdminApiSession();

  if (!env.MONGODB_URI) {
    return {
      metrics: [
        { label: "Published Events", value: String(demoEvents.length), note: "Demo fallback data" },
        { label: "Promo Codes", value: String(demoPromoCodes.length), note: "Seed/demo promo set" },
        { label: "Bookings", value: "0", note: "Database not configured" },
        { label: "Users", value: "0", note: "Database not configured" },
      ],
    };
  }

  await connectToDatabase();
  const [eventCount, promoCount, bookingCount, userCount, sales] = await Promise.all([
    Event.countDocuments({ status: "PUBLISHED" }),
    PromoCode.countDocuments({}),
    Booking.countDocuments({}),
    User.countDocuments({}),
    Booking.aggregate([
      { $match: { status: "CONFIRMED" } },
      { $group: { _id: null, total: { $sum: "$pricing.finalAmount" } } },
    ]),
  ]);

  return {
    metrics: [
      { label: "Published Events", value: String(eventCount), note: "Live event catalog" },
      { label: "Promo Codes", value: String(promoCount), note: "Active and scheduled discounts" },
      { label: "Bookings", value: String(bookingCount), note: "Pending and confirmed combined" },
      {
        label: "Gross Sales",
        value: `NPR ${sales[0]?.total ?? 0}`,
        note: `${userCount} registered users`,
      },
    ],
  };
}

export async function listAdminEvents() {
  await requireAdminApiSession();

  if (!env.MONGODB_URI) {
    return demoEvents.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      category: event.category,
      city: event.city,
      startsAt: event.startsAt,
      status: "PUBLISHED",
      featured: event.featured,
      priceFrom: event.priceFrom,
      ticketTypes: event.ticketTypes.length,
    }));
  }

  await connectToDatabase();
  const events = await Event.find({}).sort({ startsAt: 1 }).lean();
  const ticketTypes = await TicketType.find({
    eventId: { $in: events.map((event) => event._id) },
  }).lean();

  return events.map((event) => {
    const forEvent = ticketTypes.filter(
      (ticket) => String(ticket.eventId) === String(event._id),
    );
    return {
      id: String(event._id),
      title: event.title,
      slug: event.slug,
      category: event.category,
      city: event.city,
      startsAt: new Date(event.startsAt).toISOString(),
      status: event.status,
      featured: Boolean(event.settings?.featured),
      priceFrom: forEvent.length ? Math.min(...forEvent.map((ticket) => ticket.price)) : 0,
      ticketTypes: forEvent.length,
    };
  });
}

export async function createAdminEvent(input: AdminEventInput) {
  const session = await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    throw new Error("Database is required for admin event creation.");
  }

  const data = adminEventSchema.parse(input);
  await connectToDatabase();

  const slug = slugify(data.title);
  const existing = await Event.findOne({ slug });
  if (existing) {
    throw new Error("An event with a similar title already exists.");
  }

  const event = await Event.create({
    title: data.title,
    slug,
    summary: data.summary,
    description: data.description,
    category: data.category,
    posterUrl: "",
    status: "PUBLISHED",
    startsAt: new Date(data.startsAt),
    endsAt: new Date(data.endsAt),
    city: data.city,
    venueName: data.venueName,
    venueAddress: data.venueAddress,
    mapUrl: "",
    organizerName: data.organizerName,
    organizerEmail: data.organizerEmail,
    tags: data.tags
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    settings: {
      featured: data.featured,
      highlighted: false,
    },
  });

  const ticketTypes = await TicketType.insertMany(
    data.ticketTypes.map((ticket) => ({
      eventId: event._id,
      name: ticket.name,
      description: ticket.description,
      price: ticket.price,
      currency: "NPR",
      quantityTotal: ticket.quantityTotal,
      quantitySold: 0,
      saleStartsAt: new Date(data.startsAt),
      saleEndsAt: new Date(data.endsAt),
      perUserLimit: ticket.perUserLimit,
      benefits: [],
    })),
  );

  event.ticketTypeIds = ticketTypes.map((ticket) => ticket._id);
  await event.save();

  await writeAuditLog({
    actorUserId: session.sub,
    action: "CREATE",
    entityType: "Event",
    entityId: String(event._id),
    after: event.toObject(),
  });

  return { message: "Event created successfully.", id: String(event._id) };
}

export async function deleteAdminEvent(id: string) {
  const session = await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    throw new Error("Database is required for admin event deletion.");
  }

  await connectToDatabase();
  const event = await Event.findById(id);
  if (!event) {
    throw new Error("Event not found.");
  }

  const before = event.toObject();
  await TicketType.deleteMany({ eventId: event._id });
  await Event.findByIdAndDelete(id);

  await writeAuditLog({
    actorUserId: session.sub,
    action: "DELETE",
    entityType: "Event",
    entityId: id,
    before,
  });

  return { message: "Event deleted successfully." };
}

export async function listAdminPromoCodes() {
  await requireAdminApiSession();

  if (!env.MONGODB_URI) {
    return demoPromoCodes.map((promo) => ({
      id: promo.code,
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minimumSubtotal: promo.minimumSubtotal,
      usageLimit: 0,
      usedCount: 0,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      isActive: promo.isActive,
    }));
  }

  await connectToDatabase();
  const promoCodes = await PromoCode.find({}).sort({ createdAt: -1 }).lean();

  return promoCodes.map((promo) => ({
    id: String(promo._id),
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    minimumSubtotal: promo.minimumSubtotal,
    usageLimit: promo.usageLimit,
    usedCount: promo.usedCount,
    validUntil: new Date(promo.validUntil).toISOString(),
    isActive: promo.isActive,
  }));
}

export async function createAdminPromoCode(input: AdminPromoCodeInput) {
  const session = await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    throw new Error("Database is required for promo code creation.");
  }

  const data = adminPromoCodeSchema.parse(input);
  await connectToDatabase();

  const existing = await PromoCode.findOne({ code: data.code });
  if (existing) {
    throw new Error("Promo code already exists.");
  }

  const promo = await PromoCode.create({
    code: data.code,
    description: data.description,
    discountType: data.discountType,
    discountValue: data.discountValue,
    maxDiscountAmount: data.maxDiscountAmount ?? null,
    validFrom: new Date(data.validFrom),
    validUntil: new Date(data.validUntil),
    usageLimit: data.usageLimit,
    usedCount: 0,
    applicableEventIds: [],
    minimumSubtotal: data.minimumSubtotal,
    isActive: data.isActive,
  });

  await writeAuditLog({
    actorUserId: session.sub,
    action: "CREATE",
    entityType: "PromoCode",
    entityId: String(promo._id),
    after: promo.toObject(),
  });

  return { message: "Promo code created successfully." };
}

export async function listAdminBookings() {
  await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    return [];
  }

  await connectToDatabase();
  const bookings = await Booking.find({})
    .sort({ createdAt: -1 })
    .populate("userId")
    .populate("eventId")
    .lean();

  return bookings.map((booking) => ({
    id: String(booking._id),
    bookingCode: booking.bookingCode,
    status: booking.status,
    total: booking.pricing.finalAmount,
    createdAt: new Date(booking.createdAt).toISOString(),
    userName: (booking.userId as { name?: string })?.name ?? "User",
    eventTitle: (booking.eventId as { title?: string })?.title ?? "Event",
  }));
}

export async function listAdminUsers() {
  await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    return [];
  }

  await connectToDatabase();
  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  return users.map((user) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    loyaltyTier: user.loyaltyTier,
    studentVerificationStatus: user.studentVerificationStatus,
    createdAt: new Date(user.createdAt).toISOString(),
  }));
}

export async function listStudentVerifications() {
  await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    return [];
  }

  await connectToDatabase();
  const verifications = await StudentVerification.find({})
    .sort({ createdAt: -1 })
    .populate("userId")
    .lean();

  return verifications.map((verification) => ({
    id: String(verification._id),
    userName: (verification.userId as { name?: string })?.name ?? "User",
    email: (verification.userId as { email?: string })?.email ?? "",
    status: verification.status,
    documentPath: verification.documentPath,
    notes: verification.notes,
    createdAt: new Date(verification.createdAt).toISOString(),
  }));
}

export async function reviewStudentVerification(id: string, input: StudentReviewInput) {
  const session = await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    throw new Error("Database is required for verification review.");
  }

  const data = studentReviewSchema.parse(input);
  await connectToDatabase();

  const verification = await StudentVerification.findById(id);
  if (!verification) {
    throw new Error("Verification request not found.");
  }

  verification.status = data.status;
  verification.notes = data.notes;
  verification.reviewedBy = new Types.ObjectId(session.sub);
  verification.reviewedAt = new Date();
  await verification.save();

  await User.findByIdAndUpdate(verification.userId, {
    studentVerificationStatus: data.status,
  });

  await writeAuditLog({
    actorUserId: session.sub,
    action: "REVIEW",
    entityType: "StudentVerification",
    entityId: id,
    after: verification.toObject(),
  });

  return { message: "Verification updated successfully." };
}

export async function getSalesReport() {
  await requireAdminApiSession();

  if (!env.MONGODB_URI) {
    return {
      totalRevenue: 0,
      confirmedBookings: 0,
      averageOrderValue: 0,
    };
  }

  await connectToDatabase();
  const report = await Booking.aggregate([
    { $match: { status: "CONFIRMED" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$pricing.finalAmount" },
        confirmedBookings: { $sum: 1 },
      },
    },
  ]);

  const totalRevenue = report[0]?.totalRevenue ?? 0;
  const confirmedBookings = report[0]?.confirmedBookings ?? 0;

  return {
    totalRevenue,
    confirmedBookings,
    averageOrderValue:
      confirmedBookings > 0 ? Math.round(totalRevenue / confirmedBookings) : 0,
  };
}
