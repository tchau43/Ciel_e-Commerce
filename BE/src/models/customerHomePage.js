const mongoose = require('mongoose');

// Define schema for the homepage configuration
const customerHomePage = new mongoose.Schema({
    banners: {
        type: [
            {
                photo_url: { type: String, required: true },
            },
        ],
        validate: [arrayLimit, '{PATH} must have at least one element'],  // Validation to ensure at least one banner
    },
    videos: {
        type: [
            {
                title: { type: String, required: true },
                video_youtube: { type: String, required: true },
                photo_url: { type: String, required: true },
                photo_thumb: { type: String, required: true },
            },
        ],
        validate: [arrayLimit, '{PATH} must have at least one video'],  // Validation to ensure at least one video
    },
    features: {
        type: [
            {
                title: { type: String, required: true },
                description: { type: String, required: true },
            },
        ],
        validate: [arrayLimit, '{PATH} must have at least one feature'],  // Validation to ensure at least one feature
    },
});

// Custom validator to ensure arrays have at least one element
function arrayLimit(val) {
    return val.length > 0;
}

const CustomerHomePage = mongoose.model('CustomerHomePage', customerHomePage);

module.exports = CustomerHomePage;
