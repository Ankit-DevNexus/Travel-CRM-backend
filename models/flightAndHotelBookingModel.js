import mongoose from "mongoose";

const flightBookingSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },   // The admin of the organisation
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true }, // The user who created the booking
    
}, { strict: false });

const flightAndHotelBookingModel = mongoose.model("FlightAndHotelCollection", flightBookingSchema);
export default flightAndHotelBookingModel;
