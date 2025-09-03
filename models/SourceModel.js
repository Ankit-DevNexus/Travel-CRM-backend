import mongoose from "mongoose";

const SourceSchema = new mongoose.Schema({
    querySource: {
        type: String, 
        required: true,
        enum: ["Direct Query", "Reference Query", "Add New Query"]
    },
    referenceId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Source" 
    }, 
    saleTo: {
        type: String, 
        enum: ["Company Owner", "Sahil"],
        required: true
    },
    duration: {
        destination: { type: String, required: true },
        startDate: { type: Date, required: true },
        noOfNights: { type: Number, required: true },
        noOfAdults: { type: Number, required: true },
        children: [
            {
                age: { type: Number }
            }
        ]
    },
    guestDetails: {
        name: { type: String, required: true },
        phoneNo: { type: String, required: true }
    },
    comments: { type: String }, 
    sourceDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SourceDetails"
    }
}, { timestamps: true });

const SourceModel = mongoose.model("Source", SourceSchema);
export default SourceModel;