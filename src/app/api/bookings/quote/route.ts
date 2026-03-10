import { NextResponse } from "next/server";

import { quoteBooking } from "@/server/bookings/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quote = await quoteBooking(body);
    return NextResponse.json({ quote });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not price booking.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
