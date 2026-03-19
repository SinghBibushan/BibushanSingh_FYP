import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().default("EventEase"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().default("change-me-in-env"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_ENVIRONMENT: z.enum(["sandbox", "live"]).default("sandbox"),
  PAYPAL_CURRENCY: z.string().length(3).default("USD"),
  PAYPAL_EXCHANGE_RATE: z.string().optional(),
  MOCK_PAYMENT_ENABLED: z.string().default("true"),
  MOCK_EMAIL_ENABLED: z.string().default("true"),
  SMTP_SERVICE: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  UPLOAD_DIR: z.string().default("uploads"),
  MAP_EMBED_API_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  PAYPAL_ENVIRONMENT: process.env.PAYPAL_ENVIRONMENT,
  PAYPAL_CURRENCY: process.env.PAYPAL_CURRENCY,
  PAYPAL_EXCHANGE_RATE: process.env.PAYPAL_EXCHANGE_RATE,
  MOCK_PAYMENT_ENABLED: process.env.MOCK_PAYMENT_ENABLED,
  MOCK_EMAIL_ENABLED: process.env.MOCK_EMAIL_ENABLED,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  MAP_EMBED_API_KEY: process.env.MAP_EMBED_API_KEY,
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
});

export const isMockPaymentEnabled = env.MOCK_PAYMENT_ENABLED === "true";
export const isMockEmailEnabled = env.MOCK_EMAIL_ENABLED === "true";
export const isGoogleAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
);
export const isPayPalEnabled = Boolean(
  env.PAYPAL_CLIENT_ID &&
    env.PAYPAL_CLIENT_SECRET &&
    env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
);

export function isJwtSecretConfigured() {
  if (env.NODE_ENV !== "production") {
    return true;
  }

  if (env.JWT_SECRET === "change-me-in-env") {
    return false;
  }

  if (env.JWT_SECRET.length < 32) {
    return false;
  }

  return true;
}
