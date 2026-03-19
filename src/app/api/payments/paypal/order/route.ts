import { NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { createPayPalPaymentOrder } from "@/server/bookings/service";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, {
    scope: "payment-paypal-order",
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();
    const result = await createPayPalPaymentOrder(body);
    return NextResponse.json(result, {
      headers: rateLimit.headers,
    });
  } catch (error) {
    const message = getErrorMessage(error, "Could not create PayPal order.");
    const status = getErrorStatus(error, 400);
    return NextResponse.json(
      { message },
      {
        status,
        headers: rateLimit.headers,
      },
    );
  }
}
