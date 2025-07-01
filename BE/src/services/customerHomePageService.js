const CustomerHomePage = require("../models/customerHomePage");

const getHomePageService = async () => {
    try {
        let homepage = await CustomerHomePage.findOne();
        if (!homepage) {
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
                        image_url: "https://placehold.co/100x100/EEE/31343C",
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

const updateBannerService = async (bannerId, data) => {
    try {
        const homepage = await CustomerHomePage.findOne();
        if (!homepage) {
            throw new Error("Homepage configuration not found");
        }
        if (bannerId) {
            let banner = homepage.banners.id(bannerId);
            if (banner) {
                banner.set(data);
            } else {
                homepage.banners.push(data);
            }
        } else {
            homepage.banners.push(data);
        }
        await homepage.save();
        return homepage;
    } catch (error) {
        throw new Error("Error updating banner: " + error.message);
    }
};

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
