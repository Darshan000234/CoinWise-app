const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Budget", BudgetSchema);