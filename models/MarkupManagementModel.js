import mongoose from 'mongoose';

const markupManagementSchema = new mongoose.Schema(
  {
    organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
    strict: false,
  },
);

const markupManagementModel = mongoose.model('MarkupManagement', markupManagementSchema);
export default markupManagementModel;
