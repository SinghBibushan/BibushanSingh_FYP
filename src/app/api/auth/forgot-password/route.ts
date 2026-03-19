import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { requestPasswordReset } from "@/server/auth/service";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, {
    scope: "auth-forgot-password",
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();
    const result = await requestPasswordReset(body);
    return NextResponse.json(result, {
      headers: rateLimit.headers,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not process request.") },
      {
        status: getErrorStatus(error, 400),
        headers: rateLimit.headers,
      },
    );
  }
}
