import mongoose from "mongoose";

const markupManagementSchema = new mongoose.Schema({
    organisationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    
}, {
    timestamps: true,
    strict: false
});

const markupManagementModel = mongoose.model('MarkupManagement', markupManagementSchema);
export default markupManagementModel;