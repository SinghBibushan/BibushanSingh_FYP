import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

import { sendEmail } from "@/server/notifications/mailer";

async function main() {
  const result = await sendEmail({
    to: process.env.SMTP_USER ?? "",
    subject: "EventEase SMTP test",
    text: "This is a direct SMTP test from the EventEase app.",
    html: "<p>This is a direct SMTP test from the <strong>EventEase</strong> app.</p>",
  });

  console.log(JSON.stringify({
    to: process.env.SMTP_USER,
    result,
  }));
}

void main();
