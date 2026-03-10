import { NextResponse } from "next/server";

import { getLoyaltySnapshot } from "@/server/tickets/service";

export async function GET() {
  try {
    const loyalty = await getLoyaltySnapshot();
    return NextResponse.json({ loyalty });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load loyalty.";
    const status = message === "Unauthorized." ? 401 : 400;
    return NextResponse.json({ message }, { status });
  }
}
