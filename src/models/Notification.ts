import { model, models, Schema, type InferSchemaType } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["BOOKING_CONFIRMED", "EVENT_REMINDER", "PAYMENT_SUCCESS", "REVIEW_REQUEST", "CHAT_MESSAGE", "EVENT_UPDATE", "BOOKING_CANCELLED", "STUDENT_VERIFIED", "NEW_EVENT"],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export const Notification = models.Notification || model("Notification", notificationSchema);
