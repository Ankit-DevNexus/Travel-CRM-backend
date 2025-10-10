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

// delete individual record
export const deleteAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid audit log ID',
      });
    }

    // Optional: restrict deletion to admins only
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can delete audit logs',
      });
    }

    const deletedLog = await AuditLogModel.findByIdAndDelete(id);

    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Audit log deleted successfully',
      data: deletedLog,
    });
  } catch (error) {
    console.error('Error deleting audit log:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete audit log',
      error: error.message,
    });
  }
};

// delete all records
export const deleteAllAuditLogs = async (req, res) => {
  try {
    const user = req.user;

    // Only allow admin to delete all logs
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can delete all audit logs',
      });
    }

    const result = await AuditLogModel.deleteMany({}); // deletes all records

    return res.status(200).json({
      success: true,
      message: 'All audit logs deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete audit logs',
      error: error.message,
    });
  }
};
