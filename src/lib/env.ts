import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().default("EventEase"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().default("change-me-in-env"),
  MOCK_PAYMENT_ENABLED: z.string().default("true"),
  MOCK_EMAIL_ENABLED: z.string().default("true"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  UPLOAD_DIR: z.string().default("uploads"),
  MAP_EMBED_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  MOCK_PAYMENT_ENABLED: process.env.MOCK_PAYMENT_ENABLED,
  MOCK_EMAIL_ENABLED: process.env.MOCK_EMAIL_ENABLED,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  MAP_EMBED_API_KEY: process.env.MAP_EMBED_API_KEY,
});

export const isMockPaymentEnabled = env.MOCK_PAYMENT_ENABLED === "true";
export const isMockEmailEnabled = env.MOCK_EMAIL_ENABLED === "true";
