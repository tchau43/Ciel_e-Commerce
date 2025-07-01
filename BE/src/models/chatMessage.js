const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true,
        index: true
    },
    sender: {
        type: String,
        required: true,
        enum: ['user', 'bot'],
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    contextData: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    nluData: {
        intent: { type: String, trim: true },
        entities: { type: mongoose.Schema.Types.Mixed }
    },
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, trim: true }
    }
}, {
    timestamps: true
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;