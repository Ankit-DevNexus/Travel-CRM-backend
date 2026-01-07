import mongoose from 'mongoose';

const markupValueSchema = {
  type: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    default: 'FLAT',
  },
  value: {
    type: Number,
    default: 0,
  },
};

const markupManagementSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    categoryWiseMarkups: {
      flights: markupValueSchema,
      hotels: markupValueSchema,
      holidaysPackages: markupValueSchema,
    },
    typeWiseMarkups: {
      B2B: {
        flights: markupValueSchema,
        hotels: markupValueSchema,
        holidaysPackages: markupValueSchema,
      },
      B2C: {
        flights: markupValueSchema,
        hotels: markupValueSchema,
        holidaysPackages: markupValueSchema,
      },
    },
  },
  { timestamps: true },
);

// SAFE MODEL EXPORT (prevents overwrite)
const MarkupManagementModel =
  mongoose.models.MarkupManagement ||
  mongoose.model('MarkupManagement', markupManagementSchema);

export default MarkupManagementModel;
