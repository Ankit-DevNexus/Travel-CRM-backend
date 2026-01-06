import mongoose from 'mongoose';

const markupValueSchema = {
  type: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
};

const markupManagementSchema = new mongoose.Schema(
  {
    organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: String, required: true },
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

const markupManagementModel = mongoose.model('MarkupManagement', markupManagementSchema);
export default markupManagementModel;
