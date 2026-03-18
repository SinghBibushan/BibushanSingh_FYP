import { Schema, model, models } from "mongoose";

const reviewSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    photos: [{ type: String }],
    helpfulCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "APPROVED",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only review an event once per booking
reviewSchema.index({ userId: 1, eventId: 1, bookingId: 1 }, { unique: true });

export const Review = models.Review || model("Review", reviewSchema);
