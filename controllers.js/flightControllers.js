import { amadeusPost, amadeusGet } from "../utils/amadeusClient.js";
import FlightBooking from "../models/flightBookingModel.js";


export async function saveSearch(req, res) {
    try {
        const { searchId, offers } = req.body;
        if (!offers || !offers.length) {
            return res.status(400).json({ message: "offers are required" });
        }

        const offer = offers[0];
        const booking = new FlightBooking({
            searchId,
            amadeusOfferId: offers[0].id,
            itinerary: offers[0].itineraries?.flatMap(i =>
                i.segments.map(s => ({
                    airline: s.carrierCode,
                    flightNumber: s.number,
                    origin: s.departure.iataCode,
                    destination: s.arrival.iataCode,
                    departureTime: s.departure.at,
                    arrivalTime: s.arrival.at,
                    duration: s.duration,
                }))
            ),
            price: {
                currency: offers[0].price.currency,
                total: offers[0].price.total,
                base: offers[0].price.base,
                taxes: offers[0].price.fees?.map(f => f.amount).join(",") || null,
            },
            rawResponse: offers[0],
            status: "SEARCHED"
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        console.error("Save Search Error:", err.message);
        res.status(500).json({ message: "Failed to save search result" });
    }
}


export async function priceBooking(req, res) {
    try {
        const booking = await FlightBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const data = await amadeusPost("/v1/shopping/flight-offers/pricing", {
            data: { type: "flight-offers-pricing", flightOffers: [booking.rawResponse] }
        });

        booking.price = {
            currency: data.data.flightOffers[0].price.currency,
            total: data.data.flightOffers[0].price.total,
            base: data.data.flightOffers[0].price.base,
            taxes: data.data.flightOffers[0].price.fees?.map(f => f.amount).join(",") || null,
        };
        booking.rawResponse = data.data.flightOffers[0];
        booking.status = "PRICED";

        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error("Price Booking Error:", err.message);
        res.status(500).json({ message: "Failed to price booking" });
    }
}


export async function bookFlight(req, res) {
    try {
        const { travelers } = req.body;
        const booking = await FlightBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const data = await amadeusPost("/v1/booking/flight-orders", {
            data: {
                type: "flight-order",
                flightOffers: [booking.rawResponse],
                travelers
            }
        });

        const order = data.data;
        booking.amadeusOrderId = order.id;
        booking.pnr = order.associatedRecordLocator || order.recordLocator || null;
        booking.travelers = travelers.map((t) => ({
            travelerId: t.id,
            firstName: t.name.firstName,
            lastName: t.name.lastName,
            dob: t.dateOfBirth,
            gender: t.gender,
            email: t.contact?.email,
            phone: t.contact?.phones?.[0]?.number,
            passportNumber: t.documents?.[0]?.number,
            passportExpiry: t.documents?.[0]?.expiryDate,
            nationality: t.documents?.[0]?.nationality,
        }));
        booking.status = "CONFIRMED";
        booking.rawResponse = order;

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        console.error("Book Flight Error:", err?.response?.data || err.message);
        res.status(500).json({ message: "Booking failed", error: err?.response?.data || err.message });
    }
}


export async function getAllBookings(req, res) {
    try {
        const bookings = await FlightBooking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
}

export async function getBooking(req, res) {
    try {
        const booking = await FlightBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch booking" });
    }
}
