// middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const logger = require('../config/logger'); // Assuming you have this logger setup

const verifyToken = (req, res, next) => {
    const publicPaths = ["/", '/register', "/login"];
    const requestPath = req.path.split('?')[0];

    if (publicPaths.includes(requestPath)) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) { // Check format
        logger.error("Authorization header missing or malformed");
        return res.status(401).json({ message: "Authorization header 'Bearer token' is required." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        logger.error("Token is missing after 'Bearer '");
        return res.status(401).json({ message: "Token is missing." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user payload (importantly containing role) to request
        logger.info(`Token verified for user: ${decoded.email || decoded.id}`); // Log email or ID
        next(); // Proceed to next middleware or route handler
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        // Handle specific JWT errors if needed (e.g., TokenExpiredError)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired." });
        }
        return res.status(403).json({ message: "Invalid token." }); // Use 403 for forbidden access due to invalid token
    }
};


const apiKeyAuth = (req, res, next) => {
    // Your existing apiKeyAuth logic...
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.API_KEY) { // Check if apiKey exists before comparing
        next();
    } else {
        logger.warn(`Invalid or missing API key attempt from IP: ${req.ip}`); // Log attempt
        res.status(401).json({ message: "Invalid or missing API key" });
    }
};

const verifyAdmin = (req, res, next) => {
    console.log("--------------------req.user.role", req.user)
    if (req.user && req.user.role === 'ADMIN') {
        // User has token AND is an Admin
        logger.info(`Admin access granted for user: ${req.user.email || req.user.id}`);
        next(); // Proceed to the admin-only route handler
    } else {
        logger.warn(`Forbidden access attempt: User ${req.user?.email || 'N/A'} is not an Admin. Path: ${req.originalUrl}`);
        res.status(403).json({ message: "Forbidden: Access restricted to administrators." });
    }
};
// --- END ADDED MIDDLEWARE ---


module.exports = { verifyToken, apiKeyAuth, verifyAdmin }; // Export the new middleware