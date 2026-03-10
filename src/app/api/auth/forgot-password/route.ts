import { NextResponse } from "next/server";

import { requestPasswordReset } from "@/server/auth/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await requestPasswordReset(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not process request.",
      },
      { status: 400 },
    );
  }
}
