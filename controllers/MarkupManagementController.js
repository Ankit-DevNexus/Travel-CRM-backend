import mongoose from 'mongoose';
import MarkupManagementModel from '../models/MarkupManagementModel.js';
import { createAuditLog } from '../utils/auditLogHelper.js';

// Create Markup
export const CreateMarkupManagement = async (req, res) => {
  try {
    const user = req.user;

    const markupData = await MarkupManagementModel.create({
      ...req.body,
      organisationId: user.organisationId,
      userId: user.userId,
    });

    // Create audit log entry
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user.userId,
      actorName: user.actorName,
      email: user.email,
      action: 'markup.create',
      targetType: 'MarkupManagement',
      targetId: markupData._id,
      req,
      meta: { createdData: req.body },
    });

    res.json({ message: 'Markup created successfully', markupData });
  } catch (error) {
    console.error('Error creating markup:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Markups
export const getAllMarkupManagement = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'admin') {
      query.organisationId = req.user.organisationId;
    } else if (req.user.role === 'user') {
      query.userId = req.user.userId;
    }

    const markupData = await MarkupManagementModel.find(query);

    res.json({
      message: 'Markup fetched successfully',
      totalMarkup: markupData.length,
      markupData,
    });
  } catch (error) {
    console.error('Error fetching markup:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Markup By ID
export const getMarkupManagementById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid markup ID' });
    }

    const markup = await MarkupManagementModel.findById(id);
    if (!markup) return res.status(404).json({ error: 'Markup details not found' });

    res.status(200).json({
      message: 'Markup details fetched successfully',
      data: markup,
    });
  } catch (error) {
    console.error('Error fetching markup:', error);
    res.status(500).json({
      error: 'Failed to fetch markup details',
      details: error.message,
    });
  }
};

// Update Markup
export const updateMarkupManagement = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid markup ID' });
    }

    const oldMarkup = await MarkupManagementModel.findById(id);
    if (!oldMarkup) {
      return res.status(404).json({ error: 'Markup not found' });
    }

    const updatedMarkup = await MarkupManagementModel.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });

    // Create audit log entry
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user.userId,
      actorName: user.actorName,
      email: user.email,
      action: 'markup.update',
      targetType: 'MarkupManagement',
      targetId: id,
      req,
      meta: { before: oldMarkup, after: updatedMarkup },
    });

    res.status(200).json({
      message: 'Markup updated successfully',
      data: updatedMarkup,
    });
  } catch (error) {
    console.error('Error updating markup:', error);
    res.status(500).json({
      error: 'Failed to update markup',
      details: error.message,
    });
  }
};

// Delete Markup
export const deleteMarkupManagement = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid markup ID' });
    }

    const deletedMarkup = await MarkupManagementModel.findByIdAndDelete(id);
    if (!deletedMarkup) {
      return res.status(404).json({ error: 'Markup not found' });
    }

    // Create audit log entry
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user.userId,
      actorName: user.actorName,
      email: user.email,
      action: 'markup.delete',
      targetType: 'MarkupManagement',
      targetId: id,
      req,
      meta: { deletedData: deletedMarkup },
    });

    res.status(200).json({
      message: 'Markup deleted successfully',
      data: deletedMarkup,
    });
  } catch (error) {
    console.error('Error deleting markup:', error);
    res.status(500).json({
      error: 'Failed to delete markup',
      details: error.message,
    });
  }
};
