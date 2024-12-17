const express = require("express");
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    updateUser, 
    deleteUser 
} = require("../controllers/userController");

const router = express.Router();

// User Registration
router.post("/register", registerUser);

// User Login
router.post("/login", loginUser);

// User Logout
router.post("/logout", logoutUser);

// Update User Information
router.put("/update", updateUser);

// Delete User Account
router.delete("/delete", deleteUser);

module.exports = router;
