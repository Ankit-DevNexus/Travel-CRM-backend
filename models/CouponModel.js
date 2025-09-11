import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

}, {
    timestamps: true,
    strict: false
})


const CouponModel = mongoose.model("CouponCollection", couponSchema);

export default CouponModel;