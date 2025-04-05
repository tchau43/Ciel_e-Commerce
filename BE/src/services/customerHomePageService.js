const CustomerHomePage = require("../models/customerHomePage");

// Get the current homepage configuration
const getHomePageService = async () => {
    try {
        let homepage = await CustomerHomePage.findOne();
        if (!homepage) {
            // Create a new homepage with one default element in each array
            homepage = new CustomerHomePage({
                banners: [
                    { photo_url: "https://placehold.co/600x400/EEE/31343C" }
                ],
                videos: [
                    {
                        title: "Default Video",
                        video_youtube: "https://placehold.co/600x400/EEE/31343C",
                        photo_url: "https://placehold.co/700x500/EEE/31343C",
                        photo_thumb: "photo_thumb"
                    }
                ],
                features: [
                    {
                        title: "Default Feature",
                        description: "Default description"
                    }
                ]
            });
            await homepage.save();
        }
        return homepage;
    } catch (error) {
        throw new Error("Error fetching homepage: " + error.message);
    }
};

// Update Banner: if banner with given ID is not found, add a new banner
const updateBannerService = async (bannerId, data) => {
    try {
        const homepage = await CustomerHomePage.findOne();
        if (!homepage) {
            throw new Error("Homepage configuration not found");
        }
        if (bannerId) {
            // Try to find the banner subdocument by its _id
            let banner = homepage.banners.id(bannerId);
            if (banner) {
                // Update existing banner with the data object (e.g., { photo_url, text })
                banner.set(data);
            } else {
                // If banner with provided id is not found, add new banner
                homepage.banners.push(data);
            }
        } else {
            // No bannerId provided; add a new banner
            homepage.banners.push(data);
        }
        await homepage.save();
        return homepage;
    } catch (error) {
        throw new Error("Error updating banner: " + error.message);
    }
};

// Update Video: if a videoId is provided, update that video; otherwise, add a new video.
const updateVideoService = async (videoId, data) => {
    try {
        const homepage = await CustomerHomePage.findOne();
        if (!homepage) {
            throw new Error("Homepage configuration not found");
        }
        if (videoId) {
            let video = homepage.videos.id(videoId);
            if (video) {
                video.set(data);
            } else {
                homepage.videos.push(data);
            }
        } else {
            homepage.videos.push(data);
        }
        await homepage.save();
        return homepage;
    } catch (error) {
        throw new Error("Error updating video: " + error.message);
    }
};

// Update Feature: if a featureId is provided, update that feature; if not, add a new feature.
const updateFeatureService = async (featureId, data) => {
    try {
        const homepage = await CustomerHomePage.findOne();
        if (!homepage) {
            throw new Error("Homepage configuration not found");
        }
        if (featureId) {
            let feature = homepage.features.id(featureId);
            if (feature) {
                feature.set(data);
            } else {
                homepage.features.push(data);
            }
        } else {
            homepage.features.push(data);
        }
        await homepage.save();
        return homepage;
    } catch (error) {
        throw new Error("Error updating feature: " + error.message);
    }
};


module.exports = {
    getHomePageService,
    updateBannerService,
    updateVideoService,
    updateFeatureService,
};
