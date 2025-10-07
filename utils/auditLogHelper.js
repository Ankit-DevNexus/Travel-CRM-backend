import AuditLogModel from '../models/AuditLog.js';

// Helper function to create audit logs
export const createAuditLog = async ({ orgId, actorId, actorName, email, action, targetType, targetId, req, meta = {} }) => {
  try {
    await AuditLogModel.create({
      orgId,
      actorId,
      actorName,
      email,
      action,
      targetType,
      targetId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      meta,
    });
  } catch (err) {
    console.error('Audit log creation failed:', err.message);
  }
};
