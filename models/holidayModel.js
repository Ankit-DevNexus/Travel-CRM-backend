import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
    {},{strict: false});

const holidayModel = mongoose.model("holiday", holidaySchema);
export default holidayModel;
