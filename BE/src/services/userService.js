const User = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Invoice = require("../models/invoice");

const createUserService = async (name, email, password) => {
  try {
    //check email exist
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      console.log("using another email");
      return null;
    }
    //hash password
    const hashPassword = await bcrypt.hash(password, saltRounds);
    //save user
    let result = await User.create({
      name: name,
      email: email,
      password: hashPassword,
      role: "CUSTOMER",
    });
    return result;
  } catch (error) {
    console.log(error);
    return null;
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

const updateUserbyIdService = async (id, name, email, status, role) => {
  try {
    // --- Add { new: true } here ---
    const user = await User.findByIdAndUpdate(id, {
      name,
      // email, // Avoid updating email directly here - needs verification flow
      status,
      role,
    }, { new: true, runValidators: true }).select("-password"); // Exclude password
    // --- End Add { new: true } ---

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

module.exports = {
  createUserService,
  userLoginService,
  getAllUsersService,
  updateUserbyIdService,
  getUserByIdService,
  getUsersPurchasedDetailService,
};
