import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { NotificationLog } from "@/models/NotificationLog";
import { sendEmail } from "@/server/notifications/mailer";

type NotificationInput = {
  userId: string | null;
  email?: string;
  channel: "EMAIL" | "IN_APP" | "LOG";
  type: string;
  subject: string;
  message: string;
  payload?: Record<string, unknown>;
};

type InAppNotificationInput = {
  userId: string;
  type: "BOOKING_CONFIRMED" | "EVENT_REMINDER" | "PAYMENT_SUCCESS" | "REVIEW_REQUEST" | "CHAT_MESSAGE" | "EVENT_UPDATE" | "BOOKING_CANCELLED" | "STUDENT_VERIFIED" | "NEW_EVENT";
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
};

export async function createInAppNotification(input: InAppNotificationInput) {
  await connectToDatabase();

  const notification = await Notification.create({
    userId: new Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link || "",
    read: false,
    metadata: input.metadata || {},
  });

  return notification;
}

export async function logNotification(input: NotificationInput) {
  await connectToDatabase();

  const entry = await NotificationLog.create({
    userId:
      input.userId && Types.ObjectId.isValid(input.userId)
        ? new Types.ObjectId(input.userId)
        : null,
    channel: input.channel,
    type: input.type,
    subject: input.subject,
    payload: {
      message: input.message,
      ...(input.payload ?? {}),
    },
    status: "SENT",
    sentAt: new Date(),
  });

  if (input.channel === "EMAIL" && input.email) {
    await sendEmail({
      to: input.email,
      subject: input.subject,
      text: input.message,
      html: `<div style="font-family:Segoe UI,sans-serif;padding:24px"><h1 style="font-size:24px">${input.subject}</h1><p style="line-height:1.7">${input.message}</p></div>`,
    });
  }

  return entry;
}
