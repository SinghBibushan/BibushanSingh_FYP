import { NextResponse } from "next/server";

import { getPublicEvents } from "@/server/events/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const events = await getPublicEvents({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    featured: searchParams.get("featured") === "true",
  });

  return NextResponse.json({ events });
}
