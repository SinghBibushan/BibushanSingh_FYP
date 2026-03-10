import { NextResponse } from "next/server";

import { getAdminOverview } from "@/server/admin/service";

export async function GET() {
  try {
    const data = await getAdminOverview();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load metrics.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
