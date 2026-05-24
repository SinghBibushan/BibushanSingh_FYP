import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { ticketCheckInSchema, type TicketCheckInInput } from "@/lib/validations/ticket";
import { formatDate } from "@/lib/utils";
import { Booking } from "@/models/Booking";
import { Event } from "@/models/Event";
import { Ticket } from "@/models/Ticket";
import { TicketCheckInLog } from "@/models/TicketCheckInLog";
import { User } from "@/models/User";
import { createInAppNotification, logNotification } from "@/server/notifications/service";

async function requireStaffApiSession() {
  const session = await getSession();

  if (!session) {
    throw new AppError("Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (session.role !== "STAFF" && session.role !== "ADMIN") {
    throw new AppError("Forbidden.", 403, "FORBIDDEN");
  }

  return session;
}

function extractTicketCode(scanInput: string) {
  const raw = scanInput.trim();

  if (!raw) {
    throw new AppError("Paste a QR payload or ticket code.", 400, "INVALID_SCAN");
  }

  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as { ticketCode?: string };

      if (parsed.ticketCode?.trim()) {
        return parsed.ticketCode.trim().toUpperCase();
      }
    } catch {
      throw new AppError("QR payload could not be parsed.", 400, "INVALID_QR_PAYLOAD");
    }
  }

  return raw.replace(/\s+/g, "").toUpperCase();
}

async function writeCheckInLog(input: {
  ticketId?: Types.ObjectId | null;
  bookingId?: Types.ObjectId | null;
  eventId?: Types.ObjectId | null;
  attendeeUserId?: Types.ObjectId | null;
  staffUserId: string;
  scannedCode: string;
  gate?: string;
  outcome: "SUCCESS" | "DENIED";
  reason?: string;
  checkedInAt?: Date;
}) {
  await TicketCheckInLog.create({
    ticketId: input.ticketId ?? null,
    bookingId: input.bookingId ?? null,
    eventId: input.eventId ?? null,
    attendeeUserId: input.attendeeUserId ?? null,
    staffUserId: new Types.ObjectId(input.staffUserId),
    scannedCode: input.scannedCode,
    gate: input.gate ?? "",
    outcome: input.outcome,
    reason: input.reason ?? "",
    checkedInAt: input.checkedInAt ?? new Date(),
  });
}

export async function getStaffCheckInDashboard() {
  await requireStaffApiSession();

  if (!env.MONGODB_URI) {
    return {
      metrics: [
        { label: "Active tickets", value: "0", note: "Database not configured" },
        { label: "Checked in", value: "0", note: "No ticket scans recorded yet" },
        { label: "Today success", value: "0", note: "Successful venue entries today" },
        { label: "Today denied", value: "0", note: "Rejected or duplicate scans today" },
      ],
      recentLogs: [],
    };
  }

  await connectToDatabase();

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const [activeTickets, usedTickets, todaySuccess, todayDenied, recentLogs] = await Promise.all([
    Ticket.countDocuments({ status: "ACTIVE" }),
    Ticket.countDocuments({ status: "USED" }),
    TicketCheckInLog.countDocuments({
      outcome: "SUCCESS",
      checkedInAt: { $gte: dayStart },
    }),
    TicketCheckInLog.countDocuments({
      outcome: "DENIED",
      checkedInAt: { $gte: dayStart },
    }),
    TicketCheckInLog.find({})
      .sort({ checkedInAt: -1 })
      .limit(12)
      .lean(),
  ]);

  const eventIds = Array.from(
    new Set(
      recentLogs
        .map((log) => (log.eventId ? String(log.eventId) : ""))
        .filter(Boolean),
    ),
  );
  const staffIds = Array.from(
    new Set(
      recentLogs
        .map((log) => (log.staffUserId ? String(log.staffUserId) : ""))
        .filter(Boolean),
    ),
  );
  const attendeeIds = Array.from(
    new Set(
      recentLogs
        .map((log) => (log.attendeeUserId ? String(log.attendeeUserId) : ""))
        .filter(Boolean),
    ),
  );

  const [events, staffUsers, attendees] = await Promise.all([
    eventIds.length ? Event.find({ _id: { $in: eventIds } }).lean() : [],
    staffIds.length ? User.find({ _id: { $in: staffIds } }).lean() : [],
    attendeeIds.length ? User.find({ _id: { $in: attendeeIds } }).lean() : [],
  ]);

  return {
    metrics: [
      { label: "Active tickets", value: String(activeTickets), note: "Tickets still eligible for entry" },
      { label: "Checked in", value: String(usedTickets), note: "Tickets already redeemed at venue" },
      { label: "Today success", value: String(todaySuccess), note: "Successful scans recorded today" },
      { label: "Today denied", value: String(todayDenied), note: "Invalid, cancelled, or duplicate attempts today" },
    ],
    recentLogs: recentLogs.map((log) => ({
      id: String(log._id),
      scannedCode: log.scannedCode,
      gate: log.gate ?? "",
      outcome: log.outcome,
      reason: log.reason ?? "",
      checkedInAt: new Date(log.checkedInAt).toISOString(),
      eventTitle:
        events.find((event) => String(event._id) === String(log.eventId))?.title ?? "Unknown event",
      attendeeName:
        attendees.find((user) => String(user._id) === String(log.attendeeUserId))?.name ??
        "Unknown attendee",
      staffName:
        staffUsers.find((user) => String(user._id) === String(log.staffUserId))?.name ??
        "Staff",
    })),
  };
}

