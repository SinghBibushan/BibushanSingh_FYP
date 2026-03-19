import nodemailer from "nodemailer";

import { env, isMockEmailEnabled } from "@/lib/env";

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(payload: MailPayload) {
  if (
    isMockEmailEnabled ||
    (!env.SMTP_SERVICE && (!env.SMTP_HOST || !env.SMTP_PORT))
  ) {
    console.log("[mock-email]", {
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    });
    return { mode: "mock" as const };
  }

  const transporter = nodemailer.createTransport({
    ...(env.SMTP_SERVICE ? { service: env.SMTP_SERVICE } : {}),
    ...(env.SMTP_HOST ? { host: env.SMTP_HOST } : {}),
    ...(env.SMTP_PORT ? { port: Number(env.SMTP_PORT) } : {}),
    secure: Number(env.SMTP_PORT) === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: env.SMTP_FROM ?? "noreply@eventease.local",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return { mode: "smtp" as const };
}
