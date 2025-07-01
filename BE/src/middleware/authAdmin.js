require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    const whiteList = ["/", '/register', "/login"];

    if (whiteList.includes(req.path)) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "You are not signed in." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token is missing." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(req.user);
        return next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(403).json({ message: "Invalid token." });
    }
}

module.exports = verifyAdmin;