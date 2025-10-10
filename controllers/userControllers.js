// controllers/authUserController.js
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

// Generate JWT
const generateToken = (user) => {
  //  console.log("id: user._id, email: user.email,name: user.name, role: user.role",id, email, name, role);
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      adminId: user.role === 'admin' ? user._id.toString() : user.adminId ? user.adminId.toString() : null, // fallback if no admin assigned
      organisationId: user.organisationId, // important
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );
};

export const signup = async (req, res) => {
  try {
    // Only admin can create sub-users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not allowed' });
    }

    // Get admin details
    const adminUser = await userModel.findById(req.user._id).select('userId organisationId');
    console.log('adminUser', adminUser);

    if (!adminUser) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    // Generate unique EMP ID
    const lastEmp = await userModel.findOne({ role: 'user' }).sort({ createdAt: -1 }).select('userId').lean();

    let newEmpId = 'EMP-A0001';
    if (lastEmp && lastEmp.userId) {
      const match = lastEmp.userId.match(/EMP-A(\d+)/);
      const lastNumber = match ? parseInt(match[1]) : 0;
      const nextNumber = lastNumber + 1;
      newEmpId = `EMP-A${nextNumber.toString().padStart(4, '0')}`;
    }

    // Create sub-user
    const newUser = await userModel.create({
      ...req.body,
      EmpUsername: req.body.EmpUsername || req.body.email.split('@')[0],
      role: 'user',
      userId: newEmpId,
      createdByUserId: adminUser.userId,
      adminId: adminUser.createdByUserId || adminUser._id,
      organisationId: adminUser.organisationId,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email or username already exists' });
    }
    res.status(400).json({ msg: 'Error creating user', error: err.message });
  }
};

// export const signups = async (req, res) => {
//   try {
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ msg: 'Not allowed' });
//     }

//     // Find the last created user to get the latest userId
//     const lastUser = await userModel.findOne({}, {}, { sort: { createdAt: -1 } });

//     let newUserId = 'EMP-A0001'; // default for first user
//     if (lastUser && lastUser.userId) {
//       // Extract the numeric part and increment
//       const lastNumber = parseInt(lastUser.userId.replace('EMP-A', '')) || 0;
//       const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
//       newUserId = `EMP-A${nextNumber}`;
//     }

//     // Create new user
//     const newUser = await userModel.create({
//       ...req.body,
//       EmpUsername: req.body.EmpUsername || req.body.email.split('@')[0],
//       role: 'user',
//       organisationId: req.user.organisationId,
//       adminId: req.user._id,
//       userId: newUserId, // unique incremental user ID
//     });

//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       data: newUser,
//     });
//   } catch (err) {
//     console.error('Error creating user:', err);
//     res.status(400).json({ msg: 'Error creating user', error: err.message });
//   }
// };

// // Login Controller
export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body; // Get role from request

    let query = {};
    if (!isNaN(username)) {
      query = { phone: username };
    } else {
      query = { email: username.trim().toLowerCase() };
    }

    const user = await userModel.findOne(query);

    if (!user || !user.isActive) return res.status(400).json({ msg: 'Invalid username or account disabled' });

    // Validate role
    if (role && user.role !== role) {
      return res.status(403).json({ msg: 'Access denied: Role mismatch' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    user.lastLogin = new Date();

    user.loginHistory.push({
      loginAt: user.lastLogin,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await user.save();

    const token = generateToken(user);

    // In your login controller
    res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'admin') {
      // Get only users from this admin's organisation, excluding admin himself
      query = {
        organisationId: new mongoose.Types.ObjectId(req.user.organisationId),
        role: 'user', // only normal users
        adminId: req.user._id, // users created by this admin
      };
    } else {
      // Normal user → can only see themselves
      query = { _id: req.user._id };
    }

    const users = await userModel.find(query).select('-password');

    res.status(200).json({
      message: 'Users fetched successfully',
      totolUser: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    // Get allowed schema keys
    const allowedUpdates = Object.keys(userModel.schema.paths);

    // Filter req.body to only include valid schema fields
    const updates = {};
    for (const key of Object.keys(req.body)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: updates }, // only update provided fields
      { new: true }, // return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// // Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// // Update User
// export const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Get allowed schema keys
//     const allowedUpdates = Object.keys(userModel.schema.paths);

//     // Filter req.body to only include valid schema fields
//     const updates = {};
//     for (const key of Object.keys(req.body)) {
//       if (allowedUpdates.includes(key)) {
//         updates[key] = req.body[key];
//       }
//     }

//     const updatedUser = await userModel.findByIdAndUpdate(
//       id,
//       { $set: updates }, // only update provided fields
//       { new: true } // return updated document
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(updatedUser);
//   } catch (err) {
//     console.error("Error updating user:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
