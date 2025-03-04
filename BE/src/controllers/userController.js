const {
  createUserService,
  userLoginService,
  getAllUsersService,
  updateUserbyIdService,
  getUserByIdService,
} = require("../services/userService");

const createUser = async (req, res) => {
  // console.log(">>>", req.body);
  const { name, email, password } = req.body;
  const data = await createUserService(name, email, password);
  res.status(200).json(data);
};

const userLogin = async (req, res) => {
  // console.log(">>>", req.body);
  const { email, password } = req.body;
  const data = await userLoginService(email, password);
  res.status(200).json(data);
};

const getAllUsers = async (req, res) => {
  // console.log(">>>", req.body);
  const data = await getAllUsersService();
  res.status(200).json(data);
};

const getUserById = async (req, res) => {
  // console.log(">>>", req.body);
  const { id } = req.params; // Extract id from URL
  const data = await getUserByIdService(id);
  res.status(200).json(data);
};

const updateUserbyId = async (req, res) => {
  const { id } = req.params; // Extract id from URL
  const { name, email, status, role } = req.body;
  const data = await updateUserbyIdService(id, name, email, status, role);
  res.status(200).json(data);
};

module.exports = {
  createUser,
  userLogin,
  getAllUsers,
  getUserById,
  updateUserbyId,
};
