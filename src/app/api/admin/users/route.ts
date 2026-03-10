import { NextResponse } from "next/server";

import { listAdminUsers } from "@/server/admin/service";

export async function GET() {
  try {
    const users = await listAdminUsers();
    return NextResponse.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load users.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
