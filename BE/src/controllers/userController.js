const { createUserService, userLoginService, getAllUsersService } = require("../services/userService");

const createUser = async (req, res) => {
    // console.log(">>>", req.body);
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    res.status(200).json(data);
}

const userLogin = async (req, res) => {
    // console.log(">>>", req.body);
    const { email, password } = req.body;
    const data = await userLoginService(email, password);
    res.status(200).json(data);
}

const getAllUsers = async (req, res) => {
    // console.log(">>>", req.body);
    const data = await getAllUsersService();
    res.status(200).json(data);
}

const getUser = async (req, res) => {
    // console.log(">>>", req.body);
    // const data = await getAllUsersService();
    res.status(200).json(req.user);
}

module.exports = {
    createUser,
    userLogin,
    getAllUsers,
    getUser
}