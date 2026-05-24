import { NextResponse } from "next/server";

import { submitOrganizerEvent } from "@/server/organizer/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action !== "SUBMIT_FOR_REVIEW") {
      return NextResponse.json({ message: "Unsupported organizer action." }, { status: 400 });
    }

    const result = await submitOrganizerEvent(id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update organizer event.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
