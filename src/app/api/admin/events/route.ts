import { NextResponse } from "next/server";

import { createAdminEvent, listAdminEvents } from "@/server/admin/service";

export async function GET() {
  try {
    const events = await listAdminEvents();
    return NextResponse.json({ events });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load events.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createAdminEvent(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create event.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
