const mongoose = require("mongoose");

const customerHomePage = new mongoose.Schema({
  banners: {
    type: [
      {
        photo_url: { type: String, required: true },
      },
    ],
    validate: [arrayLimit, "{PATH} must have at least one element"],
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
    validate: [arrayLimit, "{PATH} must have at least one video"],
  },
  features: {
    type: [
      {
        image_url: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    validate: [arrayLimit, "{PATH} must have at least one feature"],
  },
});

function arrayLimit(val) {
  return val.length > 0;
}

const CustomerHomePage = mongoose.model("CustomerHomePage", customerHomePage);

module.exports = CustomerHomePage;
