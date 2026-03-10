import { model, models, Schema, type InferSchemaType } from "mongoose";

import { TICKET_STATUSES } from "@/lib/constants";

const ticketSchema = new Schema(
  {
    ticketCode: { type: String, required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: "TicketType", required: true },
    holderName: { type: String, required: true },
    qrPayload: { type: String, required: true },
    pdfPath: { type: String, default: "" },
    status: { type: String, enum: TICKET_STATUSES, default: "ACTIVE", index: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type TicketDocument = InferSchemaType<typeof ticketSchema>;
export const Ticket = models.Ticket || model("Ticket", ticketSchema);
