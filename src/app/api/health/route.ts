import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET() {
  if (!env.MONGODB_URI) {
    return NextResponse.json(
      {
        ok: false,
        database: "not-configured",
        message: "MONGODB_URI is missing.",
      },
      { status: 503 },
    );
  }

  try {
    const connection = await connectToDatabase();

    return NextResponse.json({
      ok: true,
      database: connection.connection.name,
      readyState: connection.connection.readyState,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "connection-error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
