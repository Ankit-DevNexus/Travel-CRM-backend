import mongoose from 'mongoose';
import CouponModel from '../models/CouponModel.js';
import { createAuditLog } from '../utils/auditLogHelper.js';

// Create Coupon
export const createCoupon = async (req, res) => {
  try {
    const user = req.user;

    const couponData = await CouponModel.create({
      ...req.body,
      organisationId: user.organisationId,
      adminId: user.adminId,
      userId: user._id,
    });

    // Audit log entry
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user._id,
      actorName: user.actorName,
      email: user.email,
      action: 'coupon.create',
      targetType: 'Coupon',
      targetId: couponData._id,
      req,
      meta: { createdData: req.body },
    });

    res.json({ message: 'Coupon created successfully', couponData });
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
      query.adminId = req.user._id;
    } else if (req.user.role === 'user') {
      query.$or = [{ userId: req.user._id }, { adminId: req.user.adminId }];
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const coupon = await CouponModel.findById(id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

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

    // ✅ Audit log entry
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

    // ✅ Audit log entry
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

// import mongoose from 'mongoose';
// import CouponModel from '../models/CouponModel.js';

// // Helper to create an audit log entry
// const createAuditLog = async ({ orgId, actorId, email, action, targetType, targetId, req, meta = {} }) => {
//   try {
//     await AuditLogModel.create({
//       orgId,
//       actorId,
//       email,
//       action,
//       targetType,
//       targetId,
//       ip: req.ip,
//       userAgent: req.headers['user-agent'],
//       meta,
//     });
//   } catch (err) {
//     console.error('Audit log creation failed:', err.message);
//   }
// };

// export const createCoupon = async (req, res) => {
//   try {
//     const user = req.user;

//     const couponData = await CouponModel.create({
//       ...req.body,
//       organisationId: user.organisationId,
//       adminId: user.adminId,
//       userId: user._id,
//     });

//     res.json({ message: 'Coupon created successfully', couponData });
//   } catch (error) {
//     res.status(500).json({ msg: err.message });
//   }
// };

// export const getAllCoupon = async (req, res) => {
//   try {
//     let query = {};

//     if (req.user.role === 'admin') {
//       query.adminId = req.user._id;
//     } else if (req.user.role === 'user') {
//       query.$or = [
//         { userId: req.user._id }, // user’s own bookings
//         { adminId: req.user.adminId }, // admin’s bookings         // admin’s leads
//       ];
//     }

//     const coupon = await CouponModel.find(query);

//     res.status(200).json({
//       message: 'Coupon fetched successfully',
//       totolCoupon: coupon.length,
//       data: coupon,
//     });
//   } catch (error) {
//     console.error('Error fetching Coupon:', error);

//     res.status(500).json({
//       error: 'Failed to fetch Coupon',
//       details: error.message,
//     });
//   }
// };

// export const getCouponById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'Invalid coupon ID' });
//     }

//     const coupon = await CouponModel.findById(id);

//     if (!coupon) return res.status(404).json({ error: 'Coupon details not found' });
//     res.status(200).json({
//       message: 'Coupon fetched successfully',
//       data: coupon,
//     });
//   } catch (error) {
//     console.error('Error fetching Coupon:', error);

//     res.status(500).json({
//       error: 'Failed to fetch Coupon',
//       details: error.message,
//     });
//   }
// };

// // Update Coupon
// export const updateCoupon = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'Invalid coupon ID' });
//     }

//     const updatedCoupon = await CouponModel.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });

//     if (!updatedCoupon) {
//       return res.status(404).json({ error: 'Coupon not found' });
//     }

//     res.status(200).json({
//       message: 'Coupon updated successfully',
//       data: updatedCoupon,
//     });
//   } catch (error) {
//     console.error('Error updating Coupon:', error);
//     res.status(500).json({
//       error: 'Failed to update Coupon',
//       details: error.message,
//     });
//   }
// };

// // Delete Coupon
// export const deleteCoupon = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'Invalid coupon ID' });
//     }

//     const deleteCoupon = await CouponModel.findByIdAndDelete(id);

//     if (!deleteCoupon) {
//       return res.status(404).json({ error: 'Coupon not found' });
//     }

//     res.status(200).json({
//       message: 'Coupon delete sccessfully',
//       data: deleteCoupon,
//     });
//   } catch (error) {
//     console.error('Error deleting Coupon:', error);
//     res.status(500).json({
//       error: 'Failed to delete Coupon',
//       details: error.message,
//     });
//   }
// };
