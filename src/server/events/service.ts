import { demoEvents, type DemoEvent } from "@/lib/demo-data";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { Event } from "@/models/Event";
import { TicketType } from "@/models/TicketType";
import type { EventDetail, EventListItem, EventTicketView } from "@/types/events";

type EventFilters = {
  q?: string;
  category?: string;
  city?: string;
  featured?: boolean;
};

function toTicketView(ticket: {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantityTotal: number;
  quantitySold: number;
  benefits: string[];
}): EventTicketView {
  return {
    ...ticket,
    quantityRemaining: Math.max(ticket.quantityTotal - ticket.quantitySold, 0),
  };
}

function toDemoEventListItem(event: DemoEvent): EventListItem {
  return {
    id: event.id,
    _id: event.id,
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    category: event.category,
    city: event.city,
    venueName: event.venueName,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    organizerName: event.organizerName,
    posterTone: event.posterTone,
    featured: event.featured,
    tags: event.tags,
    priceFrom: event.priceFrom,
    ticketCount: event.ticketTypes.length,
  };
}

function toDemoEventDetail(event: DemoEvent): EventDetail {
  return {
    ...toDemoEventListItem(event),
    description: event.description,
    venueAddress: event.venueAddress,
    organizerEmail: event.organizerEmail,
    mapUrl: event.mapUrl,
    ticketTypes: event.ticketTypes.map(toTicketView),
  };
}

function applyFilters(events: EventListItem[], filters?: EventFilters) {
  const q = filters?.q?.trim().toLowerCase();

  return events.filter((event) => {
    const matchesQuery = q
      ? [event.title, event.summary, event.category, event.city, event.organizerName, ...event.tags]
          .join(" ")
          .toLowerCase()
          .includes(q)
      : true;
    const matchesCategory =
      filters?.category && filters.category !== "all"
        ? event.category.toLowerCase() === filters.category.toLowerCase()
        : true;
    const matchesCity =
      filters?.city && filters.city !== "all"
        ? event.city.toLowerCase() === filters.city.toLowerCase()
        : true;
    const matchesFeatured = filters?.featured ? event.featured : true;

    return matchesQuery && matchesCategory && matchesCity && matchesFeatured;
  });
}

async function getDbEvents(): Promise<EventListItem[]> {
  await connectToDatabase();

  const events = await Event.find({ status: "PUBLISHED" })
    .sort({ startsAt: 1 })
    .lean();

  const eventIds = events.map((event) => event._id);
  const ticketTypes = await TicketType.find({ eventId: { $in: eventIds } }).lean();

  return events.map((event) => {
    const eventTickets = ticketTypes.filter(
      (ticket) => String(ticket.eventId) === String(event._id),
    );
    const priceFrom =
      eventTickets.length > 0
        ? Math.min(...eventTickets.map((ticket) => ticket.price))
        : 0;

    return {
      id: String(event._id),
      _id: String(event._id),
      title: event.title,
      slug: event.slug,
      summary: event.summary,
      category: event.category,
      city: event.city,
      venueName: event.venueName,
      startsAt: new Date(event.startsAt).toISOString(),
      endsAt: new Date(event.endsAt).toISOString(),
      organizerName: event.organizerName,
      posterTone: "from-[#11213f] via-[#224d61] to-[#d97706]",
      featured: Boolean(event.settings?.featured),
      tags: event.tags ?? [],
      priceFrom,
      ticketCount: eventTickets.length,
    };
  });
}

async function getDbEventBySlug(slug: string): Promise<EventDetail | null> {
  await connectToDatabase();

  const event = await Event.findOne({ slug, status: "PUBLISHED" }).lean();

  if (!event) {
    return null;
  }

  const ticketTypes = await TicketType.find({ eventId: event._id }).lean();
  const ticketViews = ticketTypes.map((ticket) =>
    toTicketView({
      id: String(ticket._id),
      name: ticket.name,
      description: ticket.description,
      price: ticket.price,
      currency: ticket.currency,
      quantityTotal: ticket.quantityTotal,
      quantitySold: ticket.quantitySold,
      benefits: ticket.benefits ?? [],
    }),
  );

  return {
    id: String(event._id),
    _id: String(event._id),
    title: event.title,
    slug: event.slug,
    summary: event.summary,
    description: event.description,
    category: event.category,
    city: event.city,
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    startsAt: new Date(event.startsAt).toISOString(),
    endsAt: new Date(event.endsAt).toISOString(),
    organizerName: event.organizerName,
    organizerEmail: event.organizerEmail,
    mapUrl: event.mapUrl || "",
    posterTone: "from-[#11213f] via-[#224d61] to-[#d97706]",
    featured: Boolean(event.settings?.featured),
    tags: event.tags ?? [],
    priceFrom:
      ticketViews.length > 0
        ? Math.min(...ticketViews.map((ticket) => ticket.price))
        : 0,
    ticketCount: ticketViews.length,
    ticketTypes: ticketViews,
  };
}

export async function getPublicEvents(filters?: EventFilters) {
  let events: EventListItem[];

  if (env.MONGODB_URI) {
    try {
      events = await getDbEvents();
    } catch {
      events = demoEvents.map(toDemoEventListItem);
    }
  } else {
    events = demoEvents.map(toDemoEventListItem);
  }

  return applyFilters(events, filters);
}

export async function getPublicEventBySlug(slug: string) {
  if (env.MONGODB_URI) {
    try {
      const event = await getDbEventBySlug(slug);
      if (event) {
        return event;
      }
    } catch {
      const demoEvent = demoEvents.find((event) => event.slug === slug);
      return demoEvent ? toDemoEventDetail(demoEvent) : null;
    }
  }

  const demoEvent = demoEvents.find((event) => event.slug === slug);
  return demoEvent ? toDemoEventDetail(demoEvent) : null;
}

export function getEventFilterOptions() {
  return {
    categories: Array.from(new Set(demoEvents.map((event) => event.category))).sort(),
    cities: Array.from(new Set(demoEvents.map((event) => event.city))).sort(),
  };
}
