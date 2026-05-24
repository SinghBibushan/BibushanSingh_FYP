import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { checkInTicket } from "@/server/staff/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await checkInTicket(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Could not check in ticket.") },
      { status: getErrorStatus(error) },
    );
  }
}
