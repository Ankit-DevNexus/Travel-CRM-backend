import mongoose from 'mongoose';

const SalesDataSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlightAndHotelBookingCollection',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    bookingData: { type: Object, required: true },
    totalAmount: { type: Number, required: false },
    paidAmount: { type: Number, required: false },
    remainingAmount: { type: Number, required: false },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, strict: false }
);

const SalesDataModel = mongoose.model('SalesDataCollection', SalesDataSchema);

export default SalesDataModel;
