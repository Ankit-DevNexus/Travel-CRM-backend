import mongoose from "mongoose";

const flightBookingSchema = new mongoose.Schema(
    {},{strict: false});

const flightBookingModel = mongoose.model("FlightCollection", flightBookingSchema);
export default flightBookingModel;
