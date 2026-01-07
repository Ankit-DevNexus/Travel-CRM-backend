import MarkupManagementModel from '../models/MarkupManagementModel.js'

export const createZeroMarkupForAdmin = async (admin) => {
  // prevent duplicates
  const exists = await MarkupManagementModel.findOne({
    organisationId: admin.organisationId,
    userId: admin.userId,
  });

  if (exists) return exists;

  return await MarkupManagementModel.create({
    organisationId: admin.organisationId,
    userId: admin.userId,

    categoryWiseMarkups: {
      flights: { type: 'FLAT', value: 0 },
      hotels: { type: 'FLAT', value: 0 },
      holidaysPackages: { type: 'FLAT', value: 0 },
    },

    typeWiseMarkups: {
      B2B: {
        flights: { type: 'FLAT', value: 0 },
        hotels: { type: 'FLAT', value: 0 },
        holidaysPackages: { type: 'FLAT', value: 0 },
      },
      B2C: {
        flights: { type: 'FLAT', value: 0 },
        hotels: { type: 'FLAT', value: 0 },
        holidaysPackages: { type: 'FLAT', value: 0 },
      },
    },
  });
};





