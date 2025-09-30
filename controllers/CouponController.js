import mongoose from 'mongoose';
import CouponModel from '../models/CouponModel.js';

export const createCoupon = async (req, res) => {
  try {
    const user = req.user;

    const couponData = await CouponModel.create({
      ...req.body,
      organisationId: user.organisationId,
      adminId: user.adminId,
      userId: user._id,
    });

    res.json({ message: 'Coupon created successfully', couponData });
  } catch (error) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllCoupon = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'admin') {
      query.adminId = req.user._id;
    } else if (req.user.role === 'user') {
      query.$or = [
        { userId: req.user._id }, // user’s own bookings
        { adminId: req.user.adminId }, // admin’s bookings         // admin’s leads
      ];
    }

    const coupon = await CouponModel.find(query);

    res.status(200).json({
      message: 'Coupon fetched successfully',
      totolCoupon: coupon.length,
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

export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const coupon = await CouponModel.findById(id);

    if (!coupon) return res.status(404).json({ error: 'Coupon details not found' });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const updatedCoupon = await CouponModel.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });

    if (!updatedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const deleteCoupon = await CouponModel.findByIdAndDelete(id);

    if (!deleteCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.status(200).json({
      message: 'Coupon delete sccessfully',
      data: deleteCoupon,
    });
  } catch (error) {
    console.error('Error deleting Coupon:', error);
    res.status(500).json({
      error: 'Failed to delete Coupon',
      details: error.message,
    });
  }
};
