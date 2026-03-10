import { NextResponse } from "next/server";

import { registerUser } from "@/server/auth/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerUser(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Registration failed.",
      },
      { status: 400 },
    );
  }
}
