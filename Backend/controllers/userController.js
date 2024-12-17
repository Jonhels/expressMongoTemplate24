const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const createError = require("../utils/createError");
const {hashPassword, comparePassword} = require("../utils/hashPassword");
const validator = require("validator");

const validateStrongPassword = (password) => {
    return validator.isStrongPassword(password, {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    });
};

const registerUser = async(req, res, next) => {
    try{
        const {name, email, password} = req.body;

        if(!name) {
            return res.status(400).json({error: "Name is required"});
        }

        if (name.length > 50) {
            return res.status(400).json({error: "Name cannot exceed 50 characters"});
        }

        if (!validateStrongPassword(password)) {
            return res.status(400).json({
                error: "Password must be stronger. At least 6 characters, including a number, a symbol, and mixed case letters",
            });
        }        

        const exist = await User.findOne({email});
        if(exist) {
            return next(new createError("Email already exists", 400));
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const userForResponse = {...newUser._doc};
        delete userForResponse.password;

        res.status(201).json({
            status: "success",
            messsage: "User registred successfully",
            user: userForResponse,
        })
    } catch(error) {
        next(error);
    }
}

const loginUser = async (req, res, next) => {

    // Add login rate limit

    try {
        const {email, password} = req.body;

        if (!email || !validator.isEmail(email) || !password) {
            return next(new createError("Invalid email or password", 400));
        }

        const user = await User.findOne({email}).select("+password");
        if (!user || !(await comparePassword(password, user.password))){
            return next(new createError("Invalid email or password", 401));
        }

        const token = jwt.sign(
            {id: user._id}, // Add role here later when implementing administrator access
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) * 24 * 60 * 1000),
        });

        const userForResponse = {...user.toObject()};
        delete userForResponse.password;

        res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            user: userForResponse,
        });
        }catch(error) {
            next(error);
        }
}

const logoutUser = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });
    res.status(200).json({message: "Logged out successfully"});
};

const updateUser = async (req, res, next) => {
    const userId = req.user._id;
    const {name, password} = req.body;

    const updateData = {}; 

    try {
        if (name && name.trim()) {
            if (name.length > 50) {
                return res.status(400).json({error: "Name cannot exceed 50 characters"});
            }
            updateData.name = name.trim();
        }

        if (password && password.trim()) {
            if (!validateStrongPassword(password)) {
                return res.status(400).json({
                    error: "Password must be stronger. At least 6 characters, including a number, a symbol, and mixed case letters",
                });
            }
            const hashedPassword = await hashPassword(password);
            updateData.password = hashedPassword;
        }        

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({error: "No fields to update"});
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            select: "-password",
        });

        res.status(200).json({
            status: "success",
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        next(error);
    }
}

const deleteUser = async (req, res, next) => {
    const userId = req.user._id;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({error: "User not found"});
        }

        res.cookie("token", "", {
            httpOnly: true, 
            expires: new Date(0),
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        res.status(200).json({
            status: "success",
            message: "User account and data deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        next(error);
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    deleteUser
};