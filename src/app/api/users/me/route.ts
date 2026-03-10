import { NextResponse } from "next/server";

import { getCurrentUser, getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const user = await getCurrentUser();

  return NextResponse.json({
    user: user
      ? {
          id: String(user._id),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          loyaltyPoints: user.loyaltyPoints,
          loyaltyTier: user.loyaltyTier,
          emailVerified: Boolean(user.emailVerifiedAt),
          notificationPreferences: user.notificationPreferences,
          studentVerificationStatus: user.studentVerificationStatus,
        }
      : null,
  });
}
