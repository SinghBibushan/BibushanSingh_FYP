import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Booking } from "@/models/Booking";
import { Event } from "@/models/Event";
import { Ticket } from "@/models/Ticket";
import { TicketType } from "@/models/TicketType";
import { User } from "@/models/User";

function makeTicketCode() {
  return `TIX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createQrPayload({
  ticketCode,
  bookingCode,
  eventTitle,
  holderName,
}: {
  ticketCode: string;
  bookingCode: string;
  eventTitle: string;
  holderName: string;
}) {
  return JSON.stringify({
    ticketCode,
    bookingCode,
    eventTitle,
    holderName,
    issuedBy: "EventEase",
  });
}

export async function issueTicketsForBooking(bookingId: string) {
  await connectToDatabase();

  const existingTickets = await Ticket.countDocuments({
    bookingId: new Types.ObjectId(bookingId),
  });

  if (existingTickets > 0) {
    return;
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found for ticket issuance.");
  }

  const user = await User.findById(booking.userId);
  const event = await Event.findById(booking.eventId);

  if (!user || !event) {
    throw new Error("Missing event or user for ticket issuance.");
  }

  const ticketsToCreate = booking.ticketSelections.flatMap(
    (selection: {
      ticketTypeId: Types.ObjectId;
      name: string;
      quantity: number;
    }) => {
      return Array.from({ length: selection.quantity }, () => {
        const ticketCode = makeTicketCode();
        return {
          ticketCode,
          bookingId: booking._id,
          eventId: booking.eventId,
          userId: booking.userId,
          ticketTypeId: selection.ticketTypeId,
          holderName: user.name,
          qrPayload: createQrPayload({
            ticketCode,
            bookingCode: booking.bookingCode,
            eventTitle: event.title,
            holderName: user.name,
          }),
          pdfPath: "",
          status: "ACTIVE",
          issuedAt: new Date(),
        };
      });
    },
  );

  await Ticket.insertMany(ticketsToCreate);
}

export async function getCurrentUserTickets() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  await connectToDatabase();

  const tickets = await Ticket.find({ userId: new Types.ObjectId(session.sub) })
    .sort({ createdAt: -1 })
    .lean();

  const eventIds = Array.from(new Set(tickets.map((ticket) => String(ticket.eventId))));
  const ticketTypeIds = Array.from(
    new Set(tickets.map((ticket) => String(ticket.ticketTypeId))),
  );

  const [events, ticketTypes, bookings] = await Promise.all([
    Event.find({ _id: { $in: eventIds } }).lean(),
    TicketType.find({ _id: { $in: ticketTypeIds } }).lean(),
    Booking.find({
      _id: { $in: tickets.map((ticket) => ticket.bookingId) },
    }).lean(),
  ]);

  return Promise.all(
    tickets.map(async (ticket) => {
      const event = events.find((item) => String(item._id) === String(ticket.eventId));
      const ticketType = ticketTypes.find(
        (item) => String(item._id) === String(ticket.ticketTypeId),
      );
      const booking = bookings.find(
        (item) => String(item._id) === String(ticket.bookingId),
      );

      return {
        id: String(ticket._id),
        ticketCode: ticket.ticketCode,
        status: ticket.status,
        holderName: ticket.holderName,
        issuedAt: ticket.issuedAt,
        eventTitle: event?.title ?? "Event",
        eventSlug: event?.slug ?? "",
        eventVenue: event?.venueName ?? "",
        eventStartsAt: event?.startsAt ? new Date(event.startsAt).toISOString() : "",
        bookingCode: booking?.bookingCode ?? "",
        ticketTypeName: ticketType?.name ?? "Ticket",
        qrCodeDataUrl: await QRCode.toDataURL(ticket.qrPayload, {
          margin: 1,
          width: 220,
        }),
      };
    }),
  );
}

export async function getTicketForDownload(ticketCode: string) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  await connectToDatabase();

  const ticket = await Ticket.findOne({ ticketCode }).lean();

  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  if (session.role !== "ADMIN" && String(ticket.userId) !== session.sub) {
    throw new Error("Unauthorized.");
  }

  const [event, booking, ticketType] = await Promise.all([
    Event.findById(ticket.eventId).lean(),
    Booking.findById(ticket.bookingId).lean(),
    TicketType.findById(ticket.ticketTypeId).lean(),
  ]);

  if (!event || !booking || !ticketType) {
    throw new Error("Ticket data is incomplete.");
  }

  return {
    ticket,
    event,
    booking,
    ticketType,
  };
}

export async function buildTicketPdf(ticketCode: string) {
  const data = await getTicketForDownload(ticketCode);
  const qrDataUrl = await QRCode.toDataURL(data.ticket.qrPayload, {
    margin: 1,
    width: 240,
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 36,
    y: 36,
    width: 523,
    height: 770,
    color: rgb(0.988, 0.976, 0.949),
  });
  page.drawRectangle({
    x: 36,
    y: 690,
    width: 523,
    height: 116,
    color: rgb(0.122, 0.306, 0.373),
  });

  page.drawText("EventEase Ticket", {
    x: 56,
    y: 760,
    size: 28,
    font: bold,
    color: rgb(0.99, 0.99, 0.99),
  });

  page.drawText(data.event.title, {
    x: 56,
    y: 724,
    size: 18,
    font,
    color: rgb(0.95, 0.95, 0.95),
  });

  const qrImage = await pdf.embedPng(qrDataUrl);
  page.drawImage(qrImage, {
    x: 360,
    y: 470,
    width: 160,
    height: 160,
  });

  const rows = [
    ["Ticket code", data.ticket.ticketCode],
    ["Booking code", data.booking.bookingCode],
    ["Holder", data.ticket.holderName],
    ["Ticket type", data.ticketType.name],
    ["Venue", data.event.venueName],
    ["Address", data.event.venueAddress],
    ["Schedule", formatDate(data.event.startsAt)],
    ["Amount paid", formatCurrency(data.booking.pricing.finalAmount, data.booking.pricing.currency)],
  ];

  let y = 640;
  for (const [label, value] of rows) {
    page.drawText(label, {
      x: 56,
      y,
      size: 10,
      font: bold,
      color: rgb(0.46, 0.46, 0.46),
    });
    page.drawText(value, {
      x: 56,
      y: y - 18,
      size: 13,
      font,
      color: rgb(0.08, 0.13, 0.24),
      maxWidth: 260,
    });
    y -= 62;
  }

  page.drawText("QR code can be scanned at venue entry.", {
    x: 360,
    y: 448,
    size: 10,
    font,
    color: rgb(0.46, 0.46, 0.46),
  });

  page.drawText(`Generated by EventEase on ${formatDate(new Date().toISOString())}`, {
    x: 56,
    y: 64,
    size: 10,
    font,
    color: rgb(0.46, 0.46, 0.46),
  });

  return pdf.save();
}

export async function getLoyaltySnapshot() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  await connectToDatabase();
  const user = await User.findById(session.sub).lean();

  if (!user) {
    throw new Error("User not found.");
  }

  const confirmedBookings = await Booking.find({
    userId: new Types.ObjectId(session.sub),
    status: "CONFIRMED",
  })
    .sort({ confirmedAt: -1 })
    .lean();

  return {
    points: user.loyaltyPoints,
    tier: user.loyaltyTier,
    totalConfirmedBookings: confirmedBookings.length,
    totalSpent: confirmedBookings.reduce(
      (sum, booking) => sum + booking.pricing.finalAmount,
      0,
    ),
    recentRewards: confirmedBookings.slice(0, 5).map((booking) => ({
      bookingCode: booking.bookingCode,
      pointsEarned: booking.loyaltyPointsEarned,
      pointsRedeemed: booking.loyaltyPointsRedeemed,
      confirmedAt: booking.confirmedAt,
    })),
  };
}

export function getPublicTicketUrl(ticketCode: string) {
  return new URL(`/api/tickets/${ticketCode}/pdf`, env.APP_URL).toString();
}
