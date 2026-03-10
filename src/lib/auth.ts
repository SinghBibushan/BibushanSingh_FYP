import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";

export type SessionPayload = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
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
