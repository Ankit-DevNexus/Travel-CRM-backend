
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const flightBookingSchema = new mongoose.Schema({
  flightBookingId: { type: String, default: uuidv4 }, // unique flight booking id
  passengerDetails: Object,
  flightDetails: Object,
    totalAmount: {
    type: Number,
    default: 0
  },
  PaidAmount: {
    type: Number,
    default: 0
  },
  RemainingAmount: {
    type: Number,
    default: 0
  }
}, { _id: false, timestamps: true });

const hotelBookingSchema = new mongoose.Schema({
  hotelBookingId: { type: String, default: uuidv4 }, // unique hotel booking id
  guestDetails: Object,
  hotelDetails: Object,
  totalAmount: {
    type: Number,
    default: 0
  },
  PaidAmount: {
    type: Number,
    default: 0
  },
  RemainingAmount: {
    type: Number,
    default: 0
  }
  
}, { _id: false, timestamps: true});

const bookingSchema = new mongoose.Schema({
  uniqueBookingId: { type: String, unique: true }, // custom booking ID

  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  bookingType: {
    flightBooking: flightBookingSchema,
    hotelBooking: hotelBookingSchema
  },
  // queryType: {
  //   type: String,
  //   default: null
  // },
  // source: {
  //   type: String,
  //   default: null
  // },
  AssignedTo: {
    type: String,
    default: null
  },
  Status: {
    type: String,
    default: null
  }
},);


const flightAndHotelBookingModel = mongoose.model("FlightAndHotelBookingCollection", bookingSchema);
export default flightAndHotelBookingModel;