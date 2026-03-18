import { model, models, Schema, type InferSchemaType } from "mongoose";

const eventGallerySchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, default: "" },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type EventGalleryDocument = InferSchemaType<typeof eventGallerySchema>;
export const EventGallery = models.EventGallery || model("EventGallery", eventGallerySchema);
