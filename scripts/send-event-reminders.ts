import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/Event";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";
import { logNotification } from "@/server/notifications/service";
import { Types } from "mongoose";

async function sendEventReminders() {
  try {
    await connectToDatabase();

    // Calculate date 15 days from now
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 15);

    // Find events starting in 15 days (with 1 day tolerance)
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

    console.log(`Found ${upcomingEvents.length} events starting in 15 days`);

    for (const event of upcomingEvents) {
      // Find all confirmed bookings for this event
      const bookings = await Booking.find({
        eventId: event._id,
        status: "CONFIRMED",
      }).lean();

      console.log(`Found ${bookings.length} confirmed bookings for ${event.title}`);

      // Get unique user IDs
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

        if (existingReminder) {
          console.log(`Reminder already sent to ${user.email} for ${event.title}`);
          continue;
        }

        const eventDate = new Date(event.startsAt).toLocaleDateString();
        const eventTime = new Date(event.startsAt).toLocaleTimeString();

        // Send email notification
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

        // Create in-app notification
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

        console.log(`Sent reminder to ${user.email} for ${event.title}`);
      }
    }

    console.log("Event reminders sent successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error sending event reminders:", error);
    process.exit(1);
  }
}

sendEventReminders();
