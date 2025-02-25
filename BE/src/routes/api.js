const express = require('express');
const { createUser, userLogin, getAllUsers, getUser } = require('../controllers/userController');
const delay = require('../middleware/delay');
const jwt = require('../middleware/auth');

const routerAPI = express.Router();

routerAPI.all("*", jwt);

// routerAPI.get("/", (req, res) => {
//     return res.status(200).json("Hello API");
// })

//route for user
routerAPI.post("/register", createUser);
routerAPI.post("/login", userLogin);
routerAPI.get("/users", getAllUsers);
routerAPI.get("/user", delay, getUser);

module.exports = routerAPI