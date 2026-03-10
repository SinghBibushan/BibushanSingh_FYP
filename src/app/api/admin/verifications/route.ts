import { NextResponse } from "next/server";

import { listStudentVerifications } from "@/server/admin/service";

export async function GET() {
  try {
    const verifications = await listStudentVerifications();
    return NextResponse.json({ verifications });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load verifications.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
