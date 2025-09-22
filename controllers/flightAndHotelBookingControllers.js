import mongoose from 'mongoose';
import flightAndHotelBookingModel from '../models/flightAndHotelBookingModel.js';
import { v4 as uuidv4 } from 'uuid';
import SalesDataModel from '../models/SalesDataModel.js';

export const createFlightAndHotelBooking = async (req, res) => {
  try {
    const user = req.user;

    // Unique booking ID using UUID
    const uniqueBookingId = 'USR-' + uuidv4().split('-')[0].toUpperCase();

    const bookingData = await flightAndHotelBookingModel.create({
      ...req.body,
      uniqueBookingId,
      organisationId: user.organisationId,
      adminId: user.adminId,
      userId: user._id,
    });

    res.json({ message: 'Booking created successfully', bookingData });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllFlightAndHotelBooking = async (req, res) => {
  try {
    // Pagination setup
    const currentPage = parseInt(req.query.currentPage) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const skip = (currentPage - 1) * limit;

    let query = {};

    if (req.user.role === 'admin') {
      // Admin should see everything created in his organisation
      query.organisationId = req.user.organisationId;
    } else if (req.user.role === 'user') {
      // User should only see his own bookings
      query.userId = req.user._id;
    }

    // Fetch data in parallel
    const [flights, totalLeads] = await Promise.all([
      flightAndHotelBookingModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      flightAndHotelBookingModel.countDocuments(query),
    ]);

    res.status(200).json({
      message: 'All booked flights and hotels fetched successfully',
      totalLeads,
      currentPage,
      totalPages: Math.ceil(totalLeads / limit),
      data: flights,
    });
  } catch (error) {
    console.error('Error fetching flights:', error);

    res.status(500).json({
      error: 'Failed to fetch flights',
      details: error.message,
    });
  }
};

export const getBookedFlightAndHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid flight ID' });
    }

    const flight = await flightAndHotelBookingModel.findById(id);
    if (!flight)
      return res
        .status(404)
        .json({ error: 'Flight and Hotels details not found' });

    res
      .status(200)
      .json({
        message: 'Flight and Hotels details fetched successfully',
        data: flight,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        error: 'Failed to fetch flight and Hotels details',
        details: error.message,
      });
  }
};

export const updateFlightAndHotelBooking = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid booking ID format' });
    }

    let booking = await flightAndHotelBookingModel.findById(id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Access control
    if (user.role === 'user') {
      if (booking.userId.toString() !== user._id.toString()) {
        return res
          .status(403)
          .json({ msg: 'Not allowed to update this booking' });
      }
    } else if (user.role === 'admin') {
      if (
        booking.organisationId.toString() !== user.organisationId.toString()
      ) {
        return res
          .status(403)
          .json({ msg: 'Not allowed to update this booking' });
      }
    }

    // Flatten request body
    const flattenObject = (obj, parentKey = '', res = {}) => {
      for (let key in obj) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (
          typeof obj[key] === 'object' &&
          !Array.isArray(obj[key]) &&
          obj[key] !== null
        ) {
          flattenObject(obj[key], newKey, res);
        } else {
          res[newKey] = obj[key];
        }
      }
      return res;
    };

    const updateFields = flattenObject(req.body);

    // Apply update
    booking = await flightAndHotelBookingModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    // If financial fields are updated, save into SalesDataCollection
    if (
      'totalAmount' in updateFields ||
      'paidAmount' in updateFields ||
      'remainingAmount' in updateFields
    ) {
      await SalesDataModel.create({
        bookingId: booking._id,
        userId: booking.userId,
        organisationId: booking.organisationId,
        totalAmount: booking.totalAmount,
        paidAmount: booking.paidAmount,
        remainingAmount: booking.remainingAmount,
        updatedBy: user._id,
      });

      // Delete the booking from flightAndHotelBookingModel
      await flightAndHotelBookingModel.findByIdAndDelete(id);
    }

    res.json({ message: 'Booking updated successfully', booking });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteFlightAndHotelBooking = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid booking ID format' });
    }

    // Find booking
    const booking = await flightAndHotelBookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Access control
    if (user.role === 'user') {
      if (booking.userId.toString() !== user._id.toString()) {
        return res
          .status(403)
          .json({ msg: 'Not allowed to delete this booking' });
      }
    } else if (user.role === 'admin') {
      if (
        booking.organisationId.toString() !== user.organisationId.toString()
      ) {
        return res
          .status(403)
          .json({ msg: 'Not allowed to delete this booking' });
      }
    }

    // Delete booking
    await booking.deleteOne();

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ msg: err.message });
  }
};
