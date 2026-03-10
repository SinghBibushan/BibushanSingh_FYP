import { NextResponse } from "next/server";

import { confirmMockPayment } from "@/server/bookings/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await confirmMockPayment(body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not confirm mock payment.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
