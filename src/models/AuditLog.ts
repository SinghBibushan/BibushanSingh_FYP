import { model, models, Schema, type InferSchemaType } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;
export const AuditLog = models.AuditLog || model("AuditLog", auditLogSchema);
