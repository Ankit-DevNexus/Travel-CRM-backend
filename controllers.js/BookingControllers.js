import BookingModel from "../models/BookingModel.js";

export const createBooking = async (req, res) => {
    try {
        const booking = new BookingModel(req.body); // automatically validates against schema
        const savedBooking = await booking.save();
        res.status(201).json({ success: true, data: savedBooking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const getAllBookings = async (req, res) => {
    try {
        const bookings = await BookingModel.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const getBookingById = async (req, res) => {
    try {
        const booking = await BookingModel.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const updatedBooking = await BookingModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, data: updatedBooking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const deleteBooking = async (req, res) => {
    try {
        const deletedBooking = await BookingModel.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};