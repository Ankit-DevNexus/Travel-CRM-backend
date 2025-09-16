import mongoose from "mongoose";

const SalesDataSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "FlightAndHotelBookingCollection", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organisationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },

    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true, strict: false
 });

const SalesDataModel = mongoose.model("SalesDataCollection", SalesDataSchema);

export default SalesDataModel;
