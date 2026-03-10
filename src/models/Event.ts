import { model, models, Schema, type InferSchemaType } from "mongoose";

import { EVENT_STATUSES } from "@/lib/constants";

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    posterUrl: { type: String, default: "" },
    status: { type: String, enum: EVENT_STATUSES, default: "DRAFT", index: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true },
    city: { type: String, required: true, index: true },
    venueName: { type: String, required: true },
    venueAddress: { type: String, required: true },
    mapUrl: { type: String, default: "" },
    organizerName: { type: String, required: true },
    organizerEmail: { type: String, required: true },
    tags: { type: [String], default: [] },
    ticketTypeIds: [{ type: Schema.Types.ObjectId, ref: "TicketType" }],
    settings: {
      featured: { type: Boolean, default: false },
      highlighted: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export type EventDocument = InferSchemaType<typeof eventSchema>;
export const Event = models.Event || model("Event", eventSchema);
