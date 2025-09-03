import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if token exists and is prefixed with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized. Token missing." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Store user data in request
        next(); // Allow access
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export default verifyToken;
