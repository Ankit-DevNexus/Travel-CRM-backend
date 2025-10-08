import AuditLogModel from '../models/AuditLog.js';

export const getAllAuditLogs = async (req, res) => {
  try {
    const user = req.user;

    // Pagination defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query based on role and filters
    const query = {};

    // Restrict to organisation scope
    if (user.role === 'admin' || user.role === 'user') {
      query.orgId = user.organisationId;
    }

    // Optional filters
    if (req.query.actorId) query.actorId = req.query.actorId;
    if (req.query.action) query.action = req.query.action;
    if (req.query.targetType) query.targetType = req.query.targetType;

    // Fetch total count and paginated logs
    const totalLogs = await AuditLogModel.countDocuments(query);
    const logs = await AuditLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    return res.status(200).json({
      success: true,
      message: 'Fetched audit logs successfully',
      totalLogs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      logs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};
