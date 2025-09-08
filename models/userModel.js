// models/UserModel.js

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  EmpUsername: {
    type: String,
    unique: true,
    sparse: true   // allows multiple docs with null

  },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  permissions: {
    type: Map,
    of: Boolean,
    default: {}
  },
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // the admin who created this user
  
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }, // track last login
  
  loginHistory: [
    {
      loginAt: { type: Date },
      ip: String,
      userAgent: String,
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("User", UserSchema);
export default userModel;

// import mongoose from "mongoose";
// import bcrypt from "bcrypt";

// const userSchema = new mongoose.Schema({
//   name: String,
//   EmpUsername: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   email: { type: String, unique: true, lowercase: true, trim: true },
//   phone: {
//     type: String,
//     unique: true
//   },
//   password: String,
//   role: { 
//     type: String,
//     default: "user"
//   },
//   adminId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "User" 
//   }, // link User
//   permissions: {
//     type: Map,
//     of: Boolean,
//     default: {}
//   },
//   facebookPages: [ // store connected FB pages for Admin
//     {
//       pageId: String,
//       pageName: String,
//       accessToken: String
//     }
//   ],
//   isActive: { type: Boolean, default: true },
//   lastLogin: { type: Date, default: Date.now },
//   loginHistory: [{
//     loginAt: { type: Date, default: Date.now },
//     ip: String,
//     userAgent: String
//   }],
//   resetPasswordToken: String,
//   resetPasswordExpires: Date,
// }, { timestamps: true });

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Compare password
// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// const userModel = mongoose.model("User", userSchema)
// export default userModel;