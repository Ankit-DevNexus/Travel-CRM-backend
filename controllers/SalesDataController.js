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
      currentPage: page,
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

// get single sales
export const getSalesDataById = async (req, res) => {
  try {
    const { id } = req.params;

    const salesData = await SalesDataModel.findById(id).lean();

    if (!salesData) {
      return res.status(404).json({
        success: false,
        message: 'Sales data not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Fetched sales data successfully',
      salesData,
    });
  } catch (error) {
    console.error('Error fetching sales data by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales data',
      error: error.message,
    });
  }
};

// Update sales
export const updateSalesData = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedData = await SalesDataModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true, lean: true });

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: 'Sales data not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sales data updated successfully',
      updatedData,
    });
  } catch (error) {
    console.error('Error updating sales data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update sales data',
      error: error.message,
    });
  }
};

// Delete sales
export const deleteSalesData = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedData = await SalesDataModel.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: 'Sales data not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sales data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sales data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete sales data',
      error: error.message,
    });
  }
};
