import express from 'express';
import HolidayPackageBookingModel from '../models/CustomHolidayPackageModel.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import SalesDataModel from '../models/SalesDataModel.js';

// Helper to create an audit log entry
const createAuditLog = async ({ orgId, actorId, email, action, targetType, targetId, req, meta = {} }) => {
  try {
    await AuditLogModel.create({
      orgId,
      actorId,
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

// Create booking
export const createHolidayPackageBooking = async (req, res) => {
  try {
    const user = req.user;

    // Unique booking ID using UUID
    const uniqueBookingId = 'USR-' + uuidv4().split('-')[0].toUpperCase();

    const bookingData = await HolidayPackageBookingModel.create({
      ...req.body,
      uniqueBookingId,
      organisationId: user.organisationId,
      adminId: user.adminId,
      userId: user._id,
    });

    //  Audit log for creation
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user._id,
      email: user.email,
      action: 'customPackage.create',
      targetType: 'customPackageBooking',
      targetId: bookingData._id,
      req,
      meta: { bookingCategory, uniqueBookingId },
    });

    res.json({
      message: 'Holiday package booking created successfully',
      bookingData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all bookings
export const getAllHolidayPackageBooking = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.currentPage) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (currentPage - 1) * limit;

    let query = {};

    if (req.user.role === 'admin') {
      query.adminId = req.user._id;
    } else if (req.user.role === 'user') {
      query.$or = [
        // { adminId: req.user.adminId, createdByEmail: req.user.email }, // user’s own leads
        // { adminId: req.user.adminId, createdByRole: "admin" }
        { userId: req.user._id }, // user’s own bookings
        { adminId: req.user.adminId }, // admin’s bookings         // admin’s leads
      ];
    }

    // fetch data
    // promise.all([]) run queries in parallel
    const [Holiday, totalLeads] = await Promise.all([
      HolidayPackageBookingModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }), // → fetches only the records for the current page, sorted by newest first.
      HolidayPackageBookingModel.countDocuments(query), //→ gets the total number of records (needed to calculate total pages).
    ]);

    res.status(200).json({
      message: 'All holiday package fetched successfully',
      totalLeads,
      currentPage,
      totalPages: Math.ceil(totalLeads / limit),
      data: Holiday,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get booking by ID
export const getBookedHolidayPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid flight ID' });
    }

    const holiday = await HolidayPackageBookingModel.findById(id);
    if (!holiday) return res.status(404).json({ error: 'Holiday package details not found' });

    res.status(200).json({
      message: 'Holiday package details fetched successfully',
      data: holiday,
    });
    res.json(holiday);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update booking
export const updateHolidayPackage = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid booking ID format' });
    }

    let booking = await HolidayPackageBookingModel.findById(id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Access control
    if (user.role === 'user') {
      if (booking.userId.toString() !== user._id.toString()) {
        return res.status(403).json({ msg: 'Not allowed to update this booking' });
      }
    } else if (user.role === 'admin') {
      if (booking.organisationId.toString() !== user.organisationId.toString()) {
        return res.status(403).json({ msg: 'Not allowed to update this booking' });
      }
    }

    // Flatten request body into dot notation keys
    const flattenObject = (obj, parentKey = '', res = {}) => {
      for (let key in obj) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
          flattenObject(obj[key], newKey, res);
        } else {
          res[newKey] = obj[key];
        }
      }
      return res;
    };

    const updateFields = flattenObject(req.body);

    // Apply update using $set
    booking = await HolidayPackageBookingModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    // Check if any financial fields exist in the update
    const financialFields = ['totalAmount', 'paidAmount', 'remainingAmount'];
    const isFinancialUpdate = Object.keys(updateFields).some((key) => financialFields.some((field) => key.endsWith(field)));

    let salesDataHolidayPackage = null;

    if (isFinancialUpdate) {
      // Store the 'entire booking record' in SalesDataModel
      salesDataHolidayPackage = await SalesDataModel.create({
        booking, // store full booking object
        updatedBy: user._id,
      });

      // Delete booking from FlightAndHotelBookingModel after saving
      await HolidayPackageBookingModel.findByIdAndDelete(id);
    }

    // Audit log for update
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user._id,
      email: user.email,
      action: 'customPackage.update',
      targetType: 'customPackageBooking',
      targetId: booking._id,
      req,
      meta: { updateFields, isFinancialUpdate },
    });

    res.json({
      message: 'Booking updated successfully',
      deletedbooking: isFinancialUpdate ? null : booking, // return null if deleted
      salesDataHolidayPackage,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete booking
export const deleteHolidayPackageBooking = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid booking ID format' });
    }

    // Find booking
    const booking = await HolidayPackageBookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Access control
    if (user.role === 'user') {
      if (booking.userId.toString() !== user._id.toString()) {
        return res.status(403).json({ msg: 'Not allowed to delete this booking' });
      }
    } else if (user.role === 'admin') {
      if (booking.organisationId.toString() !== user.organisationId.toString()) {
        return res.status(403).json({ msg: 'Not allowed to delete this booking' });
      }
    }

    // Delete booking
    await booking.deleteOne();

    // Audit log for deletion
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user._id,
      email: user.email,
      action: 'customPackage.delete',
      targetType: 'customPackageBooking',
      targetId: booking._id,
      req,
      meta: { uniqueBookingId: booking.uniqueBookingId },
    });

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ msg: err.message });
  }
};
