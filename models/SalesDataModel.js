import mongoose from 'mongoose';

const SalesDataSchema = new mongoose.Schema(
  {
    booking: { type: Object, required: true },
    updatedBy: String,
  },
  { timestamps: true, strict: false },
);

const SalesDataModel = mongoose.model('SalesDataCollection', SalesDataSchema);

export default SalesDataModel;
