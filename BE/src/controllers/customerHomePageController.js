const {
  updateBannerService,
  updateVideoService,
  updateFeatureService,
  getHomePageService,
} = require("../services/customerHomePageService");

const getHomePage = async (req, res) => {
  try {
    const data = await getHomePageService();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBanner = async (req, res) => {
  const { _id, photo_url } = req.body;
  try {
    const data = await updateBannerService(_id, { photo_url });
    res.status(200).json({
      message: "Banner updated successfully",
      homepage: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVideo = async (req, res) => {
  const { _id, title, video_youtube, photo_thumb, photo_url } = req.body;
  try {
    const data = await updateVideoService(_id, {
      title,
      video_youtube,
      photo_thumb,
      photo_url,
    });
    res.status(200).json({
      message: "Video updated successfully",
      homepage: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeature = async (req, res) => {
  const { _id, title, description, image_url } = req.body;
  try {
    const data = await updateFeatureService(_id, {
      title,
      description,
      image_url,
    });
    res.status(200).json({
      message: "Feature updated successfully",
      homepage: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHomePage,
  updateBanner,
  updateVideo,
  updateFeature,
};
