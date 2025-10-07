import mongoose from 'mongoose';
import flightAndHotelBookingModel from '../models/flightAndHotelBookingModel.js';
import { v4 as uuidv4 } from 'uuid';
import SalesDataModel from '../models/SalesDataModel.js';
import { createAuditLog } from '../utils/auditLogHelper.js';

export const createFlightAndHotelBooking = async (req, res) => {
  try {
    const user = req.user;
    const { flightBooking, hotelBooking } = req.body.bookingType || {};

    let bookingCategory = null;
    if (flightBooking && !hotelBooking) bookingCategory = 'flight';
    else if (!flightBooking && hotelBooking) bookingCategory = 'hotel';
    else if (flightBooking && hotelBooking) bookingCategory = 'HotelAndFlight';

    const uniqueBookingId = 'USR-' + uuidv4().split('-')[0].toUpperCase();

    // booking payload
    const bookingPayload = {
      uniqueBookingId,
      bookingType: {
        flightBooking: flightBooking || undefined,
        hotelBooking: hotelBooking || undefined,
      },
      organisationId: user.organisationId,
      bookingCategory,
    };

    if (user.role === 'admin') {
      bookingPayload.adminId = user._id;
    } else if (user.role === 'user') {
      bookingPayload.adminId = user.adminId;
      bookingPayload.userId = user._id;
    }

    const bookingData = await flightAndHotelBookingModel.create(bookingPayload);

    //  Audit log for creation
    await createAuditLog({
      orgId: user.organisationId,
      actorId: user._id,
      email: user.email,
      action: 'flightHotel.create',
      targetType: 'FlightAndHotelBooking',
      targetId: bookingData._id,
      req,
      meta: { bookingCategory, uniqueBookingId },
    });

    res.json({ message: 'Booking created successfully', bookingData });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllFlightAndHotelBooking = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.currentPage) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
      flightAndHotelBookingModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
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
    if (!flight) return res.status(404).json({ error: 'Flight and Hotels details not found' });

    res.status(200).json({
      message: 'Flight and Hotels details fetched successfully',
      data: flight,
    });
  } catch (error) {
    res.status(500).json({
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
        return res.status(403).json({ msg: 'Not allowed to update this booking' });
      }
    } else if (user.role === 'admin') {
      if (booking.organisationId.toString() !== user.organisationId.toString()) {
        return res.status(403).json({ msg: 'Not allowed to update this booking' });
      }
    }

    // Flatten request body to handle nested objects
    const flattenObject = (obj, parentKey = '', resObj = {}) => {
      for (let key in obj) {
        if (obj[key] === undefined || obj[key] === null) continue;
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && Object.keys(obj[key]).length > 0) {
          flattenObject(obj[key], newKey, resObj);
        } else {
          resObj[newKey] = obj[key];
        }
      }
      return resObj;
    };

    const updateFields = flattenObject(req.body);

    // Check if any financial fields are updated
    const financialFields = ['totalAmount', 'paidAmount', 'remainingAmount'];
    const isFinancialUpdate = Object.keys(updateFields).some((key) => financialFields.some((field) => key.endsWith(field)));

    // Apply update
    booking = await flightAndHotelBookingModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    let salesData = null;

    if (isFinancialUpdate) {
      // Convert lead → sale
      salesData = await SalesDataModel.create({
        booking, // store the entire booking data
        updatedBy: user._id,
      });

      // Delete booking from flight/hotel model
      await flightAndHotelBookingModel.findByIdAndDelete(id);

      // Audit log: Convert lead → sale
      await createAuditLog({
        orgId: user.organisationId,
        actorId: user._id,
        email: user.email,
        action: 'lead.convertToSale',
        targetType: 'FlightAndHotelBooking',
        targetId: booking._id,
        req,
        meta: { updateFields },
      });
    } else {
      // Audit log: Normal data update
      await createAuditLog({
        orgId: user.organisationId,
        actorId: user._id,
        email: user.email,
        action: 'flightHotel.updateData',
        targetType: 'FlightAndHotelBooking',
        targetId: booking._id,
        req,
        meta: { updateFields },
      });
    }

    res.json({
      message: 'Booking updated successfully',
      isFinancialUpdate,
      salesData,
    });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ msg: err.message });
  }
};
// export const updateFlightAndHotelBooking = async (req, res) => {
//   try {
//     const user = req.user;
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ msg: 'Invalid booking ID format' });
//     }

//     let booking = await flightAndHotelBookingModel.findById(id);
//     if (!booking) return res.status(404).json({ msg: 'Booking not found' });

//     // Access control
//     if (user.role === 'user') {
//       if (booking.userId.toString() !== user._id.toString()) {
//         return res.status(403).json({ msg: 'Not allowed to update this booking' });
//       }
//     } else if (user.role === 'admin') {
//       if (booking.organisationId.toString() !== user.organisationId.toString()) {
//         return res.status(403).json({ msg: 'Not allowed to update this booking' });
//       }
//     }

//     // Flatten request body
//     const flattenObject = (obj, parentKey = '', resObj = {}) => {
//       for (let key in obj) {
//         if (obj[key] === undefined || obj[key] === null) continue; // skip empty values
//         const newKey = parentKey ? `${parentKey}.${key}` : key;
//         if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && Object.keys(obj[key]).length > 0) {
//           flattenObject(obj[key], newKey, resObj);
//         } else {
//           resObj[newKey] = obj[key];
//         }
//       }
//       return resObj;
//     };

//     const updateFields = flattenObject(req.body);

//     // Apply update
//     booking = await flightAndHotelBookingModel.findByIdAndUpdate(
//       id,
//       { $set: updateFields }, // Only update the provided fields
//       { new: true }, // Return the updated document
//     );

//     // Check if any financial fields exist in the update
//     const financialFields = ['totalAmount', 'paidAmount', 'remainingAmount'];
//     const isFinancialUpdate = Object.keys(updateFields).some((key) => financialFields.some((field) => key.endsWith(field)));

//     let salesData = null;

//     if (isFinancialUpdate) {
//       // Store the 'entire booking record' in SalesDataModel
//       salesData = await SalesDataModel.create({
//         booking, // store full booking object
//         updatedBy: user._id,
//       });

//       // Delete booking from FlightAndHotelBookingModel after saving
//       await flightAndHotelBookingModel.findByIdAndDelete(id);
//     }

//     // Audit log for update
//     await createAuditLog({
//       orgId: user.organisationId,
//       actorId: user._id,
//       email: user.email,
//       action: 'flightHotel.update',
//       targetType: 'FlightAndHotelBooking',
//       targetId: booking._id,
//       req,
//       meta: { updateFields, isFinancialUpdate },
//     });

//     res.json({
//       message: 'Booking updated successfully',
//       deletedbooking: isFinancialUpdate ? null : booking, // return null if deleted
//       salesData,
//     });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };

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
      action: 'flightHotel.delete',
      targetType: 'FlightAndHotelBooking',
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
