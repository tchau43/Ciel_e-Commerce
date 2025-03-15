require('dotenv').config();
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const verifyToken = (req, res, next) => {
    const whiteList = ["/", '/register', "/login"];

    if (whiteList.includes(req.path)) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        logger.error("No authorization header provided");
        return res.status(401).json({ message: "You are not signed in." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        logger.error("Token is missing in authorization header");
        return res.status(401).json({ message: "Token is missing." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        logger.info(`Token verified for user: ${decoded.email}`);
        next();
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};


const apiKeyAuth = (req, res, next) => {
    console.log("process.env.API_KEY", process.env.API_KEY)
    console.log("req.headers", req.headers)
    const apiKey = req.headers['x-api-key'];
    if (apiKey === process.env.API_KEY) {
        next();
    } else {
        res.status(401).json({ message: "Invalid API key" });
    }
};

const verifyAdmin = () => { }

module.exports = { verifyToken, apiKeyAuth };