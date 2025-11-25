import express from "express";
import User from "../models/User.js";
import { protect, admin } from "../middleware/auth.js";
import Session from "../models/sessionModel.js";
import Joi from "joi";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

const REG_FEE_NAIRA = parseInt(process.env.REGISTRATION_FEE_NAIRA || '1500', 10);
const REG_TOKEN_DAYS = parseInt(process.env.REGISTRATION_TOKEN_DAYS || '7', 10);
const APP_PUBLIC_URL = process.env.APP_PUBLIC_URL || '';

const manualCreateSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(3).required(),
  profession: Joi.string().allow("", null),
  programType: Joi.string().valid("Fellowship", "Pre-Fellowship").required(),
});

router.post("/users/manual-create", protect, admin, async (req, res) => {
  try {
    const { error, value } = manualCreateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    const { name, email, phone, profession, programType } = value;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const token = (await import("node:crypto")).randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REG_TOKEN_DAYS);

    const user = await User.create({
      name,
      email,
      phone,
      profession,
      programType,
      password: "Techhubpassword1",
      accountStatus: "Pending Payment",
      paymentStatus: "Pending",
      tokenUsed: false,
      registrationToken: token,
      tokenExpiresAt: expiresAt,
      firstLogin: true,
      onboardingCompleted: false,
      createdByAdmin: req.user._id,
    });

    const baseUrl = APP_PUBLIC_URL.replace(/\/$/, "");
    const registrationLink = `${baseUrl}/register/${token}`;

    const subject = "Welcome to TechHub Fellowship Program!";
    const html = `
      <p>Dear ${name},</p>
      <p>Congratulations! You have been selected for the ${programType} program.</p>
      <p>To complete your registration, please:</p>
      <ol>
        <li>Click the link below</li>
        <li>Pay the registration fee of ₦${REG_FEE_NAIRA}</li>
        <li>Complete your profile setup</li>
      </ol>
      <p><strong>Registration Link:</strong> <a href="${registrationLink}">${registrationLink}</a></p>
      <p>This link expires in ${REG_TOKEN_DAYS} days.</p>
      <p>Best regards,<br/>TechHub Team</p>
    `;

    try {
      await sendEmail({ to: email, subject, html });
    } catch (e) {
      console.error("Failed to send registration email", e);
    }

    res.status(201).json({
      message: "User created and registration email sent",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profession: user.profession,
        programType: user.programType,
        accountStatus: user.accountStatus,
        paymentStatus: user.paymentStatus,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/admin/users
// @desc    Get users with filters and search
// @access  Private/Admin
router.get("/users", protect, admin, async (req, res) => {
  try {
    const { accountStatus, programType, paymentStatus, search } = req.query;

    const query = {};
    if (accountStatus) query.accountStatus = accountStatus;
    if (programType) query.programType = programType;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      const s = String(search);
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

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

// @route   POST /api/admin/users/:id/resend-link
// @desc    Regenerate or resend registration link
// @access  Private/Admin
router.post("/users/:id/resend-link", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const crypto = await import("node:crypto");
    let token = user.registrationToken;

    // Regenerate if expired or missing
    const now = new Date();
    if (!token || (user.tokenExpiresAt && user.tokenExpiresAt < now) || user.tokenUsed) {
      token = crypto.randomUUID();
      user.registrationToken = token;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REG_TOKEN_DAYS);
      user.tokenExpiresAt = expiresAt;
      user.tokenUsed = false;
      await user.save();
    }

    const baseUrl = APP_PUBLIC_URL.replace(/\/$/, "");
    const registrationLink = `${baseUrl}/register/${token}`;

    const subject = "Welcome to TechHub Fellowship Program!";
    const html = `
      <p>Dear ${user.name},</p>
      <p>Here is your registration link for the ${user.programType || "TechHub"} program.</p>
      <p>To complete your registration, please:</p>
      <ol>
        <li>Click the link below</li>
        <li>Pay the registration fee of ₦${REG_FEE_NAIRA}</li>
        <li>Complete your profile setup</li>
      </ol>
      <p><strong>Registration Link:</strong> <a href="${registrationLink}">${registrationLink}</a></p>
      <p>This link expires in ${REG_TOKEN_DAYS} days.</p>
      <p>Best regards,<br/>TechHub Team</p>
    `;

    try {
      await sendEmail({ to: user.email, subject, html });
    } catch (e) {
      console.error("Failed to send registration email", e);
    }

    res.json({ message: "Registration link sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/admin/users/:id/confirm-payment
// @desc    Manually confirm payment and activate account
// @access  Private/Admin
router.post("/users/:id/confirm-payment", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.accountStatus = "Active";
    user.paymentStatus = "Paid";
    if (!user.paymentReference && req.body?.paymentReference) {
      user.paymentReference = req.body.paymentReference;
    }
    await user.save();

    res.json({ message: "Payment confirmed and account activated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/admin/users/:id/suspend
// @desc    Suspend a user account
// @access  Private/Admin
router.post("/users/:id/suspend", protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus: "Suspended" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User suspended", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/admin/users/:id/reactivate
// @desc    Reactivate a user account
// @access  Private/Admin
router.post("/users/:id/reactivate", protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus: "Active" },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User reactivated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account
// @access  Private/Admin
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.isRegistered =
        req.body.isRegistered !== undefined
          ? req.body.isRegistered
          : user.isRegistered;
      user.hasPaid =
        req.body.hasPaid !== undefined ? req.body.hasPaid : user.hasPaid;
      user.isOnboarded =
        req.body.isOnboarded !== undefined
          ? req.body.isOnboarded
          : user.isOnboarded;

      // Update subscription if provided
      if (req.body.subscription) {
        user.subscription = {
          ...user.subscription,
          ...req.body.subscription,
        };
      }

      const updatedUser = await user.save();

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/admin/checkin/:id
// @desc    Admin check-in user
// @access  Private/Admin
router.post("/checkin/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify user eligibility
    if (!user.isRegistered || !user.hasPaid || !user.isOnboarded) {
      return res.status(403).json({
        message: "User is not eligible for check-in",
        isRegistered: user.isRegistered,
        hasPaid: user.hasPaid,
        isOnboarded: user.isOnboarded,
      });
    }

    // Check if user has active subscription
    if (!user.hasActiveSubscription()) {
      return res.status(403).json({
        message: "User subscription has expired",
        subscription: user.subscription,
      });
    }

    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = user.attendance.find((a) => {
      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === today.getTime() && a.checkIn;
    });

    if (todayAttendance) {
      return res.status(400).json({ message: "User already checked in today" });
    }

    // Add new attendance record
    user.attendance.push({
      date: today,
      checkIn: new Date(),
      checkOut: null,
    });

    await user.save();

    res.json({
      message: "User check-in successful",
      userId: user._id,
      userName: user.name,
      checkInTime: new Date(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/admin/attendance
// @desc    Get attendance report
// @access  Private/Admin
router.get("/attendance", protect, admin, async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    let query = {};

    if (date) {
      // Get attendance for specific date
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query = {
        "attendance.date": {
          $gte: targetDate,
          $lt: nextDay,
        },
      };
    } else if (startDate && endDate) {
      // Get attendance for date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query = {
        "attendance.date": {
          $gte: start,
          $lte: end,
        },
      };
    }

    const users = await User.find(query).select("name email attendance");

    // Format attendance data
    const attendanceData = users.map((user) => {
      const filteredAttendance = user.attendance.filter((a) => {
        if (date) {
          const targetDate = new Date(date);
          targetDate.setHours(0, 0, 0, 0);
          const attendanceDate = new Date(a.date);
          attendanceDate.setHours(0, 0, 0, 0);
          return attendanceDate.getTime() === targetDate.getTime();
        } else if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          const attendanceDate = new Date(a.date);
          return attendanceDate >= start && attendanceDate <= end;
        }
        return true;
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        attendance: filteredAttendance,
      };
    });

    res.json(attendanceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE Session
router.post("/set-session", protect, admin, async (req, res) => {
  const { startDate, endDate, isActive } = req.body;

  if (!startDate || !endDate)
    return res.status(400).json({ message: "Dates required" });

  if (isActive) {
    await Session.updateMany({}, { isActive: false });
  }

  try {
    const session = await Session.create({ startDate, endDate, isActive });
    res.json({ message: "Session created", session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET All Sessions
router.get("/sessions", protect, admin, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get sessions" });
  }
});

// UPDATE a Session
router.put("/update-session/:id", protect, admin, async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, isActive } = req.body;

  if (isActive) {
    await Session.updateMany({}, { isActive: false });
  }

  try {
    const session = await Session.findByIdAndUpdate(
      id,
      { startDate, endDate, isActive },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session updated", session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a Session
router.delete("/delete-session/:id", protect, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findByIdAndDelete(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ message: "Session deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
