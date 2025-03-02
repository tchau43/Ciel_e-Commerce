const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, trim: true, required: true, unique: true },
    password: { type: String, required: true },
    // 0: user, 1: admin, 2: super admin
    role: String,
    status: { type: Boolean, default: true },
    image: { type: String, trim: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
