import { NextRequest, NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { authenticateWithGoogle } from "@/server/auth/service";

export async function POST(req: NextRequest) {
  const rateLimit = applyRateLimit(req, {
    scope: "auth-google",
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const { credential } = await req.json();
    const result = await authenticateWithGoogle(credential);
    return NextResponse.json(result, {
      headers: rateLimit.headers,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Authentication failed.") },
      {
        status: getErrorStatus(error),
        headers: rateLimit.headers,
      },
    );
  }
}
