import { NextResponse } from "next/server";

import { getCurrentUser, getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const user = await getCurrentUser();

  return NextResponse.json({
    authenticated: true,
    user: user
      ? {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints,
          loyaltyTier: user.loyaltyTier,
          emailVerified: Boolean(user.emailVerifiedAt),
        }
      : null,
  });
}
