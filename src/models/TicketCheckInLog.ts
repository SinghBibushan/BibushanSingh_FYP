import { model, models, Schema, type InferSchemaType } from "mongoose";

const ticketCheckInLogSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", default: null, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", default: null, index: true },
    attendeeUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    staffUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scannedCode: { type: String, required: true, trim: true, index: true },
    gate: { type: String, default: "", trim: true },
    outcome: { type: String, enum: ["SUCCESS", "DENIED"], required: true, index: true },
    reason: { type: String, default: "", trim: true },
    checkedInAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

export type TicketCheckInLogDocument = InferSchemaType<typeof ticketCheckInLogSchema>;
export const TicketCheckInLog =
  models.TicketCheckInLog || model("TicketCheckInLog", ticketCheckInLogSchema);
