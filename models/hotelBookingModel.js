import mongoose from "mongoose";

const hotelBookingSchema = new mongoose.Schema({}, 
    {strict: false}
);

const hotelBookingModel = mongoose.model("hotelCollection", hotelBookingSchema);
export default hotelBookingModel;
