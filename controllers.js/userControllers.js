import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
console.log("Loaded JWT_SECRET From .env file", JWT_SECRET);

export const createUser = async (req, res) => {
    const {name, username, email, phoneNumber, password, confirmPassword, role} = req.body;

    try {
        if(password !== confirmPassword){
            return res.status(400).json({message: "Password don't match"});
        }
        const normalizedEmail = email.toLowerCase();
        const normalizedUsername = username.toLowerCase();

        const existingUser = await userModel.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername },
                { phoneNumber }
            ]
        });
        
        if(existingUser) {
            return res.status(400).json({
                message: "Username & Email already Exist"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name,
            email: normalizedEmail,
            username: normalizedUsername,
            phoneNumber,
            password: hashedPassword,
            role: role || "user"
        });

        await newUser.save();

        const token = jwt.sign({id: newUser._id, username: newUser.username, email: newUser.email}, JWT_SECRET, {expiresIn: "1d"});

        res.status(201).json({
            message: "User Created Successfully", 
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                role:newUser.role
            }
        });
    }  catch (error) {
        console.error("Signup Error", error);
        res.status(500).json({message: "Server Error"});
    }
};

export const createlogin = async (req, res) => {
    const {username, password} = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: "username and password are required" });
        }
        const isEmail = username.includes("@");
        const normalizedusername = isEmail ? username.toLowerCase().trim() : username.trim();

        const newUser = await userModel.findOne({
            $or: [
                { email: normalizedusername },
                { username: normalizedusername },
                { phoneNumber: username }
            ]
        });

        if(!newUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, newUser.password);
        
        if(!isMatch) {
            return res.status(401).json({
                message: "Invalid Credentials"
            });
        }

        const token = jwt.sign({
            id: newUser._id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }, JWT_SECRET, {expiresIn: "1d"});

        res.status(200).json({
            message: "Create User Login Successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role
            }
        });
    }
    catch (error) {
        console.error("Login Error", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};