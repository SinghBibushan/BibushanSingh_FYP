import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { quoteBooking } from "@/server/bookings/service";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, {
    scope: "booking-quote",
    limit: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();
    const quote = await quoteBooking(body);
    return NextResponse.json(
      { quote },
      {
        headers: rateLimit.headers,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not price booking.") },
      {
        status: getErrorStatus(error, 400),
        headers: rateLimit.headers,
      },
    );
  }
}
