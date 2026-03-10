import { NextResponse } from "next/server";

import { logoutUser } from "@/server/auth/service";

export async function POST() {
  const result = await logoutUser();
  return NextResponse.json(result);
}
