import { NextResponse } from "next/server";

import { getSalesReport } from "@/server/admin/service";

export async function GET() {
  try {
    const report = await getSalesReport();
    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load report.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
