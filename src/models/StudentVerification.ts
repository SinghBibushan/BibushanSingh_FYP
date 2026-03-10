import { model, models, Schema, type InferSchemaType } from "mongoose";

import { STUDENT_VERIFICATION_STATUSES } from "@/lib/constants";

const studentVerificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    documentPath: { type: String, required: true },
    status: {
      type: String,
      enum: STUDENT_VERIFICATION_STATUSES,
      default: "PENDING",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export type StudentVerificationDocument = InferSchemaType<
  typeof studentVerificationSchema
>;
export const StudentVerification =
  models.StudentVerification ||
  model("StudentVerification", studentVerificationSchema);
