const reviewService = require('../services/reviewService');

const createReview = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Authentication required." });
        }
        const userId = req.user._id;

        const reviewData = req.body;

        if (!reviewData.productId || !reviewData.rating) {
            return res.status(400).json({ message: "productId and rating are required in the request body." });
        }

        const newReview = await reviewService.createReviewService(userId, reviewData);

        res.status(201).json({
            message: "Review submitted successfully!",
            review: newReview
        });

    } catch (error) {
        console.error("Error in createReview controller:", error);
        if (error.message.includes("eligible") || error.message.includes("already submitted")) {
            res.status(403).json({ message: error.message });
        } else if (error.message.includes("Invalid") || error.message.includes("required")) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: error.message || "Failed to submit review." });
        }
    }
};

const getReviewsForProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page, limit, sort } = req.query;

        const options = {
            page: page,
            limit: limit,
            sort: sort
        };

        const reviews = await reviewService.getReviewsByProductService(productId, options);

        res.status(200).json(reviews);

    } catch (error) {
        console.error(`Error in getReviewsForProduct controller for Product ${req.params.productId}:`, error);
        if (error.message.includes("Invalid Product ID format")) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || "Failed to retrieve reviews." });
        }
    }
};

module.exports = {
    createReview,
    getReviewsForProduct
};