import mongoose from "mongoose";
import MarkupManagementModel from "../models/MarkupManagementModel.js";

export const CreateMarkupManagement = async (req, res) => {
    try {
        const user = req.user;

        const markupData = await MarkupManagementModel.create({
            ...req.body,
            organisationId: user.organisationId,
            adminId: user.adminId,
            userId: user._id,
        });

        res.json({ message: "Markup created successfully", markupData });
    } catch (error) {
        console.error("Error creating markup:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllMarkupManagement = async (req, res) => {
    try {
        // const user = req.user;
         let query = {};

        if (req.user.role === "admin") {
            // Admin should see everything created in his organisation
            query.organisationId = req.user.organisationId;
        } else if (req.user.role === "user") {
            // User should only see his own bookings
            query.userId = req.user._id;
        }

        const markupData = await MarkupManagementModel.find(query)

        res.json({
            message: "Booking created successfully",
            totalMarkup: markupData.length,
            markupData,
        });

    } catch (error) {
        console.error("Error creating markup:", error);
        res.status(500).json({ error: error.message });
    }
}

export const getMarkupManagementById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid markup ID" });
        }

        const markup = await MarkupManagementModel.findById(id);
        if (!markup) return res.status(404).json({ error: "markup details not found" });

        res.status(200).json({ message: "markup details fetched successfully", data: markup });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch markup details", details: error.message });
    }
}

export const updateMarkupManagement= async (req, res) => {
     try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid markup ID" });
        }

        const updatedMarkup = await MarkupManagementModel.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedMarkup) {
            return res.status(404).json({ error: "markup not found" });
        }

        res.status(200).json({
            message: "markup updated successfully",
            data: updatedMarkup,
        });
    } catch (error) {
        console.error("Error updating markup:", error);
        res.status(500).json({
            error: "Failed to update markup",
            details: error.message,
        });
    }
};

// Delete markup
export const deleteMarkupManagement = async (req, res) =>{
    try {
        
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid markup ID"})
        }
        
        const deletemarkup = await MarkupManagementModel.findByIdAndDelete(id);

        if (!deletemarkup) {
            return res.status(404).json({ error: "markup not found"})
        }

        res.status(200).json({
            message: "markup delete sccessfully",
            data: deletemarkup
        })
    } catch (error) {
        console.error("Error deleting markup:", error);
        res.status(500).json({
            error: "Failed to delete markup",
            details: error.message,
        });
    }
}