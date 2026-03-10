import { model, models, Schema, type InferSchemaType } from "mongoose";

const promoCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountAmount: { type: Number, default: null },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true, index: true },
    usageLimit: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    applicableEventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    minimumSubtotal: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type PromoCodeDocument = InferSchemaType<typeof promoCodeSchema>;
export const PromoCode = models.PromoCode || model("PromoCode", promoCodeSchema);
