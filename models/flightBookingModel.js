// models/FlightBooking.js
import mongoose from "mongoose";

const travelerSchema = new mongoose.Schema({
    travelerId: { type: String, required: true }, // Amadeus traveler id ("1", "2" etc.)
    firstName: String,
    lastName: String,
    dob: Date,
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    email: String,
    phone: String,
    passportNumber: String,
    passportExpiry: Date,
    nationality: String,
}, { _id: false });

const segmentSchema = new mongoose.Schema({
    airline: String,
    flightNumber: String,
    origin: String,
    destination: String,
    departureTime: Date,
    arrivalTime: Date,
    duration: String,   // PT2H20M
    cabin: String,
    bookingClass: String,
}, { _id: false });

const priceSchema = new mongoose.Schema({
    currency: String,
    total: String,
    base: String,
    taxes: String,
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    searchId: { type: String },  // link to search request
    amadeusOfferId: { type: String }, // flight-offer id from Amadeus
    amadeusOrderId: { type: String }, // returned from /v1/booking/flight-orders
    pnr: { type: String },  // recordLocator from Amadeus response

    status: {
        type: String,
        enum: ["SEARCHED", "PRICED", "PENDING", "CONFIRMED", "CANCELLED"],
        default: "SEARCHED"
    },

    travelers: [travelerSchema],

    itinerary: [segmentSchema], // multiple segments (onward/return)

    price: priceSchema,

    contactEmail: String,
    contactPhone: String,

    rawResponse: { type: Object }, // Amadeus ka pura JSON response for debugging

    createdAt: { type: Date, default: Date.now }
});

const FlightBooking = mongoose.model("FlightBooking", bookingSchema);
export default FlightBooking;
