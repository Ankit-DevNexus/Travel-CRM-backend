import mongoose from "mongoose";

const hotelBookingSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: String, required: true },   // name of the creator
    createdByEmail: { type: String, required: true },
    createdByRole: { type: String, enum: ["admin", "user"], required: true },
},
    { strict: false }
);

const hotelBookingModel = mongoose.model("hotelCollection", hotelBookingSchema);
export default hotelBookingModel;
