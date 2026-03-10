import { NextResponse } from "next/server";

import {
  createAdminPromoCode,
  listAdminPromoCodes,
} from "@/server/admin/service";

export async function GET() {
  try {
    const promoCodes = await listAdminPromoCodes();
    return NextResponse.json({ promoCodes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load promo codes.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createAdminPromoCode(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create promo code.";
    const status = message === "Unauthorized." ? 401 : message === "Forbidden." ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
