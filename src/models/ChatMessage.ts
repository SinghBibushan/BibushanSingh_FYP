import { model, models, Schema, type InferSchemaType } from "mongoose";

const chatMessageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    roomId: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

export type ChatMessageDocument = InferSchemaType<typeof chatMessageSchema>;
export const ChatMessage = models.ChatMessage || model("ChatMessage", chatMessageSchema);
