import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { resetPassword } from "@/server/auth/service";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, {
    scope: "auth-reset-password",
    limit: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const body = (await request.json()) as { token: string; password: string; confirmPassword: string };
    const result = await resetPassword(body.token, {
      password: body.password,
      confirmPassword: body.confirmPassword,
    });

    return NextResponse.json(result, {
      headers: rateLimit.headers,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not reset password.") },
      {
        status: getErrorStatus(error, 400),
        headers: rateLimit.headers,
      },
    );
  }
}
