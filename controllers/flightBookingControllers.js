import flightBookingModel from "../models/flightBookingModel.js";
import mongoose from "mongoose";


export const createFlightBooking = async (req, res) => {
    try {
        // validate that body is not empty
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body cannot be empty" });
        }

        // create instance with all fields from req.body
        const flight = new flightBookingModel({
            adminId: req.user.role === "admin" ? req.user._id : req.user.adminId,
            createdBy: req.user.name,
            createdByEmail: req.user.email,
            createdByRole: req.user.role,
            ...req.body
        });


        // save to DB
        const savedFlight = await flight.save();

        res.status(201).json({
            message: "Flight booking created successfully",
            flights_Data: savedFlight,
        });
    } catch (error) {
        console.error("Error saving flight:", error);

        // handle mongoose validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                error: "Validation failed",
                details: Object.values(error.errors).map((err) => err.message),
            });
        }
        res.status(500).json({ error: "Failed to save flight" });
    }
};


export const getAllFlightBooking = async (req, res) => {
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
            query.adminId = req.user._id;
        } else if (req.user.role === "user") {
            query.$or = [
                { adminId: req.user.adminId, createdByEmail: req.user.email }, // user’s own leads
                { adminId: req.user.adminId, createdByRole: "admin" }          // admin’s leads
            ];
        }

        // fetch data
        // promise.all([]) run queries in parallel
        const [flights, totalLeads] = await Promise.all([
            flightBookingModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }), // → fetches only the records for the current page, sorted by newest first.
            flightBookingModel.countDocuments(query) //→ gets the total number of records (needed to calculate total pages).
        ]);

        res.status(200).json({
            message: "All booked flights fetched successfully",
            totalLeads,
            currentPage,
            totalPages: Math.ceil(totalLeads / limit),
            data: flights,
        });

    } catch (error) {
        console.error("Error fetching flights:", error);

        res.status(500).json({
            error: "Failed to fetch flights",
            details: error.message,
        });
    }
};


export const getBookedFlightById = async (req, res) => {
    try {
        const { id } = req.params;

        // validate objectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: "Invalid flight ID",
            });
        }

        // fetch flight
        const flight = await flightBookingModel.findById(id);

        if (!flight) {
            return res.status(404).json({
                error: "Flight not found",
            });
        }

        res.status(200).json({
            message: "Flight fetched successfully",
            data: flight,
        });
    } catch (error) {
        console.error("Error fetching flight:", error);

        res.status(500).json({
            error: "Failed to fetch flight",
            details: error.message,
        });
    }
};



export const updateFlightBooking = async (req, res) => {
    try {
        const { leadIds } = req.body;       // Array of Lead IDs
        const updateData = req.body.updateData; // Fields to update

        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return res.status(400).json({ message: "leadIds must be a non-empty array" });
        }

        let query = {};
        if (req.user.role === "admin") {
            query.adminId = new mongoose.Types.ObjectId(req.user._id);
        } else {
            query.adminId = new mongoose.Types.ObjectId(req.user.adminId);
            query.assignedTo = String(req.user._id);
        }

        query._id = { $in: leadIds.map(id => new mongoose.Types.ObjectId(id)) };

        // Perform update
        const result = await LeadsModel.updateMany(
            query,
            { $set: updateData },
            { new: true }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "No matching leads found or permission denied" });
        }

        return res.status(200).json({
            message: "Leads updated successfully",
            matched: result.matchedCount,
            modified: result.modifiedCount
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error updating leads",
            error: error.message
        });
    }
}