import express from 'express';
import { deleteUser, getAllUsers, login, signup, updateUser } from '../controllers/userControllers.js';
import {
  createFlightAndHotelBooking,
  deleteFlightAndHotelBooking,
  getAllFlightAndHotelBooking,
  getBookedFlightAndHotelById,
  updateFlightAndHotelBooking,
} from '../controllers/flightAndHotelBookingControllers.js';
import { Authenticate } from '../middleware/authMiddleware.js';
import { getAllOrganisations, RegisterOrganisation } from '../controllers/OrganisationController.js';
import {
  createHolidayPackageBooking,
  deleteHolidayPackageBooking,
  getAllHolidayPackageBooking,
  getBookedHolidayPackageById,
  updateHolidayPackage,
} from '../controllers/CustomHolidayPackageController.js';
import { createCoupon, deleteCoupon, getAllCoupon, getCouponById, updateCoupon } from '../controllers/CouponController.js';
import {
  CreateMarkupManagement,
  deleteMarkupManagement,
  getAllMarkupManagement,
  getMarkupManagementById,
  updateMarkupManagement,
} from '../controllers/MarkupManagementController.js';
import { forgotPassword, resetPassword } from '../controllers/ForgetPasswordController.js';
import { deleteSalesData, getAllSalesData, getSalesDataById, updateSalesData } from '../controllers/SalesDataController.js';
import { submitFeedback, triggerFeedbackEmails } from '../controllers/feedbackController.js';
import { getAllAuditLogs } from '../controllers/AuditLogsController.js';

const router = express.Router();

router.get('/forgot-password', forgotPassword);
router.post('/forgot-password', forgotPassword);

// forget password
router.get('/reset-password/:token', resetPassword);
router.patch('/reset-password/:token', resetPassword);

// Register organisation
router.post('/register', RegisterOrganisation);
router.get('/register', getAllOrganisations);

// signup user
router.post('/signup-user', Authenticate, signup); // create user
router.post('/sigin-user', login);
router.get('/get-all-users', Authenticate, getAllUsers);
router.patch('/get-all-users/:id', Authenticate, updateUser);
router.delete('/get-all-users/:id', Authenticate, deleteUser);

//Flight and Hotel Booking
router.post('/booked-flight-hotel/create', Authenticate, createFlightAndHotelBooking);
router.get('/all-booked-flight-hotel', Authenticate, getAllFlightAndHotelBooking);
router.get('/all-booked-flight-hotel/:id', Authenticate, getBookedFlightAndHotelById);
router.patch('/all-booked-flight-hotel/update/:id', Authenticate, updateFlightAndHotelBooking);
router.delete('/all-booked-flight-hotel/delete/:id', Authenticate, deleteFlightAndHotelBooking);

// Custom Holiday Package
router.post('/book-holiday-package/create', Authenticate, createHolidayPackageBooking);
router.get('/all-booked-holiday-package', Authenticate, getAllHolidayPackageBooking);
router.get('/all-booked-holiday-package/:id', Authenticate, getBookedHolidayPackageById);
router.patch('/all-booked-holiday-package/update/:id', Authenticate, updateHolidayPackage);
router.delete('/all-booked-holiday-package/delete/:id', Authenticate, deleteHolidayPackageBooking);

// coupon
router.post('/coupon/create', Authenticate, createCoupon);
router.get('/all-coupon', Authenticate, getAllCoupon);
router.get('/all-coupon/:id', Authenticate, getCouponById);
router.patch('/update-coupon/:id', Authenticate, updateCoupon);
router.delete('/delete-coupon/:id', Authenticate, deleteCoupon);

// Markup Management
router.post('/markup/create', Authenticate, CreateMarkupManagement);
router.get('/all-markup', Authenticate, getAllMarkupManagement);

router.get('/all-markup/:id', Authenticate, getMarkupManagementById);
router.patch('/update-markup/:id', Authenticate, updateMarkupManagement);
router.delete('/delete-markup/:id', Authenticate, deleteMarkupManagement);

// get sales data
router.get('/all-sales-data', Authenticate, getAllSalesData);
router.get('/sales-data/:id', Authenticate, getSalesDataById);
router.patch('/sales-data/update/:id', Authenticate, updateSalesData);
router.delete('/sales-data/delete/:id', Authenticate, deleteSalesData);

// manual feedback send
router.post('/trigger-feedback-emails', triggerFeedbackEmails);
router.patch('/submit-feedback/:bookingId', submitFeedback);

// audit logs
router.get('/all-audit-logs', Authenticate, getAllAuditLogs);

export default router;
