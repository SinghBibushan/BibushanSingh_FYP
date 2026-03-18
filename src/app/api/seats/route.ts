import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SeatLayout } from "@/models/SeatLayout";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const seatLayout = await SeatLayout.findOne({ eventId });

    if (!seatLayout) {
      return NextResponse.json({ error: "Seat layout not found" }, { status: 404 });
    }

    return NextResponse.json({ seatLayout });
  } catch (error) {
    console.error("Get seats error:", error);
    return NextResponse.json({ error: "Failed to fetch seats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, rows, seatsPerRow } = await req.json();

    // Generate seat layout
    const seats = [];
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < rows; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        seats.push({
          row: rowLabels[i],
          number: j,
          type: i < 2 ? "VIP" : i < 5 ? "PREMIUM" : "REGULAR",
          status: "AVAILABLE",
          bookingId: null,
        });
      }
    }

    const seatLayout = await SeatLayout.create({
      eventId,
      rows,
      seatsPerRow,
      seats,
      enabled: true,
    });

    return NextResponse.json({ seatLayout }, { status: 201 });
  } catch (error) {
    console.error("Create seat layout error:", error);
    return NextResponse.json({ error: "Failed to create seat layout" }, { status: 500 });
  }
}
