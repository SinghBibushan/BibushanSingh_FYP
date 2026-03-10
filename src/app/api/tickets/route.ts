import { NextResponse } from "next/server";

import { getCurrentUserTickets } from "@/server/tickets/service";

export async function GET() {
  try {
    const tickets = await getCurrentUserTickets();
    return NextResponse.json({ tickets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load tickets.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
