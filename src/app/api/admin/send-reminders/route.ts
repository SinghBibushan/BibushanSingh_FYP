import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { Event } from "@/models/Event";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { logNotification } from "@/server/notifications/service";
import { Types } from "mongoose";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await verifyAuth(req);

    // Only admins can trigger reminders manually
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Calculate date 15 days from now
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 15);

    const startDate = new Date(reminderDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(reminderDate);
    endDate.setHours(23, 59, 59, 999);

    const upcomingEvents = await Event.find({
      startsAt: {
        $gte: startDate,
        $lte: endDate,
      },
      status: "PUBLISHED",
    }).lean();

    let remindersSent = 0;

    for (const event of upcomingEvents) {
      const bookings = await Booking.find({
        eventId: event._id,
        status: "CONFIRMED",
      }).lean();

      const userIds = [...new Set(bookings.map((b) => String(b.userId)))];

      for (const userId of userIds) {
        const user = await User.findById(userId).lean();
        if (!user) continue;

        // Check if reminder already sent
        const existingReminder = await Notification.findOne({
          userId: new Types.ObjectId(userId),
          type: "EVENT_REMINDER",
          "metadata.eventId": String(event._id),
        });

        if (existingReminder) continue;

        const eventDate = new Date(event.startsAt).toLocaleDateString();
        const eventTime = new Date(event.startsAt).toLocaleTimeString();

        await logNotification({
          userId: String(user._id),
          email: user.email,
          channel: "EMAIL",
          type: "EVENT_REMINDER",
          subject: `Reminder: ${event.title} is coming up in 15 days!`,
          message: `Don't forget! Your event "${event.title}" is happening on ${eventDate} at ${eventTime}. Location: ${event.venueName}, ${event.city}. See you there!`,
          payload: {
            eventId: String(event._id),
            eventTitle: event.title,
            eventDate,
            eventTime,
            venueName: event.venueName,
          },
        });

        await Notification.create({
          userId: new Types.ObjectId(userId),
          type: "EVENT_REMINDER",
          title: "Event Reminder",
          message: `${event.title} is coming up in 15 days! ${eventDate} at ${eventTime}`,
          link: `/events/${event.slug}`,
          read: false,
          metadata: {
            eventId: String(event._id),
            eventTitle: event.title,
            eventDate,
          },
        });

        remindersSent++;
      }
    }

    return NextResponse.json({
      message: `Event reminders sent successfully!`,
      remindersSent,
      eventsFound: upcomingEvents.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to send event reminders.") },
      { status: getErrorStatus(error) },
    );
  }
}
