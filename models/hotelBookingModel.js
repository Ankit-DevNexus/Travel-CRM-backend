import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
    {}, {strict: false}
);

const hotelModel = mongoose.model("hotel", hotelSchema);
export default hotelModel;
