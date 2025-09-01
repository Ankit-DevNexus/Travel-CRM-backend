import UserManagement from "../models/UserManagementModel.js";
import bcrypt from "bcrypt";

export const userManagement = async (req, res) => {
    try {
        const {firstName, lastName, email, phoneNumber, password, confirmPassword, role, permissions, summary} = req.body;

        if(password !== confirmPassword) {
            return res.status(400).json({message: "Password do not match"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newManagement = new UserManagement({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            confirmPassword,
            role,
            permissions,
            lastLogin: new Date(),
            lastLogout: new Date(),
            loginHistory:[
                {
                    loginAt: new Date(),
                    logoutAt: null,
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    summary
                }
            ]
        });

        await newManagement.save();
        res.status(201).json({message: "User Management Created Successfully", user: newManagement});
    } catch (error) {
        res.status(500).json({message: "Error Creating User Management", error: error.message});
    }
};

// Get Api
export const getAllManagements = async (req, res) => {
    try {
        const managements = await UserManagement.find();
        res.status(200).josn(managements);
    } catch (error) {
        res.status(500).json({message: "Error fetching User Managements", error: error.message});
    }
};

// Get User By Id
export const getUserManagementById = async (req, res) => {
    try {
        const management = await UserManagement.findById(req.params.id);
        if(!management) return res.status(404).json({message: "User Management Not Found"});
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: "Error fetching User Management", error: error.message});
    }
};

// Update User
export const updateusermanagement = async (req, res) => {
    try {
        const {password, confirmPassword} = req.body;

        if(password && confirmPassword) {
            if(password !== confirmPassword) {
                return res.status(400).json({message: "Passwords do not match"});
            }
            req.body.password = await bcrypt.hash(password, 10);
            req.body.confirmPassword = req.body.password;
        }

        const updateUserManagement = await UserManagement.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!updateUserManagement) return res.status(404).json({message: "User Management not found"});

        res.status(200).json({message: "User Updated Successfully", user: updateUserManagement})
    } catch (error) {
        res.status(500).json({message: "Error updating user", error: error.message});
    }
};

// Delete User
export const deleteusermanagement = async (req, res) => {
    try {
        const deletedUserManagement = await UserManagement.findByIdAndDelete(req.params.id);
        if(!deletedUserManagement) return res.status(404).json({message: "User Management not found"});

        res.status(200).json({message: "User Management Deleted Successfully"});
    } catch (error) {
        res.status(500).json({message: "Error deleting user management", error: error.message});
    }
};
