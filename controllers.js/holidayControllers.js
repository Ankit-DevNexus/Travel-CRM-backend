import holidayModel from "../models/holidayModel.js";

export const createHoliday = async (req, res) => {
    try {
        const holiday = new holidayModel(req.body);
        const savedHoliday = await holiday.save();
        res.status(201).json(savedHoliday);
    } catch (error) {
        console.error("Error saving holiday:", error);
        res.status(500).json({error: "Failed to save holiday"});
    }
};

export const getAllHolidays = async (req, res) => {
    try {
        const holiday = await holidayModel.find();
        res.status(200).json(holiday);
    } catch (error) {
        console.error("Error Fetching holidays", error);
        res.status(500).json({error: 'Failed to fetch holidays'});
    }
};

export const getHolidayById = async (req, res) => {
    try {
        const holiday = await holidayModel.findById(req.params.id);
        if(!holiday) {
            return res.status(404).json({error: "Holiday not found"});
        }
        res.status(200).json(holiday);
    } catch (error) {
        console.error("Error fetching holiday", error);
        res.status(500).json({error: 'Failed to fetch holiday'});
    }
};