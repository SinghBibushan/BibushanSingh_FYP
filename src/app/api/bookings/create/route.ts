import { NextResponse } from "next/server";

import { createBooking } from "@/server/bookings/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createBooking(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create booking.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
