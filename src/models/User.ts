import { model, models, Schema, type InferSchemaType } from "mongoose";

import {
  LOYALTY_TIERS,
  STUDENT_VERIFICATION_STATUSES,
  USER_ROLES,
} from "@/lib/constants";

const notificationPreferencesSchema = new Schema(
  {
    emailBookings: { type: Boolean, default: true },
    emailReminders: { type: Boolean, default: true },
    marketingOptIn: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: "" },
    googleId: { type: String, sparse: true },
    authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    role: { type: String, enum: USER_ROLES, default: "USER", index: true },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    emailVerifiedAt: { type: Date, default: null },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    loyaltyTier: { type: String, enum: LOYALTY_TIERS, default: "BRONZE" },
    notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) },
    studentVerificationStatus: {
      type: String,
      enum: STUDENT_VERIFICATION_STATUSES,
      default: "PENDING",
    },
    studentVerificationId: { type: Schema.Types.ObjectId, ref: "StudentVerification", default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Create unique index for googleId only when it exists
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = models.User || model("User", userSchema);
