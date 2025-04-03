const CustomerHomePage = require("../models/customerHomePage");

// Get the current homepage configuration
const getHomePageService = async () => {
    try {
        // Try to find the homepage configuration
        let customerHomePage = await CustomerHomePage.findOne();

        // If no homepage configuration exists, create a new one with default values
        if (!customerHomePage) {
            // Create a new empty homepage configuration with all required fields
            customerHomePage = new CustomerHomePage({
                banner1_home: {
                    photo_url: "https://placehold.co/600x400/EEE/31343C",
                },
                banner2_home: {
                    photo_url: "https://placehold.co/600x400/EEE/31343C"
                },
                banner3_home: {
                    photo_url: "https://placehold.co/600x400/EEE/31343C"
                },
                video1_home: {
                    title: "video1_home",
                    video_youtube: "https://placehold.co/600x400/EEE/31343C",
                    photo_thumb: "video1_home"
                },
                video2_home: {
                    title: "video2_home",
                    video_youtube: "https://placehold.co/600x400/EEE/31343C",
                    photo_thumb: "video2_home"
                },
                video3_home: {
                    title: "video3_home",
                    video_youtube: "https://placehold.co/600x400/EEE/31343C",
                    photo_thumb: "video3_home"
                },
                features: []  // Empty array for features
            });

            // Save the new empty homepage configuration to the database
            await customerHomePage.save();
        }

        // Return the homepage configuration (either found or newly created)
        return customerHomePage;
    } catch (error) {
        throw new Error("Error fetching homepage: " + error.message);
    }
};


// Update Banner
const updateBannerService = async (bannerId, data) => {
    try {
        const update = {};
        if (bannerId === 1) {
            update.banner1_home = data;
        } else if (bannerId === 2) {
            update.banner2_home = data;
        } else if (bannerId === 3) {
            update.banner3_home = data;
        }
        const customerHomePage = await CustomerHomePage.findOneAndUpdate({}, update, { new: true });
        if (!customerHomePage) {
            throw new Error("Homepage configuration not found");
        }
        return customerHomePage;
    } catch (error) {
        throw new Error("Error updating banner: " + error.message);
    }
};

// Update Video
const updateVideoService = async (videoId, data) => {
    try {
        const update = {};
        if (videoId === 1) {
            update.video1_home = data;
        } else if (videoId === 2) {
            update.video2_home = data;
        } else if (videoId === 3) {
            update.video3_home = data;
        }
        const customerHomePage = await CustomerHomePage.findOneAndUpdate({}, update, { new: true });
        if (!customerHomePage) {
            throw new Error("Homepage configuration not found");
        }
        return customerHomePage;
    } catch (error) {
        throw new Error("Error updating video: " + error.message);
    }
};

// Update Feature
const updateFeatureService = async (featureId, data) => {
    try {
        const customerHomePage = await CustomerHomePage.findOne();
        if (!customerHomePage) {
            throw new Error("Homepage configuration not found");
        }
        // Update or add the feature
        if (featureId) {
            customerHomePage.features[featureId] = data;  // Update feature by its index
        } else {
            customerHomePage.features.push(data);  // Add new feature
        }
        await customerHomePage.save();
        return customerHomePage;
    } catch (error) {
        throw new Error("Error updating feature: " + error.message);
    }
};

module.exports = {
    getHomePageService,
    updateBannerService,
    updateVideoService,
    updateFeatureService
};