export async function checkInTicket(input: TicketCheckInInput) {
  const session = await requireStaffApiSession();

  if (!env.MONGODB_URI) {
    throw new AppError("Database is required for ticket check-in.", 503, "DB_REQUIRED");
  }

  const data = ticketCheckInSchema.parse(input);
  const ticketCode = extractTicketCode(data.scanInput);
  const checkedInAt = new Date();
  await connectToDatabase();

  const ticket = await Ticket.findOne({ ticketCode });

  if (!ticket) {
    await writeCheckInLog({
      staffUserId: session.sub,
      scannedCode: ticketCode,
      gate: data.gate,
      outcome: "DENIED",
      reason: "Ticket not found.",
      checkedInAt,
    });
    throw new AppError("Ticket not found.", 404, "NOT_FOUND");
  }

  const [booking, event, attendee, priorStaff] = await Promise.all([
    Booking.findById(ticket.bookingId),
    Event.findById(ticket.eventId),
    User.findById(ticket.userId),
    ticket.checkedInBy ? User.findById(ticket.checkedInBy) : Promise.resolve(null),
  ]);

  if (!booking || !event || !attendee) {
    await writeCheckInLog({
      ticketId: ticket._id,
      bookingId: booking?._id ?? null,
      eventId: event?._id ?? null,
      attendeeUserId: attendee?._id ?? null,
      staffUserId: session.sub,
      scannedCode: ticketCode,
      gate: data.gate,
      outcome: "DENIED",
      reason: "Ticket data is incomplete.",
      checkedInAt,
    });
    throw new AppError("Ticket data is incomplete.", 400, "TICKET_DATA_INVALID");
  }

  if (booking.status !== "CONFIRMED") {
    await writeCheckInLog({
      ticketId: ticket._id,
      bookingId: booking._id,
      eventId: event._id,
      attendeeUserId: attendee._id,
      staffUserId: session.sub,
      scannedCode: ticketCode,
      gate: data.gate,
      outcome: "DENIED",
      reason: "Booking is not confirmed.",
      checkedInAt,
    });
    throw new AppError("Booking is not confirmed.", 400, "BOOKING_NOT_CONFIRMED");
  }

  if (ticket.status === "CANCELLED") {
    await writeCheckInLog({
      ticketId: ticket._id,
      bookingId: booking._id,
      eventId: event._id,
      attendeeUserId: attendee._id,
      staffUserId: session.sub,
      scannedCode: ticketCode,
      gate: data.gate,
      outcome: "DENIED",
      reason: "Ticket has been cancelled.",
      checkedInAt,
    });
    throw new AppError("Ticket has been cancelled.", 400, "TICKET_CANCELLED");
  }

  if (event.status === "CANCELLED") {
    await writeCheckInLog({
      ticketId: ticket._id,
      bookingId: booking._id,
      eventId: event._id,
      attendeeUserId: attendee._id,
      staffUserId: session.sub,
      scannedCode: ticketCode,
      gate: data.gate,
      outcome: "DENIED",
      reason: "Event has been cancelled.",
      checkedInAt,
    });
    throw new AppError("Event has been cancelled.", 400, "EVENT_CANCELLED");
  }

  if (ticket.status === "USED") {
    const duplicateMessage = `Ticket already used${ticket.checkedInAt ? ` on ${formatDate(ticket.checkedInAt)}` : ""}${priorStaff ? ` by ${priorStaff.name}` : ""}.`;

    await writeCheckInLog({
      ticketId: ticket._id,
      bookingId: booking._id,
      eventId: event._id,
      attendeeUserId: attendee._id,
      staffUserId: session.sub,
      scannedCode: ticketCode,
      gate: data.gate,
      outcome: "DENIED",
      reason: "Duplicate entry attempt.",
      checkedInAt,
    });
    throw new AppError(duplicateMessage, 409, "TICKET_ALREADY_USED");
  }

  ticket.status = "USED";
  ticket.checkedInAt = checkedInAt;
  ticket.checkedInBy = new Types.ObjectId(session.sub);
  ticket.checkInGate = data.gate;
  await ticket.save();

  await writeCheckInLog({
    ticketId: ticket._id,
    bookingId: booking._id,
    eventId: event._id,
    attendeeUserId: attendee._id,
    staffUserId: session.sub,
    scannedCode: ticketCode,
    gate: data.gate,
    outcome: "SUCCESS",
    checkedInAt,
  });

  await createInAppNotification({
    userId: String(attendee._id),
    type: "TICKET_CHECKED_IN",
    title: "Ticket checked in",
    message: `${event.title} entry was validated${data.gate ? ` at ${data.gate}` : ""}.`,
    link: "/tickets",
    metadata: {
      ticketCode,
      eventId: String(event._id),
      gate: data.gate,
    },
  });

  await logNotification({
    userId: String(attendee._id),
    channel: "LOG",
    type: "TICKET_CHECKED_IN",
    subject: "Ticket checked in",
    message: `Ticket ${ticketCode} was scanned for ${event.title}${data.gate ? ` at ${data.gate}` : ""}.`,
    payload: {
      ticketCode,
      eventTitle: event.title,
      gate: data.gate,
    },
  });

  return {
    message: "Ticket check-in completed.",
    ticket: {
      ticketCode,
      status: ticket.status,
      checkedInAt: checkedInAt.toISOString(),
      gate: ticket.checkInGate,
      holderName: ticket.holderName,
      eventTitle: event.title,
      bookingCode: booking.bookingCode,
      attendeeName: attendee.name,
      scannedBy: session.name,
    },
  };
}
