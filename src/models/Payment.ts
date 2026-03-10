import { model, models, Schema, type InferSchemaType } from "mongoose";

import { PAYMENT_STATUSES } from "@/lib/constants";

const paymentSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    provider: { type: String, default: "MOCK" },
    status: { type: String, enum: PAYMENT_STATUSES, default: "INITIATED", index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NPR" },
    reference: { type: String, required: true, unique: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema>;
export const Payment = models.Payment || model("Payment", paymentSchema);
