import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { generateQRCode } from "../utils/qrCodeGenerator.js";
import sessionModel from "../models/sessionModel.js";
import Joi from "joi";
import validate from "../middleware/validate.js";

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    if (users) {
      res.json({ users: users.length });
    } else {
      res.status(404).json({ message: "No users" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const updates = req.body;

      // Update only the fields that are provided in the request body
      Object.keys(updates).forEach((key) => {
        user[key] = updates[key];
      });

      // If password was provided, rely on User model pre('save') to hash it
      if (updates.password) {
        user.password = updates.password;
      }

      const updatedUser = await user.save();

      res.json({ data: updatedUser, message: "Profile updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/users/current
// @desc    Get current user
// @access  Private
router.get("/current-user", protect, async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users/qrcode
// @desc    Generate QR code for user
// @access  Private
// Helper function to generate QR code with a URL to the user profile
// Removed duplicate generateQRCode function

router.get("/qrcode", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a fresh QR code URL each time
    const qrCode = await generateQRCode(user._id.toString());

    res.json({
      qrCode: qrCode,
      userId: user._id,
      name: user.name,
      profileUrl: qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   POST /api/users/make-payment
// @desc    Process user payment and activate subscription
// @access  Private
const makePaymentSchema = Joi.object({
  subscriptionType: Joi.string().required()
});

router.post("/make-payment", protect, validate(makePaymentSchema), async (req, res) => {
  try {
    const { subscriptionType } = req.body;

    const user = await User.findById(req.user._id);


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Set subscription details

    // Get the only active academic session
    const session = await sessionModel.findOne({ isActive: true });

    if (!session) {
      return res.status(404).json({ message: "No active session found" });
    }

    const { startDate, endDate } = session;

    // Calculate session duration
    const start = new Date(startDate);
    const end = new Date(endDate);

    user.hasPaid = true;
    user.sessionId = session._id;
    user.membershipType = subscriptionType;

    // Set paid semesters balance
    // 1 for Semester, 2 for Session
    const totalSemesters = subscriptionType === "session" ? 2 : 1;

    // Consume one semester immediately for the current session
    user.semestersPaid = totalSemesters - 1;

    user.subscription = {
      type: subscriptionType,
      startDate: start,
      endDate: end,
      active: true,
    };

    await user.save();

    res.json({
      message: "Payment processed successfully",
      subscription: user.subscription,
      hasPaid: user.hasPaid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   POST /api/users/log-payment
// @desc    Log payment reference from Paystack
// @access  Private
const logPaymentSchema = Joi.object({
  reference: Joi.string().required()
});

router.post("/log-payment", protect, validate(logPaymentSchema), async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log payment reference
    user.paymentReference = reference;
    await user.save();

    res.json({ message: "Payment reference logged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/start-of-current-session', async (req, res) => {
  try {
    const session = await sessionModel.findOne({ isActive: true }).lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "No active session found"
      });
    }

    res.status(200).json({
      success: true,
      data: session,
      message: "Active session retrieved successfully"
    });


  } catch (err) {
    console.error('Error fetching active session:', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred'
    });
  }
});


// Get a single user by ID
router.get('/:id', async (req, res) => {

  try {
    const user = await User.findById(req.params.id).populate('sessionId').select("-password");

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

router.post("/change-password", protect, validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Update password
    user.password = newPassword;
    user.firstLogin = false; // If they change password, it's no longer their first login
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
