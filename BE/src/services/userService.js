const User = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;
const jwt = require("jsonwebtoken");

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
        };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });
        return {
          EC: 0,
          accessToken,
          user: {
            email: user.email,
            name: user.name,
            role: user.role,
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

module.exports = {
  createUserService,
  userLoginService,
  getAllUsersService,
};
