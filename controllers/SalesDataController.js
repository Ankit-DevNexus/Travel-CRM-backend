import SalesDataModel from '../models/SalesDataModel.js';

export const getAllSalesData = async (req, res) => {
  try {
    // Get page and limit from query params, default to page 1 and limit 10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Fetch total count for pagination info
    const totalSales = await SalesDataModel.countDocuments();

    // Fetch paginated data
    const salesData = await SalesDataModel.find().skip(skip).limit(limit).lean();

    return res.status(200).json({
      success: true,
      message: 'Fetched sales data successfully',
      totalSales,
      page,
      totalPages: Math.ceil(totalSales / limit),
      salesData,
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales data',
      error: error.message,
    });
  }
};
