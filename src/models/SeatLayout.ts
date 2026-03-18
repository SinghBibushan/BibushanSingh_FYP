import { model, models, Schema, type InferSchemaType } from "mongoose";

const seatSchema = new Schema(
  {
    row: { type: String, required: true },
    number: { type: Number, required: true },
    type: { type: String, enum: ["REGULAR", "VIP", "PREMIUM"], default: "REGULAR" },
    status: { type: String, enum: ["AVAILABLE", "BOOKED", "BLOCKED"], default: "AVAILABLE" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", default: null },
  },
  { _id: false },
);

const seatLayoutSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, unique: true, index: true },
    rows: { type: Number, required: true },
    seatsPerRow: { type: Number, required: true },
    seats: [seatSchema],
    enabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type SeatDocument = InferSchemaType<typeof seatSchema>;
export type SeatLayoutDocument = InferSchemaType<typeof seatLayoutSchema>;
export const SeatLayout = models.SeatLayout || model("SeatLayout", seatLayoutSchema);
