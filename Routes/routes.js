import express from "express";
import { login, signup } from "../controllers/userControllers.js";
import { createFlightBooking, getAllFlightBooking, getBookedFlightById } from "../controllers/flightBookingControllers.js";
import {  createHotelBooking, getAllHotelBooking, getBookedHotelById } from "../controllers/hotelBookingControllers.js";
import { Authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", Authenticate, (req, res) => {
    res.json({
        message: "Welcome to the dashboard",
        user: req.user
    });
});

router.post("/signup-user", signup);
router.post("/sigin-user", login);

//Flight Booking
router.post('/create-flight-booking', Authenticate, createFlightBooking);
router.get('/all-booked-flight', Authenticate, getAllFlightBooking);
router.get("/all-booked-flight/:id", Authenticate, getBookedFlightById);

//hotel Booking
router.post("/create-hotel-booking", Authenticate, createHotelBooking);
router.get("/all-booked-hotel", Authenticate, getAllHotelBooking);
router.get("/all-booked-hotel/:id", Authenticate, getBookedHotelById);

export default router;




