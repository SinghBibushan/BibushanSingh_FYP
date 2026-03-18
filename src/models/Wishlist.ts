import { Schema, model, models } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can't save the same event twice
wishlistSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Wishlist = models.Wishlist || model("Wishlist", wishlistSchema);
