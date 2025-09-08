import express from "express";
import { login, signup } from "../controllers/userControllers.js";
import { createFlightAndHotelBooking, getAllFlightBooking, getBookedFlightById } from "../controllers/flightAndHotelBookingControllers.js";
import { Authenticate } from "../middleware/authMiddleware.js";
import { RegisterOrganisation } from "../controllers/OrganisationController.js";

const router = express.Router();

router.get("/dashboard", Authenticate, (req, res) => {
    res.json({
        message: "Welcome to the dashboard",
        user: req.user
    });
});

// Register organisation
router.post("/register", RegisterOrganisation);

// signup user
router.post("/signup-user", Authenticate, signup);
router.post("/sigin-user", login);


//Flight Booking
router.post('/create-flight-hotel-booking', Authenticate, createFlightAndHotelBooking);
router.get('/all-booked-flight-hotel', Authenticate, getAllFlightBooking);
router.get("/all-booked-flight-hotel/:id", Authenticate, getBookedFlightById);

//hotel Booking
// router.post("/create-hotel-booking", Authenticate, createHotelBooking);
// router.get("/all-booked-hotel", Authenticate, getAllHotelBooking);
// router.get("/all-booked-hotel/:id", Authenticate, getBookedHotelById);

export default router;




