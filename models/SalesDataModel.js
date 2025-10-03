import mongoose from 'mongoose';

const SalesDataSchema = new mongoose.Schema(
  {
    booking: { type: Object, required: true },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, strict: false },
);

const SalesDataModel = mongoose.model('SalesDataCollection', SalesDataSchema);

export default SalesDataModel;
