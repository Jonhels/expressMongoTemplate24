const mongoose = require("mongoose");
const {isEmail} = require("validator");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your full name"],
        maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        lowercase: true,
        unique: true,
        validate: [isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Minimum password lenth is 6 characters"],
    },
    // Timestamp for user creation
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("USer", userSchema);
module.exports = User;