import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EventGallery } from "@/models/EventGallery";
import { verifyAuth } from "@/lib/auth";

const allowedImageHosts = new Set([
  "images.unsplash.com",
  "res.cloudinary.com",
  "lh3.googleusercontent.com",
  ...(process.env.IMAGE_REMOTE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
]);

function isAllowedImageUrl(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedImageHosts.has(url.hostname);
  } catch {
    return false;
  }
}

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

    if (!eventId || !isAllowedImageUrl(imageUrl)) {
      return NextResponse.json(
        { error: "A valid HTTPS image URL from an approved host is required." },
        { status: 400 },
      );
    }

    const photo = await EventGallery.create({
      eventId,
      userId: user._id,
      imageUrl,
      caption: typeof caption === "string" ? caption.trim().slice(0, 160) : "",
      approved: true, // Auto-approve for now
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
