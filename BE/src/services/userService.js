const User = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Invoice = require("../models/invoice");
const { isValidVNPhone } = require('@vn-utils/phone-validate');

const createUserService = async (userData) => {
  const { name, email, password, address, phoneNumber } = userData;

  try {
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      console.log("Email already exists:", email);
      throw new Error("Email này đã tồn tại.");
    }

    if (!password || typeof password !== 'string') {
      console.error("Password is required and must be a string.");
      throw new Error("Mật khẩu không hợp lệ.");
    }

    if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.trim() !== '') {
      if (!isValidVNPhone(phoneNumber)) {
        console.log("Invalid Vietnamese phone number format:", phoneNumber);
        throw new Error("Số điện thoại không hợp lệ.");
      }
    } else if (phoneNumber && typeof phoneNumber !== 'string') {
      console.log("Phone number received is not a string:", phoneNumber);
      throw new Error("Số điện thoại không hợp lệ.");
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);

    const userDataToSave = {
      name: name,
      email: email,
      password: hashPassword,
      role: "CUSTOMER",
      address: address,
      phoneNumber: (phoneNumber && phoneNumber.trim() !== '') ? phoneNumber.trim() : undefined,
    };

    let result = await User.create(userDataToSave);

    if (result) {
      result = result.toObject ? result.toObject() : result;
      delete result.password;
    }

    return result;

  } catch (error) {
    console.error("Error in createUserService:", error.message);
    throw error;
  }
};

const userLoginService = async (email, password) => {
  try {
    const user = await User.findOne({ email: email });
    if (user) {
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
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      console.log(`User not found for update with ID: ${id}`);
      return null;
    }
    return user;
  } catch (error) {
    console.log(`Error updating user ${id}:`, error);
    if (error.name === 'ValidationError') {
      throw new Error(`Validation failed: ${error.message}`);
    }
    throw error;
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
    if (!oldPassword || !newPassword) {
      throw new Error("Vui lòng cung cấp mật khẩu cũ và mới.");
    }

    if (newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Mật khẩu cũ không chính xác.");
    }

    const hashPassword = await bcrypt.hash(newPassword, saltRounds);

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
