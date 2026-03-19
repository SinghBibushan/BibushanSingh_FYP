import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { confirmMockPayment } from "@/server/bookings/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await confirmMockPayment(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = getErrorMessage(error, "Could not confirm mock payment.");
    const status = getErrorStatus(error, 400);
    return NextResponse.json({ message }, { status });
  }
}
