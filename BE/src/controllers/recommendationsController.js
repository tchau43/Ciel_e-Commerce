const axios = require('axios');
const logger = require('../config/logger');
// const logger = require('../config/logger');

const getUserRecommendations = async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        logger.error('Recommendations request missing userId');
        return res.status(400).json({ message: "userId is required" });
    }

    try {
        const response = await axios.get('http://localhost:5000/recommendations', {
            params: { userId },
            timeout: 10000
        });

        if (response.status !== 200) {
            logger.warn(`Recommendation service responded with ${response.status}`);
            return res.status(502).json({ message: "Recommendation service error" });
        }

        return res.status(200).json(response.data);
    } catch (error) {
        logger.error(`Recommendation failed: ${error.message}`);
        return res.status(500).json({
            message: error.response?.data?.error || "Recommendation service unavailable"
        });
    }
};

module.exports = { getUserRecommendations };