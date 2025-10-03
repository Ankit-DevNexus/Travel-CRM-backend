import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const flightBookingSchema = new mongoose.Schema(
  {
    flightBookingId: { type: String, default: uuidv4 }, // unique flight booking id
    passengerDetails: Object,
    flightDetails: Object,
    totalAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false, timestamps: true },
);

const hotelBookingSchema = new mongoose.Schema(
  {
    hotelBookingId: { type: String, default: uuidv4 },
    guestDetails: Object,
    hotelDetails: Object,
    totalAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false, timestamps: true },
);

const bookingSchema = new mongoose.Schema({
  uniqueBookingId: { type: String, unique: true }, // custom booking ID

  bookingType: {
    flightBooking: flightBookingSchema,
    hotelBooking: hotelBookingSchema,
  },

  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Indicates type of booking
  bookingCategory: {
    type: String,
    enum: ['flight', 'hotel', 'HotelAndFlight'],
    default: null,
  },
  AssignedTo: {
    type: String,
    default: 'null',
  },
  Status: {
    type: String,
    default: 'null',
  },

  feedbackSent: {
    type: Boolean,
    default: false,
  },
  feedbackSentAt: {
    type: Date,
  },
  feedbackReceived: {
    type: Boolean,
    default: false,
  },
  feedbackReceivedAt: {
    type: Date,
  },

  feedbackData: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: String,
    suggestions: String,
    submittedAt: Date,
  },
});

const flightAndHotelBookingModel = mongoose.model('FlightAndHotelBookingCollection', bookingSchema);
export default flightAndHotelBookingModel;
