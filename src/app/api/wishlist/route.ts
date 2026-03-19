import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";
import { Wishlist } from "@/models/Wishlist";

type WishlistEvent = {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  summary: string;
  category: string;
  city: string;
  venueName: string;
  startsAt: Date;
  posterUrl?: string;
  tags?: string[];
};

type WishlistItemRecord = {
  createdAt: Date;
  eventId: WishlistEvent | null;
};

function mapWishlistItems(items: WishlistItemRecord[]) {
  return items
    .filter((item) => item.eventId)
    .map((item) => ({
      ...item.eventId,
      _id: String(item.eventId?._id),
      savedAt: item.createdAt.toISOString(),
    }));
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const wishlistItems = (await Wishlist.find({ userId: user.id })
      .populate({
        path: "eventId",
        select: "title slug summary category city venueName startsAt posterUrl tags",
      })
      .sort({ createdAt: -1 })
      .lean()) as WishlistItemRecord[];

    return NextResponse.json({ events: mapWishlistItems(wishlistItems) });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to fetch wishlist.") },
      { status: getErrorStatus(error) },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = (await request.json()) as { eventId?: string };

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Valid event ID required" }, { status: 400 });
    }

    await connectDB();

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existing = await Wishlist.findOne({ userId: user.id, eventId }).lean();
    if (existing) {
      return NextResponse.json({ error: "Event already in wishlist" }, { status: 409 });
    }

    await Wishlist.create({ userId: user.id, eventId });

    return NextResponse.json({ message: "Added to wishlist" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to add to wishlist.") },
      { status: getErrorStatus(error) },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Valid event ID required" }, { status: 400 });
    }

    await connectDB();

    const result = await Wishlist.findOneAndDelete({
      userId: user.id,
      eventId,
    }).lean();

    if (!result) {
      return NextResponse.json({ error: "Event not in wishlist" }, { status: 404 });
    }

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to remove from wishlist.") },
      { status: getErrorStatus(error) },
    );
  }
}
