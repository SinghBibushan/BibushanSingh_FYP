import { NextResponse } from "next/server";

import { listAdminBookings } from "@/server/admin/service";

export async function GET() {
  try {
    const bookings = await listAdminBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load bookings.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
