import mongoose from 'mongoose';
import CouponModel from '../models/CouponModel.js';
import { createAuditLog } from '../utils/auditLogHelper.js';

// Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const user = req.user;

    // Ensure consistent data mapping
    const couponPayload = {
      ...req.body,
      organisationId: user.organisationId, // always the org the user belongs to
      adminId: user.createdByUserId || user._id, // ADM-A0002 (string) or fallback to ObjectId
      userId: user.userId, // EMP-A0001
    };

    const couponData = await CouponModel.create(couponPayload);

    // Audit log entry
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user.userId,
      actorName: user.actorName || user.EmpUsername || user.email,
      email: user.email,
      action: 'coupon.create',
      targetType: 'Coupon',
      targetId: couponData._id,
      req,
      meta: { createdData: couponPayload },
    });

    res.status(201).json({
      message: 'Coupon created successfully',
      couponData,
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Coupons
export const getAllCoupon = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'admin') {
      query.organisationId = req.user.organisationId;
    } else if (req.user.role === 'user') {
      query.$or = [{ userId: req.user._id }, { userId: req.user.userId }, { adminId: req.user.adminId }];
    }

    const coupon = await CouponModel.find(query);

    res.status(200).json({
      message: 'Coupon fetched successfully',
      totalCoupon: coupon.length,
      data: coupon,
    });
  } catch (error) {
    console.error('Error fetching Coupon:', error);
    res.status(500).json({
      error: 'Failed to fetch Coupon',
      details: error.message,
    });
  }
};

// Get Coupon By ID
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // from auth middleware

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    // base query
    let query = { _id: id };

    if (user.role === 'admin') {
      // admin can access any coupon in their organisation
      query.organisationId = user.organisationId;
    } else {
      // normal user can access only their own coupon
      query.userId = user.userId;
    }

    const coupon = await CouponModel.findOne(query);

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found or not authorized' });
    }

    res.status(200).json({
      message: 'Coupon fetched successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Error fetching Coupon:', error);
    res.status(500).json({
      error: 'Failed to fetch Coupon',
      details: error.message,
    });
  }
};

// Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const oldCoupon = await CouponModel.findById(id);
    if (!oldCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const updatedCoupon = await CouponModel.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });

    // Audit log entry
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user._id,
      actorName: user.actorName,
      email: user.email,
      action: 'coupon.update',
      targetType: 'Coupon',
      targetId: id,
      req,
      meta: { before: oldCoupon, after: updatedCoupon },
    });

    res.status(200).json({
      message: 'Coupon updated successfully',
      data: updatedCoupon,
    });
  } catch (error) {
    console.error('Error updating Coupon:', error);
    res.status(500).json({
      error: 'Failed to update Coupon',
      details: error.message,
    });
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const deletedCoupon = await CouponModel.findByIdAndDelete(id);
    if (!deletedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Audit log entry
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user._id,
      actorName: user.actorName,
      email: user.email,
      action: 'coupon.delete',
      targetType: 'Coupon',
      targetId: id,
      req,
      meta: { deletedData: deletedCoupon },
    });

    res.status(200).json({
      message: 'Coupon deleted successfully',
      data: deletedCoupon,
    });
  } catch (error) {
    console.error('Error deleting Coupon:', error);
    res.status(500).json({
      error: 'Failed to delete Coupon',
      details: error.message,
    });
  }
};
