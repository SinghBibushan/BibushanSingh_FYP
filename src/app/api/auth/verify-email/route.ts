import { NextResponse } from "next/server";

import { verifyEmailAddress } from "@/server/auth/service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token: string };
    const result = await verifyEmailAddress(body.token);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not verify email.",
      },
      { status: 400 },
    );
  }
}
