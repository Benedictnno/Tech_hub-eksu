import express from "express";
import User from "../models/User.js";
import { protect, admin } from "../middleware/auth.js";
import Session from "../models/sessionModel.js";

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
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
