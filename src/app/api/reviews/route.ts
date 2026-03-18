import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Review } from "@/models/Review";
import { Booking } from "@/models/Booking";
import { Event } from "@/models/Event";
import { connectDB } from "@/lib/db";

// GET /api/reviews?eventId=xxx - Get reviews for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    await connectDB();

    const reviews = await Review.find({ eventId, status: "APPROVED" })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const stats = await Review.aggregate([
      { $match: { eventId: eventId, status: "APPROVED" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats[0]?.ratingDistribution) {
      stats[0].ratingDistribution.forEach((rating: number) => {
        distribution[rating as keyof typeof distribution]++;
      });
    }

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: stats[0]?.averageRating || 0,
        totalReviews: stats[0]?.totalReviews || 0,
        distribution,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, bookingId, rating, title, comment } = await request.json();

    if (!eventId || !bookingId || !rating || !title || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: user.id,
      status: "CONFIRMED",
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Valid booking not found" },
        { status: 404 }
      );
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user already reviewed this event for this booking
    const existingReview = await Review.findOne({
      userId: user.id,
      eventId,
      bookingId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this event" },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      eventId,
      userId: user.id,
      bookingId,
      rating,
      title,
      comment,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
