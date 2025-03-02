const mongoose = require('mongoose');
const { Status } = require('../../utils/types');
const User = require('../../models/user');
require('dotenv').config();

// Connect to MongoDB (if not already connected)
mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

// Function to update a user
const updateUser = async (userId, newStatus, newImage) => {
    try {
        // Find and update the user with the specified ID
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                status: newStatus,
                image: newImage
            },
            { new: true }  // This option returns the updated document
        );

        if (!updatedUser) {
            console.log('User not found');
        } else {
            console.log('Updated User:', updatedUser);
        }
    } catch (err) {
        console.error('Error updating user:', err);
    }
};

// Example: Update a user with a specific ID
// updateUser('60e72b7d9d1d7c1d4f1e3c5b', 1, 'path_to_image.jpg');  // Pass the user ID, new status, and new image

const updateAllUsers = async () => {
    try {
        const result = await User.updateMany(
            {},  // Empty filter to update all users
            {
                $set: {
                    status: true,  // Set status to ACTIVE (1)
                }
            }
        );

        console.log(`${result.nModified} users updated`);
    } catch (err) {
        console.error('Error updating users:', err);
    }
};

// Run the update function
updateAllUsers();
