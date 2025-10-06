// models/AuditLog.js (optional but recommended)
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

export default mongoose.model('AuditLog', auditLogSchema);
