// models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    actorId: { type: String, ref: 'User' },
    email: { type: String, ref: 'User' },
    action: { type: String, required: true }, // e.g., "lead.create"
    targetType: { type: String }, // "Lead", "User"
    targetId: { type: mongoose.Schema.Types.ObjectId },
    ip: String,
    userAgent: String,
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

// auditLogSchema.index({ orgId: 1, createdAt: -1 });

const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);
export default AuditLogModel;
