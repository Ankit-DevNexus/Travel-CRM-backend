import mongoose from "mongoose";
import hotelBookingModel from "../models/hotelBookingModel.js";

// Create Hotel Booking
export const createHotelBooking = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body cannot be empty" });
        }

        const hotel = new hotelBookingModel({
            adminId: req.user._id,       // logged-in Admin ID
            user_email: req.user.email,  // logged-in Admin email
            createdBy: req.user.name,    // logged-in Admin name
            ...req.body
        });
        const savedhotel = await hotel.save();

        res.status(201).json({
            message: "Hotel booking created successfully",
            data: savedhotel,
        });
    } catch (error) {
        console.error("Error saving hotel:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                error: "Validation failed",
                details: Object.values(error.errors).map((err) => err.message),
            });
        }

        res.status(500).json({ error: "Failed to save hotel" });
    }
};

// Get All Hotel Bookings (with pagination)
export const getAllHotelBooking = async (req, res) => {
    try {

        //  pagination
        // comes from frontend (e.g., ?currentPage=2&limit=10
        // If frontend doesn’t send it, default currentPage = 1 and limit = 7.
        // limit → how many documents per page.
        
        const currentPage = parseInt(req.query.currentPage) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const skip = (currentPage - 1) * limit;

        let query = {};

        if (req.user.role === "admin") {
            // Admin sees only his own leads
            query.adminId = new mongoose.Types.ObjectId(req.user._id);
        } else if (req.user.role === "user") {
            // User sees all leads created by their Admin
            query.adminId = new mongoose.Types.ObjectId(req.user.adminId);

            // later when assignedTo is ObjectId
            // query.assignedTo = req.user._id;
        }

        const [hotels, totalLeads] = await Promise.all([
            hotelBookingModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
            hotelBookingModel.countDocuments(query),
        ]);

        res.status(200).json({
            message: "All booked hotels fetched successfully",
            totalLeads,
            currentPage,
            totalPages: Math.ceil(totalLeads / limit),
            data: hotels,
        });
    } catch (error) {
        console.error("Error fetching hotels:", error);

        res.status(500).json({
            error: "Failed to fetch hotels",
            details: error.message,
        });
    }
};


// Get Hotel by ID
export const getBookedHotelById = async (req, res) => {
    try {
        const { id } = req.params;

        // validate objectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid flight ID",
            });
        }

        // fetch flight
        const hotel = await hotelBookingModel.findById(id);
        if (!hotel) {
            return res.status(404).json({
                error: "Hotel not found",
            });
        }

        res.status(200).json({
            message: "Flight fetched successfully",
            data: flight,
        });
    } catch (error) {
        console.error("Error fetching hotel:", error);
        res.status(500).json({
            error: "Failed to fetch hotel",
            details: error.message,
        });
    }
};
