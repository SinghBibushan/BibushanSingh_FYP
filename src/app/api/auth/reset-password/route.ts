import { NextResponse } from "next/server";

import { resetPassword } from "@/server/auth/service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token: string; password: string; confirmPassword: string };
    const result = await resetPassword(body.token, {
      password: body.password,
      confirmPassword: body.confirmPassword,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not reset password.",
      },
      { status: 400 },
    );
  }
}
