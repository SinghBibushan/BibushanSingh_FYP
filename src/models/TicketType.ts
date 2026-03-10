import { model, models, Schema, type InferSchemaType } from "mongoose";

const ticketTypeSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NPR" },
    quantityTotal: { type: Number, required: true, min: 0 },
    quantitySold: { type: Number, default: 0, min: 0 },
    saleStartsAt: { type: Date, required: true },
    saleEndsAt: { type: Date, required: true },
    perUserLimit: { type: Number, default: 6, min: 1 },
    benefits: { type: [String], default: [] },
  },
  { timestamps: true },
);

export type TicketTypeDocument = InferSchemaType<typeof ticketTypeSchema>;
export const TicketType =
  models.TicketType || model("TicketType", ticketTypeSchema);
