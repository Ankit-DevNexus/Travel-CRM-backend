import mongoose from 'mongoose';

const querySourceSchema = new mongoose.Schema(
  {
    source: String,
    referenceId: String,
    salesTeam: String,
    destination: String,
    startDate: Date,
    nights: Number,
    persons: {
      adults: Number,
      children: [Number], // array for child ages
    },
    guestDetails: {
      name: String,
      phone: String,
      email: String,
    },
    comments: String,
  },
  { _id: false }
);

const hotelBookingSchema = new mongoose.Schema(
  {
    checkInDate: Date,
    checkOutDate: Date,
    destination: String,
    roomType: String,
    rooms: Number,
    mealPlan: String,
    preferredHotel: String,
    guests: {
      adults: Number,
      children: Number,
    },
    prices: [
      {
        date: Date,
        rate: Number,
        given: Number,
      },
    ],
    inclusions: [String], // Wi-Fi, Swimming Pool etc.
  },
  { _id: false }
);

const transportSchema = new mongoose.Schema(
  {
    day: Date,
    serviceLocation: String,
    serviceType: String,
    transportation: [
      {
        name: String,
        rate: Number,
        given: Number,
      },
    ],
    activities: [
      {
        name: String,
        ticketType: String,
        duration: String,
        slot: String,
        tickets: [
          {
            type: { type: String }, // Adult / Child
            qty: { type: Number },
            rate: { type: Number },
            given: { type: Number },
          },
        ],
      },
    ],
  },
  { _id: false }
);

const flightBookingSchema = new mongoose.Schema(
  {
    tripType: { type: String, enum: ['One-Way', 'Round Trip', 'Multi-City'] },
    source: String,
    destination: String,
    preferredAirline: String,
    departureDate: Date,
    arrivalDate: Date,
    persons: {
      adults: Number,
      children: [Number],
    },
    prices: [
      {
        date: Date,
        rate: Number,
        given: Number,
      },
    ],
    specialRequests: [String], // Meals, WheelChair, Extra Luggage
    transportServices: [
      {
        name: String,
        rate: Number,
        given: Number,
      },
    ],
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    uniqueBookingId: { type: String, unique: true, required: true }, // important
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    querySource: querySourceSchema,
    hotelBooking: hotelBookingSchema,
    transportAndActivities: [transportSchema],
    flightBooking: flightBookingSchema,

    Status: {
      type: String,
      default: 'New',
    },
    AssignedTo: {
      type: String,
      default: null,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const HolidayPackageBookingModel = mongoose.model(
  'HolidayPackageBookingCollection',
  bookingSchema
);
export default HolidayPackageBookingModel;
