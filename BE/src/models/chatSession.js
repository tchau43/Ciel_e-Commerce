// src/models/chatSession.js
const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: false
    },
    threadId: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;