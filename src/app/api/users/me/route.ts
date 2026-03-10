import { NextResponse } from "next/server";

import { getCurrentUser, getSession } from "@/lib/auth";
import { updateCurrentUserProfile } from "@/server/users/service";

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

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const result = await updateCurrentUserProfile(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Could not update profile.",
      },
      { status: 400 },
    );
  }
}
