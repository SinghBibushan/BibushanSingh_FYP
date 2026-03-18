import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Wishlist } from "@/models/Wishlist";
import { Event } from "@/models/Event";
import { connectDB } from "@/lib/db";

// GET /api/wishlist - Get user's wishlist
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const wishlistItems = await Wishlist.find({ userId: user.id })
      .populate({
        path: "eventId",
        select: "title slug summary category city venueName startsAt posterUrl tags",
      })
      .sort({ createdAt: -1 });

    const events = wishlistItems
      .filter((item) => item.eventId)
      .map((item: any) => ({
        ...item.eventId.toObject(),
        savedAt: item.createdAt,
      }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add event to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    await connectDB();

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId: user.id, eventId });
    if (existing) {
      return NextResponse.json(
        { error: "Event already in wishlist" },
        { status: 400 }
      );
    }

    // Add to wishlist
    await Wishlist.create({ userId: user.id, eventId });

    return NextResponse.json({ message: "Added to wishlist" }, { status: 201 });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove event from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    await connectDB();

    const result = await Wishlist.findOneAndDelete({
      userId: user.id,
      eventId,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Event not in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
