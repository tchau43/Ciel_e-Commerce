const User = require('../models/user');

const uploadImageService = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.json({
        imageUrl: `http://localhost:8081/images/product/${req.file.filename}`
    });
}

const updateUserProfileService = async (userId, updateData) => {
    try {
        const sanitizedData = {};
        if (updateData.name !== undefined) {
            if (typeof updateData.name === 'string' && updateData.name.trim().length > 0) {
                sanitizedData.name = updateData.name.trim();
            } else {
                throw new Error("Invalid name provided.");
            }
        }

        if (updateData.phoneNumber !== undefined) {
            if (!isNaN(updateData.phoneNumber) && updateData.phoneNumber.toString().length >= 10) {
                sanitizedData.phoneNumber = updateData.phoneNumber;
            } else {
                throw new Error("Invalid phone number provided.");
            }
        }

        if (updateData.address !== undefined) {
            if (typeof updateData.address === 'object') {
                sanitizedData.address = updateData.address;
            } else if (typeof updateData.address === 'string' && updateData.address.trim().length > 0) {
                sanitizedData.address = { street: updateData.address.trim() };
            } else {
                throw new Error("Invalid address provided.");
            }
        }

        delete sanitizedData.password;
        delete sanitizedData.email;
        delete sanitizedData.role;
        delete sanitizedData._id;
        delete sanitizedData.status;

        if (Object.keys(sanitizedData).length === 0) {
            throw new Error("No valid fields provided for update.");
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: sanitizedData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            throw new Error("User not found.");
        }

        return updatedUser;
    } catch (error) {
        throw error;
    }
}

module.exports = { uploadImageService, updateUserProfileService }