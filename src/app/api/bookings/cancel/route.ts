import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { cancelBooking } from "@/server/bookings/service";

export async function POST(req: NextRequest) {
  const rateLimit = applyRateLimit(req, {
    scope: "booking-cancel",
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const body = await req.json();
    const result = await cancelBooking(body.bookingCode);
    return NextResponse.json(result, {
      headers: rateLimit.headers,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Failed to cancel booking.") },
      {
        status: getErrorStatus(error, 400),
        headers: rateLimit.headers,
      },
    );
  }
}
