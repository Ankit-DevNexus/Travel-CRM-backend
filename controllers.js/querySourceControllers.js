import SourceModel from "../models/SourceModel.js";
import SourceDetailModel from "../models/SourceDetailsModel.js";

export const CreateQuery = async (req, res) => {
    try {
        const {
            querySource,
            referenceId,
            saleTo,
            duration,
            guestDetails,
            comments,
            sourceDetails
        } = req.body;

        let sourceDetailsId;
        if (sourceDetails) {
            const newDetails = new SourceDetailModel(sourceDetails);
            const savedDetails = await newDetails.save();
            sourceDetailsId = savedDetails._id;
        }

        const newQuery = new SourceModel({
            querySource,
            referenceId,
            saleTo,
            duration,
            guestDetails,
            comments,
            sourceDetails: sourceDetailsId || null,
        });

        const savedQuery = await newQuery.save();
        res.status(201).json(savedQuery);
    } catch (error) {
        console.error("Error creating query", error);
        res.status(500).json({ message: "Error creating query", error });
    }
};


export const getAllQueries = async (req, res) => {
    try {
        const queries = await SourceModel.find().populate("sourceDetails");
        res.status(200).json(queries);
    } catch (error) {
        res.status(500).json({ message: "Error fetching queries", error });
    }
};


export const getQueryById = async (req, res) => {
    try {
        const query = await SourceModel.findById(req.params.id).populate("sourceDetails");
        if (!query) {
            return res.status(404).json({ message: "Query not found" });
        }
        res.status(200).json(query);
    } catch (error) {
        res.status(500).json({ message: "Error fetching query", error });
    }
};


export const updateQuery = async (req, res) => {
    try {
        const updatedQuery = await SourceModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate("sourceDetails");

        if (!updatedQuery) {
            return res.status(404).json({ message: "Query not found" });
        }
        res.status(200).json(updatedQuery);
    } catch (error) {
        res.status(500).json({ message: "Error updating query", error });
    }
};


export const deleteQuery = async (req, res) => {
    try {
        const deletedQuery = await SourceModel.findByIdAndDelete(req.params.id);
        if (!deletedQuery) {
            return res.status(404).json({ message: "Query not found" });
        }
        res.status(200).json({ message: "Query deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting query", error });
    }
};
