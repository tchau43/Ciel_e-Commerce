const {
    updateBannerService,
    updateVideoService,
    updateFeatureService,
    getHomePageService
} = require("../services/customerHomePageService");

// Get the current homepage configuration
const getHomePage = async (req, res) => {
    try {
        const data = await getHomePageService();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Banner
const updateBanner = async (req, res) => {
    const { bannerId, photo_url, text } = req.body;
    try {
        const data = await updateBannerService(bannerId, { photo_url, text });
        res.status(200).json({
            message: "Banner updated successfully",
            banner: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Video
const updateVideo = async (req, res) => {
    const { videoId, title, video_youtube, photo_thumb } = req.body;
    try {
        const data = await updateVideoService(videoId, { title, video_youtube, photo_thumb });
        res.status(200).json({
            message: "Video updated successfully",
            video: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Feature
const updateFeature = async (req, res) => {
    const { featureId, title, description } = req.body;
    try {
        const data = await updateFeatureService(featureId, { title, description });
        res.status(200).json({
            message: "Feature updated successfully",
            feature: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHomePage,
    updateBanner,
    updateVideo,
    updateFeature
};
