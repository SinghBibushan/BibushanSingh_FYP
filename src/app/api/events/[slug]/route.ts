import { NextResponse } from "next/server";

import { getPublicEventBySlug } from "@/server/events/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    return NextResponse.json({ message: "Event not found." }, { status: 404 });
  }

  return NextResponse.json({ event });
}
