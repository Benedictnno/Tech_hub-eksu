import express from "express";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import Joi from "joi";
import { registerLimiter, loginLimiter } from "../middleware/rateLimit.js";
import validate from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { sendEmail } from "../utils/email.js";
import crypto from "node:crypto";

const router = express.Router();

// Legacy register schema (kept for potential internal use, but public self-registration is disabled)
const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// server/routes/auth.js
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public self-registration is disabled. This endpoint now always returns 403.
router.post("/register", registerLimiter, validate(registerSchema), async (_req, res) => {
  return res.status(403).json({ message: "Self-registration is disabled. Please contact an administrator." });
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

router.post("/login", loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Ensure account is active before allowing login
    if (user.accountStatus !== 'Active') {
      return res.status(403).json({
        message: 'Account is not active',
        accountStatus: user.accountStatus,
        paymentStatus: user.paymentStatus,
      });
    }

    const mustChangePassword = user.firstLogin === true;

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isRegistered: user.isRegistered,
      hasPaid: user.hasPaid,
      isOnboarded: user.isOnboarded,
      subscription: user.subscription,
      accountStatus: user.accountStatus,
      paymentStatus: user.paymentStatus,
      mustChangePassword,
      token: generateToken(res,user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/logout", (req, res) => {
   res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logout successful" });
});

// Forgot password
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

router.post("/forgot-password", validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Respond 200 even if user not found to avoid email enumeration
    if (!user) {
      return res.json({ message: "If an account with that email exists, a reset link has been sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const appUrl = process.env.APP_PUBLIC_URL || '';
    const baseUrl = appUrl.replace(/\/$/, "");
    const resetLink = `${baseUrl}/reset-password/${token}`;

    const subject = "Reset your TechHub password";
    const html = `
      <p>Dear ${user.name},</p>
      <p>We received a request to reset the password for your TechHub account.</p>
      <p>You can reset your password by clicking the link below:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
      <p>Best regards,<br/>TechHub Team</p>
    `;

    try {
      await sendEmail({ to: email, subject, html });
    } catch (e) {
      console.error("Failed to send reset password email", e);
    }

    res.json({ message: "If an account with that email exists, a reset link has been sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reset password
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).required(),
});

router.post("/reset-password/:token", validate(resetPasswordSchema), async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.firstLogin = false;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
