const mongoose = require('mongoose');

const userTable = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
});

const User = mongoose.model('user', userTable);

module.exports = User