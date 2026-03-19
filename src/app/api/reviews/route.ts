import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { Booking } from "@/models/Booking";
import { Event } from "@/models/Event";
import { Review } from "@/models/Review";

const createReviewSchema = z.object({
  eventId: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: "Valid event ID required",
  }),
  bookingId: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: "Valid booking ID required",
  }),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(100),
  comment: z.string().trim().min(10).max(1000),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Valid event ID required" }, { status: 400 });
    }

    await connectDB();

    const reviews = await Review.find({ eventId, status: "APPROVED" })
      .populate("userId", "name avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    const stats = await Review.aggregate([
      {
        $match: {
          eventId: new Types.ObjectId(eventId),
          status: "APPROVED",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: { $push: "$rating" },
        },
      },
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats[0]?.ratingDistribution) {
      for (const rating of stats[0].ratingDistribution as number[]) {
        distribution[rating as keyof typeof distribution] += 1;
      }
    }

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: stats[0]?.averageRating ?? 0,
        totalReviews: stats[0]?.totalReviews ?? 0,
        distribution,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to fetch reviews.") },
      { status: getErrorStatus(error) },
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = applyRateLimit(request, {
    scope: "review-create",
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = createReviewSchema.parse(await request.json());
    await connectDB();

    const booking = await Booking.findOne({
      _id: data.bookingId,
      userId: user.id,
      status: "CONFIRMED",
      eventId: data.eventId,
    }).lean();

    if (!booking) {
      return NextResponse.json({ error: "Valid booking not found" }, { status: 404 });
    }

    const event = await Event.findById(data.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const existingReview = await Review.findOne({
      userId: user.id,
      eventId: data.eventId,
      bookingId: data.bookingId,
    }).lean();

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this event" },
        { status: 409 },
      );
    }

    const review = await Review.create({
      eventId: data.eventId,
      userId: user.id,
      bookingId: data.bookingId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    });

    const [reviewStats] = await Review.aggregate([
      {
        $match: {
          eventId: new Types.ObjectId(data.eventId),
          status: "APPROVED",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    event.averageRating = reviewStats?.averageRating ?? data.rating;
    event.totalReviews = reviewStats?.totalReviews ?? 1;
    await event.save();

    return NextResponse.json(
      { review },
      {
        status: 201,
        headers: rateLimit.headers,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid review." },
        {
          status: 400,
          headers: rateLimit.headers,
        },
      );
    }

    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to create review.") },
      {
        status: getErrorStatus(error),
        headers: rateLimit.headers,
      },
    );
  }
}
