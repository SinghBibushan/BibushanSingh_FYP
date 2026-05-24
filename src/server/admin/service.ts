import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { demoEvents, demoPromoCodes } from "@/lib/demo-data";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import {
  adminEventSchema,
  adminEventReviewSchema,
  adminPromoCodeSchema,
  studentReviewSchema,
  type AdminEventInput,
  type AdminEventReviewInput,
  type AdminPromoCodeInput,
  type StudentReviewInput,
} from "@/lib/validations/admin";
import { getTicketSaleWindow, slugify } from "@/lib/utils";
import { AuditLog } from "@/models/AuditLog";
import { Booking } from "@/models/Booking";
import { ChatMessage } from "@/models/ChatMessage";
import { Event } from "@/models/Event";
import { Notification } from "@/models/Notification";
import { NotificationLog } from "@/models/NotificationLog";
import { Payment } from "@/models/Payment";
import { PromoCode } from "@/models/PromoCode";
import { Review } from "@/models/Review";
import { StudentVerification } from "@/models/StudentVerification";
import { Ticket } from "@/models/Ticket";
import { TicketType } from "@/models/TicketType";
import { User } from "@/models/User";
import { Wishlist } from "@/models/Wishlist";
import { logNotification, createInAppNotification } from "@/server/notifications/service";

async function requireAdminApiSession() {
  const session = await getSession();

  if (!session) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (session.role !== "ADMIN") {
    throw new AppError("Forbidden.", 403, "FORBIDDEN");
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
  const [eventCount, pendingEventCount, promoCount, bookingCount, userCount, sales] = await Promise.all([
    Event.countDocuments({ status: "PUBLISHED" }),
    Event.countDocuments({ status: "PENDING_APPROVAL" }),
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
      { label: "Pending Approvals", value: String(pendingEventCount), note: "Organizer submissions awaiting review" },
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
      organizerName: event.organizerName,
      category: event.category,
      city: event.city,
      startsAt: event.startsAt,
      status: "PUBLISHED",
      reviewNotes: "",
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
      organizerName: event.organizerName,
      category: event.category,
      city: event.city,
      startsAt: new Date(event.startsAt).toISOString(),
      status: event.status,
      reviewNotes: event.reviewNotes ?? "",
      featured: Boolean(event.settings?.featured),
      priceFrom: forEvent.length ? Math.min(...forEvent.map((ticket) => ticket.price)) : 0,
      ticketTypes: forEvent.length,
    };
  });
}

export async function createAdminEvent(input: AdminEventInput) {
  const session = await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for admin event creation.", 503, "DB_REQUIRED");
  }

  const data = adminEventSchema.parse(input);
  await connectToDatabase();

  const slug = slugify(data.title);
  const existing = await Event.findOne({ slug });
  if (existing) {
    throw new AppError(
      "An event with a similar title already exists.",
      409,
      "EVENT_ALREADY_EXISTS",
    );
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
    organizerUserId: null,
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
    data.ticketTypes.map((ticket) => {
      const { saleStartsAt, saleEndsAt } = getTicketSaleWindow(data.startsAt, data.endsAt);

      return {
        eventId: event._id,
        name: ticket.name,
        description: ticket.description,
        price: ticket.price,
        currency: "NPR",
        quantityTotal: ticket.quantityTotal,
        quantitySold: 0,
        saleStartsAt,
        saleEndsAt,
        perUserLimit: ticket.perUserLimit,
        benefits: [],
      };
    }),
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

  // Notify all users about new event
  const users = await User.find({}).lean();
  const notificationPromises = users.map(async (user) => {
    await createInAppNotification({
      userId: String(user._id),
      type: "NEW_EVENT",
      title: "New Event Available!",
      message: `Check out the new event: ${event.title} on ${new Date(event.startsAt).toLocaleDateString()}`,
      link: `/events/${event.slug}`,
      metadata: {
        eventId: String(event._id),
        eventTitle: event.title,
      },
    });
  });

  await Promise.all(notificationPromises);

  return { message: "Event created successfully.", id: String(event._id) };
}

export async function reviewAdminEvent(id: string, input: AdminEventReviewInput) {
  const session = await requireAdminApiSession();

  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for event review.", 503, "DB_REQUIRED");
  }

  const data = adminEventReviewSchema.parse(input);
  await connectToDatabase();

  const event = await Event.findById(id);

  if (!event) {
    throw new AppError("Event not found.", 404, "NOT_FOUND");
  }

  const before = event.toObject();
  event.status = data.status;
  event.reviewNotes = data.reviewNotes;
  event.reviewedBy = new Types.ObjectId(session.sub);
  event.reviewedAt = new Date();
  await event.save();

  await writeAuditLog({
    actorUserId: session.sub,
    action: "REVIEW",
    entityType: "Event",
    entityId: id,
    before,
    after: event.toObject(),
  });

  if (event.organizerUserId) {
    const organizer = await User.findById(event.organizerUserId);

    if (organizer) {
      const title =
        data.status === "PUBLISHED" ? "Event approved and published" : "Event submission rejected";
      const message =
        data.status === "PUBLISHED"
          ? `Your event ${event.title} has been approved and is now live for customers.`
          : `Your event ${event.title} was rejected. ${data.reviewNotes || "Please update the event details and submit it again."}`;

      await logNotification({
        userId: String(organizer._id),
        email: organizer.email,
        channel: "EMAIL",
        type: "EVENT_UPDATE",
        subject: title,
        message,
        payload: {
          eventId: String(event._id),
          eventTitle: event.title,
          status: data.status,
          reviewNotes: data.reviewNotes,
        },
      });

      await createInAppNotification({
        userId: String(organizer._id),
        type: "EVENT_UPDATE",
        title,
        message,
        link: "/organizer/events",
        metadata: {
          eventId: String(event._id),
          status: data.status,
        },
      });
    }
  }

  return { message: `Event ${data.status === "PUBLISHED" ? "published" : "rejected"} successfully.` };
}

