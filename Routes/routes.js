import express from "express";
import { deleteUser, getAllUsers, login, signup, updateUser } from "../controllers/userControllers.js";
import { createFlightAndHotelBooking, deleteFlightAndHotelBooking, getAllFlightAndHotelBooking,  getBookedFlightAndHotelById,  updateFlightAndHotelBooking } from "../controllers/flightAndHotelBookingControllers.js";
import { Authenticate } from "../middleware/authMiddleware.js";
import { RegisterOrganisation } from "../controllers/OrganisationController.js";
import { createHolidayPackageBooking, deleteHolidayPackageBooking, getAllHolidayPackageBooking, getBookedHolidayPackageById, updateHolidayPackage } from "../controllers/CustomHolidayPackageController.js";
import { createCoupon, getAllCoupon } from "../controllers/CouponController.js";

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

router.get("/get-all-users", Authenticate, getAllUsers);
router.patch("/get-all-users/:id", Authenticate, updateUser);
router.delete("/get-all-users/:id", Authenticate, deleteUser);


//Flight and Hotel Booking
router.post('/booked-flight-hotel/create', Authenticate, createFlightAndHotelBooking);
router.get('/all-booked-flight-hotel', Authenticate, getAllFlightAndHotelBooking);
router.get("/all-booked-flight-hotel/:id", Authenticate, getBookedFlightAndHotelById);

router.patch("/all-booked-flight-hotel/update/:id", Authenticate, updateFlightAndHotelBooking);

router.delete("/all-booked-flight-hotel/delete/:id", Authenticate, deleteFlightAndHotelBooking);


// Custom Holiday Package
router.post('/book-holiday-package/create', Authenticate, createHolidayPackageBooking);
router.get('/all-booked-holiday-package', Authenticate, getAllHolidayPackageBooking);
router.get("/all-booked-holiday-package/:id", Authenticate, getBookedHolidayPackageById);

router.patch("/all-booked-holiday-package/update/:id", Authenticate, updateHolidayPackage);

router.delete("/all-booked-holiday-package/delete/:id", Authenticate, deleteHolidayPackageBooking);


// coupon 
router.post('/coupon/create', Authenticate, createCoupon);
router.get('/all-coupon', Authenticate, getAllCoupon);



export default router;





