import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import jwt, { type SignOptions } from "jsonwebtoken";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";
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

export async function getSession() {
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
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyActionToken(token: string, purpose: ActionTokenPayload["purpose"]) {
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
  return User.findById(session.sub).lean();
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
export async function verifyAuth(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as SessionPayload;
    await connectToDatabase();
    const user = await User.findById(payload.sub).lean();
    return user;
  } catch {
    return null;
  }
}
