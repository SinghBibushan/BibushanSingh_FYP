import { NextResponse } from "next/server";

import { loginUser } from "@/server/auth/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await loginUser(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Login failed.",
      },
      { status: 400 },
    );
  }
}
