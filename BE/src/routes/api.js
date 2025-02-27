const express = require('express');
const { createUser, userLogin, getAllUsers, getUser } = require('../controllers/userController');
const delay = require('../middleware/delay');
const jwt = require('../middleware/auth');

const routerAPI = express.Router();

routerAPI.all("*", jwt);

// routerAPI.get("/", (req, res) => {
//     return res.status(200).json("Hello API");
// })

//route for register - login
routerAPI.post("/register", createUser);
routerAPI.post("/login", userLogin);

//route for admin
routerAPI.get("/admin/users", getAllUsers);

//route for user
routerAPI.get("/user/info", getUser);

module.exports = routerAPI