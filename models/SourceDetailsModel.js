import mongoose from "mongoose";

const SourceDetailsSchema = new mongoose.Schema({
    typeOfSource: {
        type: String,
        enum: ["B2B Agent", "Direct Walkin"],
        required: true
    },
    agencyName: { 
        type: String ,
        required: true
    },
    shortName: {
        type: String,
        required: true
    },
    contactPerson: {
        name: { type: String },
        email: { type: String },
        phoneNo: { type: String }
    },
    address: {
        city: { type: String },
        state: { type: String },
        country: { type: String }
    }
}, { timestamps: true });

const SourceDetailModel = mongoose.model("SourceDetails", SourceDetailsSchema);
export default SourceDetailModel;