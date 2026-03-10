import { model, models, Schema, type InferSchemaType } from "mongoose";

const notificationLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    channel: { type: String, enum: ["EMAIL", "IN_APP", "LOG"], required: true },
    type: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, default: "QUEUED" },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type NotificationLogDocument = InferSchemaType<
  typeof notificationLogSchema
>;
export const NotificationLog =
  models.NotificationLog || model("NotificationLog", notificationLogSchema);
