import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { generateQRCode } from "../utils/qrCodeGenerator.js";
import generateToken from "../utils/generateToken.js";
import sessionModel from "../models/sessionModel.js";

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
      res.json({users:users.length});
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

      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(updates.password, salt);
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

    // Update the user's QR code in the database
    user.qrCode = qrCode;
    await user.save();

    // Return the QR code URL and basic user info
    res.json({
      qrCode: user.qrCode,
      userId: user._id,
      name: user.name,
      profileUrl: qrCode, // Include the URL directly in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   POST /api/users/payment
// @desc    Process user payment and activate subscription
// @access  Private
// router.post("/make-payment", protect, async (req, res) => {
//   try {
//     const { subscriptionType } = req.body;

//     if (
//       !subscriptionType ||
//       !["semester", "session"].includes(subscriptionType)
//     ) {
//       return res.status(400).json({ message: "Invalid subscription type" });
//     }

//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Set subscription details

//     // Get the only active academic session
//     const session = await sessionModel.findOne({ isActive: true });

//     if (!session) {
//       return res.status(404).json({ message: "No active session found" });
//     }

//     const { startDate, endDate } = session;

//     // When user registers and chooses semesters set end and expiring date

//     let semesterCount = subscriptionType === "semester" ? 1 : 2;

//     if (![1, 2].includes(semesterCount)) {
//       throw new Error("Invalid semester count — must be 1 or 2");
//     }

//     // Calculate session duration
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const totalDuration = end.getTime() - start.getTime();

//     const oneSemester = totalDuration / 2;

//     // Compute expiry date
//     const expiryDate = new Date(start.getTime() + oneSemester * semesterCount);

//     // Create the user
//     // await userModel.create({
//     //   ...userData,
//     //   semesterCount,
//     //   sessionId: session._id,
//     //   subscriptionExpiryDate: expiryDate,
//     // });

//     user.hasPaid = true;
//     (user.sessionId = session._id),
//       (user.semesterCount = semesterCount),
//       (user.membershipType = subscriptionType);
//     user.subscription = {
//       type: subscriptionType,
//       startDate,
//       endDate: expiryDate,
//       active: true,
//     };

//     await user.save();

//     res.json({
//       message: "Payment processed successfully",
//       subscription: user.subscription,
//       hasPaid: user.hasPaid,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


router.post("/make-payment", protect, async (req, res) => {
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
    (user.sessionId = session._id),

      (user.membershipType = subscriptionType);
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
router.post("/log-payment", protect, async (req, res) => {
  try {
    const { reference, email } = req.body;

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







export default router;
