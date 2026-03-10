import { model, models, Schema, type InferSchemaType } from "mongoose";

import { BOOKING_STATUSES } from "@/lib/constants";

const ticketSelectionSchema = new Schema(
  {
    ticketTypeId: { type: Schema.Types.ObjectId, ref: "TicketType", required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const pricingLineSchema = new Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false },
);

const bookingSchema = new Schema(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    ticketSelections: { type: [ticketSelectionSchema], default: [] },
    status: { type: String, enum: BOOKING_STATUSES, default: "PENDING", index: true },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discounts: { type: [pricingLineSchema], default: [] },
      totalDiscount: { type: Number, default: 0, min: 0 },
      finalAmount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "NPR" },
    },
    promoCodeId: { type: Schema.Types.ObjectId, ref: "PromoCode", default: null },
    studentDiscountApplied: { type: Boolean, default: false },
    groupDiscountApplied: { type: Boolean, default: false },
    loyaltyPointsEarned: { type: Number, default: 0, min: 0 },
    loyaltyPointsRedeemed: { type: Number, default: 0, min: 0 },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type BookingDocument = InferSchemaType<typeof bookingSchema>;
export const Booking = models.Booking || model("Booking", bookingSchema);
