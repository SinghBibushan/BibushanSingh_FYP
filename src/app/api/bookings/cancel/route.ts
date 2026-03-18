import { NextRequest, NextResponse } from "next/server";
import { cancelBooking } from "@/server/bookings/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await cancelBooking(body.bookingCode);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to cancel booking.",
      },
      { status: 400 }
    );
  }
}
