import express from 'express';
import User from '../models/User.js';
import { protect, verifyEligibility } from '../middleware/auth.js';
import sessionModel from '../models/sessionModel.js';
import Joi from 'joi';
import validate from '../middleware/validate.js';

const router = express.Router();

// @route   POST /api/attendance/checkin
// @desc    User self check-in
// @access  Public (uses uniqueId)

const checkinSchema = Joi.object({
  uniqueId: Joi.string().required()
});

router.post('/checkin', validate(checkinSchema), async (req, res) => {
  try {
    const { uniqueId } = req.body;
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // 1. Get active session
    const activeSession = await sessionModel.findOne({ isActive: true });
    if (!activeSession) {
      return res.status(503).json({ message: 'No active academic session. Please contact admin.' });
    }

    // 2. Find user
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Handle Roll-over logic if session changed but user has paid semesters
    const currentSessionId = user.sessionId ? user.sessionId.toString() : null;
    const activeSessionId = activeSession._id.toString();

    if (currentSessionId !== activeSessionId) {
      if (user.semestersPaid > 0) {
        // Roll over to new session
        user.sessionId = activeSession._id;
        user.semestersPaid -= 1;
        user.subscription.startDate = activeSession.startDate;
        user.subscription.endDate = activeSession.endDate;
        user.subscription.active = true;
        await user.save();
      } else {
        // Checking if already expired or just not yet linked
        const isExpired = user.subscription && now > user.subscription.endDate;
        if (isExpired || currentSessionId !== null) {
          return res.status(403).json({ message: 'Subscription expired. Please pay for the new semester.' });
        }
      }
    }

    // 4. Standard Eligibility Checks
    if (!user.isRegistered || !user.hasPaid || !user.isOnboarded || !user.hasActiveSubscription()) {
      return res.status(403).json({ message: 'User not eligible for check-in. Check registration and payment status.' });
    }

    // 5. Check if already checked in
    const alreadyCheckedIn = user.attendance.some(a => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (alreadyCheckedIn) {
      return res.status(409).json({ message: 'Already checked in today' });
    }

    // 6. Record Check-in
    user.attendance.push({ date: today, checkIn: now, checkOut: null });
    await user.save();

    const record = user.attendance[user.attendance.length - 1];

    return res.status(200).json({
      message: 'Check-in successful',
      checkInTime: now,
      userId: user._id,
      attendance: record
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/total-checkedin', protect, async (req, res) => {
  try {
    const users = await User.find();

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter users who checked in today
    const checkedInToday = users.filter(user =>
      user.attendance?.some(record => {
        const attendanceDate = new Date(record.date);
        attendanceDate.setHours(0, 0, 0, 0);
        return attendanceDate.getTime() === today.getTime() && record.checkIn;
      })
    );

    res.json({
      total: checkedInToday.length,
      users: checkedInToday.map(u => ({
        name: u.name,
        email: u.email,
        uniqueId: u.uniqueId,
        phone: u.phone,
        checkInTime: u.attendance.find(a => {
          const d = new Date(a.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime() && a.checkIn;
        })?.checkIn
      }))
    });
  } catch (error) {
    console.error('Fetch total checked-in failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   POST /api/attendance/checkout
// @desc    User self check-out
// @access  Private
router.post('/checkout', protect, verifyEligibility, async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        attendance: { $elemMatch: { date: today, checkIn: { $ne: null }, checkOut: null } }
      },
      {
        $set: { 'attendance.$[elem].checkOut': now }
      },
      {
        new: true,
        arrayFilters: [{ 'elem.date': today, 'elem.checkIn': { $ne: null }, 'elem.checkOut': null }]
      }
    );

    if (!user) {
      return res.status(400).json({ message: 'No active check-in found for today' });
    }

    res.json({
      message: 'Check-out successful',
      checkOutTime: now
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/history
// @desc    Get user attendance history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort attendance by date (newest first)
    const sortedAttendance = [...user.attendance].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    res.json(sortedAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
