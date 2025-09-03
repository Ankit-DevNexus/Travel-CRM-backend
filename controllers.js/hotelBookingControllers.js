import hotelModel from "../models/hotelBookingModel.js";

export const createHotel = async (req, res) => {
    try {
        const hotel = new hotelModel(req.body);
        const savedHotel = await hotel.save();
        res.status(201).json(savedHotel);
    } catch (error) {
        console.error("Error saving hotel", error);
        res.status(500).json({error: "Failed to save hotel"})
    }
};

export const getAllHotel = async (req, res) => {
    try {
        const hotels = await hotelModel.find();
        res.status(200).json(hotels);
    } catch (error) {
        console.error("error fetching hotel", error);
        res.status(500).json({error: "Failed to fetch hotel"});
    }
};

export const getHotelById = async (req, res) => {
    try {
        const hotels = await hotelModel.findById(req.params.id);
    if(!hotels) {
        return res.status(404).json({error: "Hotel not found"});
    }
    res.status(200).json(hotels);
    } catch (error) {
        console.error("Error fetching holiday", error);
        res.status(500).json({error: "failed to fetch hotel"});
    }
};