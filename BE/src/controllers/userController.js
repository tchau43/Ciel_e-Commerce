const {
  createUserService,
  userLoginService,
  getAllUsersService,
  updateUserbyIdService,
  getUserByIdService,
  getUsersPurchasedDetailService,
  changePasswordService,
} = require("../services/userService");
const { getInvoiceService } = require("../services/invoiceService");
const mongoose = require('mongoose');
const User = require('../models/user');
const { updateUserProfileService } = require('../services/utilsService');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const createUser = async (req, res) => {
  const { name, email, password, address, phoneNumber } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tên, email và mật khẩu là bắt buộc." });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: "Không đúng định dạng tên." });
    }
    if (typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Không đúng định dạng emailemail." });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải dài trên 6 ký tựtự." });
    }
    const userData = { name: name.trim(), email, password, address, phoneNumber };

    const data = await createUserService(userData);

    if (data === null) {
    
      return res.status(400).json({ message: "Email already exists." });
    }
    const { password: removedPassword, ...userResponse } = data.toObject ? data.toObject() : data;

    res.status(201).json({ message: "User created successfully", user: userResponse });

  } catch (error) {
    console.error("Error in createUser controller:", error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: `Registration failed: ${error.message}` });
    } else {
      res.status(500).json({ message: error.message || "Failed to register user." });
    }
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const data = await userLoginService(email, password);

    if (data && data.EC === 0) {
      res.status(200).json({ message: "Login successful", ...data });
    } else {
    
      res.status(401).json({ message: data.EM || "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error in userLogin controller:", error);
    res.status(500).json({ message: "Login failed due to a server error." });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const data = await getAllUsersService();
    if (data === null) {
    
      throw new Error("Service failed to retrieve users.");
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve users." });
  }
};

const getUserById = async (req, res) => {
  try {
    const requestedUserId = req.params.id;
    const authenticatedUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    if (!authenticatedUser?._id) {
      return res.status(401).json({ message: "Authentication error." });
    }
    if (authenticatedUser._id.toString() !== requestedUserId && authenticatedUser.role !== 'ADMIN') {
      return res.status(403).json({ message: "Forbidden: Cannot access this user's profile." });
    }
  
    const data = await getUserByIdService(requestedUserId);

    if (data === null) {
      return res.status(404).json({ message: "User not found." });
    }

    const { password, ...userResponse } = data.toObject ? data.toObject() : data;
    res.status(200).json(userResponse);

  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to retrieve user profile." });
  }
};

const updateUserbyId = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    const sanitizedData = {};
  
    if (updateData.name !== undefined) {
      if (typeof updateData.name === 'string' && updateData.name.trim().length > 0) {
        sanitizedData.name = updateData.name.trim();
      } else {
        return res.status(400).json({ message: "Invalid name provided." });
      }
    }

    if (updateData.status !== undefined) {
      if (typeof updateData.status === 'boolean') {
        sanitizedData.status = updateData.status;
      } else {
        return res.status(400).json({ message: "Status must be true or false." });
      }
    }

    if (updateData.role !== undefined) {
      const allowedRoles = ['CUSTOMER', 'ADMIN'];
      if (allowedRoles.includes(updateData.role)) {
        sanitizedData.role = updateData.role;
      } else {
        return res.status(400).json({ message: `Invalid role. Allowed: ${allowedRoles.join(', ')}` });
      }
    }
    
    if (updateData.phoneNumber !== undefined) {
      if (typeof updateData.phoneNumber === 'string' && updateData.phoneNumber.trim().length > 0) {
        sanitizedData.phoneNumber = updateData.phoneNumber.trim();
      } else {
        return res.status(400).json({ message: "Invalid phone number format." });
      }
    }

    if (updateData.address !== undefined) {
      if (typeof updateData.address === 'object' && updateData.address !== null) {
        sanitizedData.address = {
          street: updateData.address.street || "",
          city: updateData.address.city || "",
          state: updateData.address.state || "",
          country: updateData.address.country || "",
          zipCode: updateData.address.zipCode || ""
        };
      } else {
        return res.status(400).json({ message: "Invalid address format." });
      }
    }

    if (updateData.oldPassword && updateData.newPassword) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const isValidPassword = await bcrypt.compare(updateData.oldPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Old password is incorrect." });
      }

      if (updateData.newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long." });
      }

      sanitizedData.password = await bcrypt.hash(updateData.newPassword, saltRounds);
    }

    delete sanitizedData.email;
    delete sanitizedData._id;

    if (Object.keys(sanitizedData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    const updatedUser = await updateUserbyIdService(id, sanitizedData);

    if (updatedUser === null) {
      return res.status(404).json({ message: "User not found or update failed." });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });

  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: `User update validation failed: ${error.message}` });
    } else {
      res.status(500).json({ message: error.message || "Failed to update user." });
    }
  }
};

const getUserPurchased = async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const authenticatedUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }
    if (!authenticatedUser?._id) {
      return res.status(401).json({ message: "Authentication error." });
    }
  
    if (authenticatedUser._id.toString() !== requestedUserId && authenticatedUser.role !== 'ADMIN') {
      return res.status(403).json({ message: "Forbidden: Cannot access another user's purchase history." });
    }

    const invoices = await getInvoiceService(requestedUserId);

    const purchasedProducts = [];
    invoices.forEach((invoice) => {
    
      invoice.items.forEach((item) => {
      
        if (item.product?._id && item.product?.category?._id) {
          purchasedProducts.push({
            productId: item.product._id,
            categoryId: item.product.category._id,
          });
        } else {
          console.warn(`Skipping item in invoice ${invoice._id} due to missing product/category data during populate.`);
        }
      });
    });
  
    res.status(200).json(purchasedProducts);

  } catch (error) {
    console.error(`Error fetching purchased products for user ${req.params.userId}:`, error);
    res.status(500).json({ message: error.message || "Failed to retrieve purchase history." });
  }
};

const getUsersPurchasedDetail = async (req, res) => {
  try {
    const purchases = await getUsersPurchasedDetailService();
    if (purchases === null) {
      throw new Error("Service failed to retrieve purchase details.");
    }
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error getting all user purchases detail:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve purchase details." });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const updatedUser = await updateUserProfileService(userId, updateData);

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: `Validation error: ${error.message}` });
    }
  
    if (error.message.includes("Invalid") || error.message.includes("No valid fields")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "User not found.") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update profile." });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng cung cấp mật khẩu cũ và mới."
      });
    }

    await changePasswordService(userId, oldPassword, newPassword);

    res.status(200).json({
      message: "Đổi mật khẩu thành công."
    });

  } catch (error) {
    console.error("Error in changePassword controller:", error);

    if (error.message.includes("không chính xác") ||
      error.message.includes("ít nhất 6 ký tự")) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message.includes("Không tìm thấy")) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({
      message: "Có lỗi xảy ra khi đổi mật khẩu."
    });
  }
};

module.exports = {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserbyId,
  getUserPurchased,
  getUsersPurchasedDetail,
  updateUserProfile,
  changePassword,
};