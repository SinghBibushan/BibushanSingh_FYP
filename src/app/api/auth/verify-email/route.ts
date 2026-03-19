import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { verifyEmailAddress } from "@/server/auth/service";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, {
    scope: "auth-verify-email",
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const body = (await request.json()) as { token: string };
    const result = await verifyEmailAddress(body.token);
    return NextResponse.json(result, {
      headers: rateLimit.headers,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not verify email.") },
      {
        status: getErrorStatus(error, 400),
        headers: rateLimit.headers,
      },
    );
  }
}
