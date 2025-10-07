import SalesDataModel from '../models/SalesDataModel.js';
import AuditLogModel from '../models/AuditLog.js';
import mongoose from 'mongoose';

// Helper to create audit log entries
const createAuditLog = async ({ orgId, actorId, actorName, email, action, targetType, targetId, req, meta = {} }) => {
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

// Get all sales
export const getAllSalesData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalSales = await SalesDataModel.countDocuments();
    const salesData = await SalesDataModel.find().skip(skip).limit(limit).lean();

    return res.status(200).json({
      success: true,
      message: 'Fetched sales data successfully',
      totalSales,
      currentPage: page,
      totalPages: Math.ceil(totalSales / limit),
      salesData,
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales data',
      error: error.message,
    });
  }
};

// Get single sales
export const getSalesDataById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid sales ID' });
    }

    const salesData = await SalesDataModel.findById(id).lean();

    if (!salesData) {
      return res.status(404).json({
        success: false,
        message: 'Sales data not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fetched sales data successfully',
      salesData,
    });
  } catch (error) {
    console.error('Error fetching sales data by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales data',
      error: error.message,
    });
  }
};

// Update sales data (with audit logging)

export const updateSalesData = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid sales ID' });
    }

    // 🔹 Fetch old data for logging (before update)
    const oldData = await SalesDataModel.findById(id).lean();
    if (!oldData) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // 🔹 Build update object dynamically (avoid overwriting nested fields)
    const updateFields = {};
    if (updates.booking) {
      for (const [key, value] of Object.entries(updates.booking)) {
        updateFields[`booking.${key}`] = value;
      }
    }

    if (updates.updatedBy) updateFields.updatedBy = updates.updatedBy;

    // 🔹 Perform update
    const updatedData = await SalesDataModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true });

    // 🔹 Log the action
    await createAuditLog({
      req,
      action: 'sales.update',
      targetType: 'SalesData',
      targetId: id,
      meta: {
        before: oldData,
        after: updatedData,
        changedFields: Object.keys(updateFields),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update record',
      error: error.message,
    });
  }
};

// Delete sales data
export const deleteSalesData = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid sales ID' });
    }

    const deletedData = await SalesDataModel.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: 'Sales data not found',
      });
    }

    // Audit log entry
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user._id,
      actorName: user.actorName,
      email: user.email,
      action: 'sales.delete',
      targetType: 'SalesData',
      targetId: id,
      req,
      meta: { deletedData },
    });

    return res.status(200).json({
      success: true,
      message: 'Sales data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sales data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete sales data',
      error: error.message,
    });
  }
};
