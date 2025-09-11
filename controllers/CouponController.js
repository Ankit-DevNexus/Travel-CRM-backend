import CouponModel from "../models/COuponModel.js";

export const createCoupon = async (req, res) => {

    try {
        const user = req.user;

        const couponData = await CouponModel.create({
            ...req.body,
            organisationId: user.organisationId,
            adminId: user.adminId,
            userId: user._id,
        });

        res.json({ message: "Booking created successfully", couponData });
    } catch (error) {
        res.status(500).json({ msg: err.message });
    }
}


export const getAllCoupon = async (req, res) => {
     try {

        //  pagination
        // comes from frontend (e.g., ?currentPage=2&limit=10
        // If frontend doesn’t send it, default currentPage = 1 and limit = 7.
        // limit → how many documents per page.

        // const currentPage = parseInt(req.query.currentPage) || 1;
        // const limit = parseInt(req.query.limit) || 7;
        // const skip = (currentPage - 1) * limit;

        let query = {};

        if (req.user.role === "admin") {
            query.adminId = req.user._id;
        } else if (req.user.role === "user") {
            query.$or = [
                // { adminId: req.user.adminId, createdByEmail: req.user.email }, // user’s own leads
                // { adminId: req.user.adminId, createdByRole: "admin" } 
                { userId: req.user._id },        // user’s own bookings
                { adminId: req.user.adminId }    // admin’s bookings         // admin’s leads
            ];
        }

        // fetch data
        // promise.all([]) run queries in parallel
        // const [coupon, totalLeads] = await Promise.all([
        //     CouponModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }), // → fetches only the records for the current page, sorted by newest first.
        //     CouponModel.countDocuments(query) //→ gets the total number of records (needed to calculate total pages).
        // ]);

        const coupon = await CouponModel.find(query);

        res.status(200).json({
            message: "All booked flights and hotels fetched successfully",
            // totalLeads,
            // currentPage,
            // totalPages: Math.ceil(totalLeads / limit),
            data: coupon,
        });

    } catch (error) {
        console.error("Error fetching flights:", error);

        res.status(500).json({
            error: "Failed to fetch flights",
            details: error.message,
        });
    }
}