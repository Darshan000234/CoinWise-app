const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    budget_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Budget",
        required: false,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
},{timestamps: true});

module.exports = mongoose.model("Notification", NotificationSchema);