export async function deleteAdminEvent(id: string) {
  const session = await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for admin event deletion.", 503, "DB_REQUIRED");
  }

  await connectToDatabase();
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError("Event not found.", 404, "NOT_FOUND");
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
      perUserUsageLimit: promo.perUserUsageLimit,
      applicableEvents:
        promo.applicableSlugs.length > 0 ? promo.applicableSlugs : ["All events"],
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      isActive: promo.isActive,
    }));
  }

  await connectToDatabase();
  const promoCodes = await PromoCode.find({}).sort({ createdAt: -1 }).lean();
  const applicableEventIds = Array.from(
    new Set(
      promoCodes.flatMap((promo) =>
        (promo.applicableEventIds ?? []).map((id: Types.ObjectId) => String(id)),
      ),
    ),
  );
  const events =
    applicableEventIds.length > 0
      ? await Event.find({ _id: { $in: applicableEventIds } })
          .select({ _id: 1, title: 1 })
          .lean()
      : [];

  return promoCodes.map((promo) => ({
    id: String(promo._id),
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    minimumSubtotal: promo.minimumSubtotal,
    usageLimit: promo.usageLimit,
    usedCount: promo.usedCount,
    perUserUsageLimit: promo.perUserUsageLimit ?? 1,
    applicableEvents:
      promo.applicableEventIds?.length
        ? promo.applicableEventIds.map((eventId: Types.ObjectId) => {
            const event = events.find((item) => String(item._id) === String(eventId));
            return event?.title ?? "Unknown event";
          })
        : ["All events"],
    validUntil: new Date(promo.validUntil).toISOString(),
    isActive: promo.isActive,
  }));
}

export async function createAdminPromoCode(input: AdminPromoCodeInput) {
  const session = await requireAdminApiSession();
  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for promo code creation.", 503, "DB_REQUIRED");
  }

  const data = adminPromoCodeSchema.parse(input);
  await connectToDatabase();

  const existing = await PromoCode.findOne({ code: data.code });
  if (existing) {
    throw new AppError("Promo code already exists.", 409, "PROMO_EXISTS");
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
    perUserUsageLimit: data.perUserUsageLimit,
    applicableEventIds: data.applicableEventIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id)),
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
    throw new AppError("Database is required for verification review.", 503, "DB_REQUIRED");
  }

  const data = studentReviewSchema.parse(input);
  await connectToDatabase();

  const verification = await StudentVerification.findById(id);
  if (!verification) {
    throw new AppError("Verification request not found.", 404, "NOT_FOUND");
  }

  verification.status = data.status;
  verification.notes = data.notes;
  verification.reviewedBy = new Types.ObjectId(session.sub);
  verification.reviewedAt = new Date();
  await verification.save();

  const user = await User.findByIdAndUpdate(verification.userId, {
    studentVerificationStatus: data.status,
  });

  await writeAuditLog({
    actorUserId: session.sub,
    action: "REVIEW",
    entityType: "StudentVerification",
    entityId: id,
    after: verification.toObject(),
  });

  // Send notification to user
  if (user) {
    const statusText = data.status === "APPROVED" ? "approved" : "rejected";
    const message = data.status === "APPROVED"
      ? "Your student verification has been approved! You can now use student discounts when booking tickets."
      : `Your student verification has been rejected. ${data.notes || "Please contact support for more information."}`;

    await logNotification({
      userId: String(user._id),
      email: user.email,
      channel: "EMAIL",
      type: "STUDENT_VERIFIED",
      subject: `Student Verification ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message,
      payload: {
        status: data.status,
        notes: data.notes,
      },
    });

    // Create in-app notification
    await createInAppNotification({
      userId: String(user._id),
      type: "STUDENT_VERIFIED",
      title: `Student Verification ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
      message,
      link: "/profile",
      metadata: {
        status: data.status,
      },
    });
  }

  return { message: "Verification updated successfully." };
}

export async function adminDeleteUser(id: string) {
  const session = await requireAdminApiSession();

  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for user deletion.", 503, "DB_REQUIRED");
  }

  await connectToDatabase();

  if (session.sub === id) {
    throw new AppError("Cannot delete your own account.", 400, "SELF_DELETE_FORBIDDEN");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found.", 404, "NOT_FOUND");
  }

  const before = user.toObject();
  const bookingIds = await Booking.find({ userId: user._id }).distinct("_id");

  await Promise.all([
    Notification.deleteMany({ userId: user._id }),
    NotificationLog.deleteMany({ userId: user._id }),
    ChatMessage.deleteMany({ userId: user._id }),
    Review.deleteMany({ userId: user._id }),
    Wishlist.deleteMany({ userId: user._id }),
    Ticket.deleteMany({ userId: user._id }),
    Payment.deleteMany({ bookingId: { $in: bookingIds } }),
    Booking.deleteMany({ userId: user._id }),
    StudentVerification.deleteMany({ userId: user._id }),
    User.findByIdAndDelete(id),
  ]);

  await writeAuditLog({
    actorUserId: session.sub,
    action: "DELETE",
    entityType: "User",
    entityId: id,
    before,
  });

  return { message: "User deleted successfully." };
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
