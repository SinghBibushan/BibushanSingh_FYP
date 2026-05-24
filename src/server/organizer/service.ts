import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import {
  organizerEventSchema,
  type OrganizerEventInput,
} from "@/lib/validations/admin";
import { getTicketSaleWindow, slugify } from "@/lib/utils";
import { Booking } from "@/models/Booking";
import { Event } from "@/models/Event";
import { TicketType } from "@/models/TicketType";

async function requireOrganizerApiSession() {
  const session = await getSession();

  if (!session) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (session.role !== "ORGANIZER") {
    throw new AppError("Forbidden.", 403, "FORBIDDEN");
  }

  return session;
}

export async function getOrganizerOverview() {
  const session = await requireOrganizerApiSession();

  if (!env.MONGODB_URI) {
    return {
      metrics: [
        { label: "My Events", value: "0", note: "Database not configured" },
        { label: "Pending Review", value: "0", note: "Submit events for admin approval" },
        { label: "Published", value: "0", note: "Visible to customers after approval" },
        { label: "Confirmed Sales", value: "NPR 0", note: "Organizer analytics require database access" },
      ],
    };
  }

  await connectToDatabase();

  const organizerEvents = await Event.find({
    organizerUserId: new Types.ObjectId(session.sub),
  })
    .select({ _id: 1, status: 1 })
    .lean();

  const eventIds = organizerEvents.map((event) => event._id);
  const sales =
    eventIds.length > 0
      ? await Booking.aggregate([
          {
            $match: {
              eventId: { $in: eventIds },
              status: "CONFIRMED",
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$pricing.finalAmount" },
              confirmedBookings: { $sum: 1 },
            },
          },
        ])
      : [];

  return {
    metrics: [
      {
        label: "My Events",
        value: String(organizerEvents.length),
        note: "Draft, pending, published, and rejected combined",
      },
      {
        label: "Pending Review",
        value: String(
          organizerEvents.filter((event) => event.status === "PENDING_APPROVAL").length,
        ),
        note: "Awaiting admin decision",
      },
      {
        label: "Published",
        value: String(organizerEvents.filter((event) => event.status === "PUBLISHED").length),
        note: "Live customer-facing listings",
      },
      {
        label: "Confirmed Sales",
        value: `NPR ${sales[0]?.totalRevenue ?? 0}`,
        note: `${sales[0]?.confirmedBookings ?? 0} confirmed booking(s)`,
      },
    ],
  };
}

export async function listOrganizerEvents() {
  const session = await requireOrganizerApiSession();

  if (!env.MONGODB_URI) {
    return [];
  }

  await connectToDatabase();

  const events = await Event.find({
    organizerUserId: new Types.ObjectId(session.sub),
  })
    .sort({ createdAt: -1 })
    .lean();

  const eventIds = events.map((event) => event._id);
  const [ticketTypes, sales] = await Promise.all([
    TicketType.find({ eventId: { $in: eventIds } }).lean(),
    Booking.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: "CONFIRMED",
        },
      },
      {
        $group: {
          _id: "$eventId",
          confirmedBookings: { $sum: 1 },
          revenue: { $sum: "$pricing.finalAmount" },
        },
      },
    ]),
  ]);

  return events.map((event) => {
    const forEvent = ticketTypes.filter(
      (ticket) => String(ticket.eventId) === String(event._id),
    );
    const saleForEvent = sales.find(
      (entry) => String(entry._id) === String(event._id),
    );

    return {
      id: String(event._id),
      title: event.title,
      slug: event.slug,
      category: event.category,
      city: event.city,
      startsAt: new Date(event.startsAt).toISOString(),
      status: event.status,
      reviewNotes: event.reviewNotes ?? "",
      featured: Boolean(event.settings?.featured),
      priceFrom: forEvent.length ? Math.min(...forEvent.map((ticket) => ticket.price)) : 0,
      ticketTypes: forEvent.length,
      confirmedBookings: saleForEvent?.confirmedBookings ?? 0,
      revenue: saleForEvent?.revenue ?? 0,
    };
  });
}

export async function createOrganizerEvent(input: OrganizerEventInput) {
  const session = await requireOrganizerApiSession();

  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for organizer event creation.", 503, "DB_REQUIRED");
  }

  const data = organizerEventSchema.parse(input);
  await connectToDatabase();

  const baseSlug = slugify(data.title);
  let slug = baseSlug;
  let suffix = 2;

  while (await Event.findOne({ slug }).lean()) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const event = await Event.create({
    title: data.title,
    slug,
    summary: data.summary,
    description: data.description,
    category: data.category,
    posterUrl: "",
    status: data.submissionMode,
    startsAt: new Date(data.startsAt),
    endsAt: new Date(data.endsAt),
    city: data.city,
    venueName: data.venueName,
    venueAddress: data.venueAddress,
    mapUrl: "",
    organizerUserId: new Types.ObjectId(session.sub),
    organizerName: data.organizerName,
    organizerEmail: data.organizerEmail,
    tags: data.tags
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    settings: {
      featured: false,
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

  return {
    message:
      data.submissionMode === "PENDING_APPROVAL"
        ? "Event submitted for admin approval."
        : "Event saved as draft.",
    id: String(event._id),
  };
}

export async function submitOrganizerEvent(id: string) {
  const session = await requireOrganizerApiSession();

  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for organizer submissions.", 503, "DB_REQUIRED");
  }

  await connectToDatabase();

  const event = await Event.findOne({
    _id: id,
    organizerUserId: new Types.ObjectId(session.sub),
  });

  if (!event) {
    throw new AppError("Event not found.", 404, "NOT_FOUND");
  }

  if (event.status === "PUBLISHED") {
    throw new AppError("Published events do not need re-submission.", 400, "ALREADY_PUBLISHED");
  }

  event.status = "PENDING_APPROVAL";
  event.reviewNotes = "";
  event.reviewedBy = null;
  event.reviewedAt = null;
  await event.save();

  return { message: "Event submitted for admin approval." };
}
