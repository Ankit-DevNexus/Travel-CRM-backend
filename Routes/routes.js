import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { createlogin, createUser } from "../controllers.js/userControllers.js";
import { CreateQuery, deleteQuery, getAllQueries, getQueryById, updateQuery } from "../controllers.js/querySourceControllers.js";
import { bookFlight, getAllBookings, getBooking, priceBooking, saveSearch } from "../controllers.js/flightControllers.js";
import { createHoliday, getAllHolidays, getHolidayById } from "../controllers.js/holidayControllers.js";
import { deleteusermanagement, getAllManagements, getUserManagementById, updateusermanagement, userManagement } from "../controllers.js/UserManagementControllers.js";
import { createBooking, deleteBooking, getBookingById, updateBooking } from "../controllers.js/BookingControllers.js";
import { createHotel, getAllHotel, getHotelById } from "../controllers.js/hotelBookingControllers.js";

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
    res.json({
        message: "Welcome to the dashboard",
        user: req.user
    });
});

router.post("/create-query", CreateQuery);
router.get("/All-query", getAllQueries);
router.get("/All-query/:id", getQueryById);
router.put("/All-query/:id", updateQuery);
router.delete("/All-query/:id", deleteQuery);

router.post("/create-user", createUser);
router.post("/create-login", createlogin);

router.post("/search", saveSearch);
router.post("/:id/price", priceBooking);
router.post("/:id/book", bookFlight);
router.get("/", getAllBookings);
router.get("/:id", getBooking);

//Flight Booking
router.post('/create-holiday', createHoliday);
router.get('/Allholiday',getAllHolidays);
router.get("/Allholiday/:id", getHolidayById);

//hotel Booking
router.post("/create-hotel", createHotel);
router.get("/AllHotel", getAllHotel);
router.get("/AllHotel/:id", getHotelById);

// User Management routes
router.post("/usermanagement", userManagement);
router.get("/all-user", getAllManagements);
router.get("/all-user/:id", getUserManagementById);
router.put("/all-user/:id", updateusermanagement);
router.delete("/all-user/:id", deleteusermanagement);

router.post("/Booking", createBooking);
router.get("/All-Booking", getAllBookings);
router.get("/All-Booking/:id", getBookingById);
router.put("/All-Booking/:id", updateBooking);
router.delete("/All-Booking/:id", deleteBooking);

export default router;