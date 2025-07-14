import express from "express";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      isRegistered: true,
      hasPaid: false,
      isOnboarded: false,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isRegistered: user.isRegistered,
        hasPaid: user.hasPaid,
        isOnboarded: user.isOnboarded,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);

    // Check for user email
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password matches
    // const isMatch = await user.comparePassword(password);

    // if (!isMatch) {
    //   return res.status(401).json({ message: 'Invalid email or password' });
    // }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isRegistered: user.isRegistered,
      hasPaid: user.hasPaid,
      isOnboarded: user.isOnboarded,
      subscription: user.subscription,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
