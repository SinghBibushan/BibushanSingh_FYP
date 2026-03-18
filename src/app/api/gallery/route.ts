import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EventGallery } from "@/models/EventGallery";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const photos = await EventGallery.find({ eventId, approved: true })
      .populate("userId", "name avatarUrl")
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Get gallery error:", error);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, imageUrl, caption } = await req.json();

    const photo = await EventGallery.create({
      eventId,
      userId: user._id,
      imageUrl,
      caption,
      approved: true, // Auto-approve for now
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
