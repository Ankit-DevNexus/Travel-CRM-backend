import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], required: true
    },
    dateOfBirth: {
        type: Date, 
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    passportId: {
        type: String
    },
    email: {
        type: String, 
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    specialRequests: [{
        type: String
    }],
});

const flightSchema = new mongoose.Schema({
    tripType: {
        type: String,
        enum: ['One-Way', 'Round-Trip', 'Multi-City'],
        required: true
    },
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    departureTime: {
        type: String
    },
    passengers: {
        adults: {type: Number, required: true},
        children: {type: Number, default: 0},
        infants: {type: Number, default: 0}
    },
    class: {
        type: String,
        default: 'Economy'
    },
    preferredAirline: {
        type: String
    },
    fareType: {
        type: String,
        enum: ['Refundable', 'Non-refundable'], default: 'Refundable'
    },
    remarks: {
        type: String
    },
    specialFare: {
        type: String,
        enum: ['Regular', 'Student', 'Senior Citizen', 'Army', 'Doctor']
    }
});

const BookingSchema = new mongoose.Schema({
    passengerDetails: [passengerSchema],
    flightDetails: flightSchema,
    createdAt: {type: Date, default: Date.now}
});

const BookingModel = mongoose.model("booking", BookingSchema);
export default BookingModel;