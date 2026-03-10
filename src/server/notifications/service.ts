import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
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
