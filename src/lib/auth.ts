import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import jwt, { type SignOptions } from "jsonwebtoken";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { env, isJwtSecretConfigured } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export type SessionPayload = {
  sub: string;
  _id?: string;
  email: string;
  role: "USER" | "ADMIN";
  name: string;
};

type ActionTokenPayload = {
  email: string;
  purpose: "verify-email" | "reset-password";
};

type CookieRequest = NextRequest | Request;

function assertJwtSecretConfigured() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  if (!isJwtSecretConfigured()) {
    throw new AppError(
      env.NODE_ENV === "production"
        ? "JWT_SECRET must be configured with a secure value in production."
        : "JWT_SECRET must be configured.",
      500,
      "INVALID_ENVIRONMENT",
    );
  }
}

function normalizeUser<T extends { _id: unknown }>(user: T | null) {
  if (!user) {
    return null;
  }

  const id = String(user._id);

  return {
    ...user,
    _id: id,
    id,
  };
}

function getCookieHeaderValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

function getSessionTokenFromRequest(req: CookieRequest) {
  if ("cookies" in req) {
    return req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  }

  return getCookieHeaderValue(req.headers.get("cookie"), SESSION_COOKIE_NAME);
}

export async function getSession() {
  assertJwtSecretConfigured();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSessionToken(payload: SessionPayload) {
  assertJwtSecretConfigured();
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
  } satisfies SignOptions);
}

export async function setSessionCookie(payload: SessionPayload) {
  const cookieStore = await cookies();
  const token = await createSessionToken(payload);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function createActionToken(payload: ActionTokenPayload, expiresIn: SignOptions["expiresIn"]) {
  assertJwtSecretConfigured();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyActionToken(token: string, purpose: ActionTokenPayload["purpose"]) {
  assertJwtSecretConfigured();
  const payload = jwt.verify(token, env.JWT_SECRET) as ActionTokenPayload;

  if (payload.purpose !== purpose) {
    throw new Error("Invalid token purpose.");
  }

  return payload;
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  await connectToDatabase();
  const user = await User.findById(session.sub).lean();
  return normalizeUser(user);
}

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}

// Verify auth from request (for API routes)
export async function verifyAuth(req: CookieRequest) {
  assertJwtSecretConfigured();
  const token = getSessionTokenFromRequest(req);

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as SessionPayload;
    await connectToDatabase();
    const user = await User.findById(payload.sub).lean();
    return normalizeUser(user);
  } catch {
    return null;
  }
}

export function assertAuthenticated<T>(value: T | null, message = "Unauthorized.") {
  if (!value) {
    throw new AppError(message, 401, "UNAUTHORIZED");
  }

  return value;
}
