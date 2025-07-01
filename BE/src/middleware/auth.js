require('dotenv').config();
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const verifyToken = (req, res, next) => {
    const publicPaths = ["/", '/register', "/login"];
    const requestPath = req.path.split('?')[0];

    if (publicPaths.includes(requestPath)) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
        req.user = decoded;
        logger.info(`Token verified for user: ${decoded.email || decoded.id}`);
        next();
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired." });
        }
        return res.status(403).json({ message: "Invalid token." });
    }
};

const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === process.env.API_KEY) {
        next();
    } else {
        logger.warn(`Invalid or missing API key attempt from IP: ${req.ip}`);
        res.status(401).json({ message: "Invalid or missing API key" });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        logger.info(`Admin access granted for user: ${req.user.email || req.user.id}`);
        next();
    } else {
        logger.warn(`Forbidden access attempt: User ${req.user?.email || 'N/A'} is not an Admin. Path: ${req.originalUrl}`);
        res.status(403).json({ message: "Forbidden: Access restricted to administrators." });
    }
};

module.exports = { verifyToken, apiKeyAuth, verifyAdmin };