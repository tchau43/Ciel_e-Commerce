const mongoose = require("mongoose");
const User = require("../../models/user");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

const updateUser = async (userId, newStatus, newImage) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        status: newStatus,
        image: newImage,
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found");
    } else {
      console.log("Updated User:", updatedUser);
    }
  } catch (err) {
    console.error("Error updating user:", err);
  }
};

const updateAllUsers = async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      const newAddress = `${user.name} address`;

      await User.findByIdAndUpdate(user._id, {
        $set: {
          address: newAddress,
        },
      });

      console.log(`Updated address for user: ${user.name}`);
    }

    console.log("All users updated successfully.");
  } catch (err) {
    console.error("Error updating users:", err);
  }
};

updateAllUsers();
