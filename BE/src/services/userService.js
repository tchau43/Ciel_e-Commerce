const User = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Invoice = require("../models/invoice");
const { isValidVNPhone } = require('@vn-utils/phone-validate'); // Import the validator


const createUserService = async (userData) => {
  // Destructure fields from userData
  // Assuming phoneNumber arrives as a string from the request body
  const { name, email, password, address, phoneNumber } = userData;

  try {
    // Check email exist
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      console.log("Email already exists:", email);
      // Throw specific error for controller to handle
      throw new Error("Email này đã tồn tại.");
    }

    // --- Password validation ---
    if (!password || typeof password !== 'string') {
      console.error("Password is required and must be a string.");
      throw new Error("Mật khẩu không hợp lệ.");
    }

    // --- Vietnamese Phone Number Validation ---
    // Check only if phoneNumber is provided and is not an empty string
    if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.trim() !== '') {
      if (!isValidVNPhone(phoneNumber)) {
        console.log("Invalid Vietnamese phone number format:", phoneNumber);
        throw new Error("Số điện thoại không hợp lệ.");
      }
      // If validation passes, phoneNumber is a valid VN phone string
    } else if (phoneNumber && typeof phoneNumber !== 'string') {
      // Handle case where input is not a string unexpectedly
      console.log("Phone number received is not a string:", phoneNumber);
      throw new Error("Số điện thoại không hợp lệ.");
    }
    // --- End Phone Number Validation ---


    // Hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // --- Prepare data for saving ---
    const userDataToSave = {
      name: name,
      email: email,
      password: hashPassword,
      role: "CUSTOMER", // Default role
      address: address, // Save address if provided
      // **RECOMMENDATION:** Store phoneNumber as STRING in DB
      phoneNumber: (phoneNumber && phoneNumber.trim() !== '') ? phoneNumber.trim() : undefined,
      // **IF YOU MUST use Number in DB (Not Recommended - loses leading zeros):**
      // phoneNumber: (phoneNumber && phoneNumber.trim() !== '') ? Number(phoneNumber.trim()) : undefined, 
      // (You would also need to handle potential NaN if conversion fails)
    };

    // Save user
    let result = await User.create(userDataToSave);

    // Exclude password from the returned result for safety
    if (result) {
      result = result.toObject ? result.toObject() : result; // Ensure plain object if using Mongoose
      delete result.password;
    }

    return result;

  } catch (error) {
    console.error("Error in createUserService:", error.message);
    // Re-throw the specific error or a generic one for the controller
    // This allows the controller to set appropriate HTTP status codes
    throw error;
  }
};



const userLoginService = async (email, password) => {
  try {
    //fetch user email
    const user = await User.findOne({ email: email });
    if (user) {
      //check password
      const checkPassword = await bcrypt.compare(password, user.password);
      if (checkPassword) {
        const payload = {
          email: email,
          name: user.name,
          role: user.role,
          address: user.address,
          _id: user._id,
        };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });
        return {
          EC: 0,
          accessToken,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            address: user.address,
          },
        };
      } else {
        return {
          EC: 2,
          EM: "Email/Password wrong !!!",
        };
      }
    } else {
      return {
        EC: 1,
        EM: "Email/Password wrong !!!",
      };
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getAllUsersService = async () => {
  try {
    const users = await User.find({}).select("-password");
    return users;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUserByIdService = async (id) => {
  try {
    const users = await User.findById(id);
    return users;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const updateUserbyIdService = async (id, updateData) => {
  try {
    // --- Add { new: true } here ---
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password

    // Check if a user was found and updated
    if (!user) {
      console.log(`User not found for update with ID: ${id}`);
      return null; // Explicitly return null if not found
    }
    return user; // Return the UPDATED user object (without password)
  } catch (error) {
    console.log(`Error updating user ${id}:`, error);
    // Re-throw specific types of errors if needed, otherwise return null
    if (error.name === 'ValidationError') {
      throw new Error(`Validation failed: ${error.message}`); // Let controller handle validation errors
    }
    throw error; // Re-throw other errors
  }
};

const getUsersPurchasedDetailService = async () => {
  const users = await User.find().lean();
  const purchases = {};

  for (const user of users) {
    const invoices = await Invoice.find({ user: user._id }).populate(
      "items.product"
    );
    purchases[user._id] = {};
    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const productId = item.product._id.toString();
        purchases[user._id][productId] = purchases[user._id][productId]
          ? purchases[user._id][productId] + 1
          : 1;
      });
    });
  }
  return purchases;
}

const changePasswordService = async (userId, oldPassword, newPassword) => {
  try {
    // Validate input
    if (!oldPassword || !newPassword) {
      throw new Error("Vui lòng cung cấp mật khẩu cũ và mới.");
    }

    if (newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Mật khẩu cũ không chính xác.");
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashPassword });

    return true;
  } catch (error) {
    console.error("Error in changePasswordService:", error);
    throw error;
  }
};

module.exports = {
  createUserService,
  userLoginService,
  getAllUsersService,
  updateUserbyIdService,
  getUserByIdService,
  getUsersPurchasedDetailService,
  changePasswordService,
};
