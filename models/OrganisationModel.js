// models/Organization.js
import mongoose from 'mongoose';

const orgSchema = new mongoose.Schema(
  {
    adminId: String,
    companyName: { type: String, required: true },
    industry: String,
    adminEmail: { type: String, required: true, unique: true },
    adminPhone: String,
    billing: {
      planId: String,
      cycle: { type: String, enum: ['monthly', 'annual'] },
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    logoUrl: String,
    gstNumber: String,
  },
  { timestamps: true },
);

const Organization = mongoose.model('Organization', orgSchema);
export default Organization;
