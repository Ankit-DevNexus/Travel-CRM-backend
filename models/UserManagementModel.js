import mongoose from "mongoose";

const UserManagementSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+91[0-9]{10}$/, "Invalid phone number"],
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    permissions: {
        flights: { type: Boolean, default: false },
        hotels: { type: Boolean, default: false },
        holidayPackage: { type: Boolean, default: false }
    },

    // 🆕 Track last login and login history
    lastLogin: { 
        type: Date, 
        default: Date.now 
    },
    lastLogout: {
        type: Date,
        default: Date.now
    },
    loginHistory: [
        {
            loginAt: { type: Date, default: Date.now },
            logoutAt: {type: Date, default: Date.now},
            ip: String,
            userAgent: String,
            summary: {type: String}
        }
    ]

}, { timestamps: true });

const UserManagement = mongoose.model("usermanagement", UserManagementSchema);
export default UserManagement;
