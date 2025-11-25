import express from 'express';
import User from '../models/User.js';
import { protect, verifyEligibility } from '../middleware/auth.js';
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

    const user = await User.findOneAndUpdate(
      {
        uniqueId,
        isRegistered: true,
        hasPaid: true,
        isOnboarded: true,
        'subscription.active': true,
        'subscription.endDate': { $gte: now },
        attendance: { $not: { $elemMatch: { date: today } } }
      },
      {
        $push: { attendance: { date: today, checkIn: now, checkOut: null } }
      },
      { new: true }
    );

    if (!user) {
      const exists = await User.findOne({ uniqueId });
      if (!exists) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(409).json({ message: 'Already checked in today' });
    }

    const record = user.attendance.find(a => {
      const d = new Date(a.date);
      d.setHours(0,0,0,0);
      return d.getTime() === today.getTime();
    });

    return res.status(200).json({
      message: 'Check-in successful',
      checkInTime: now,
      userId: user._id,
      attendance: record
    });
  } catch (error) {
    console.error(error);
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
        phone:u.phone,
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
        arrayFilters: [ { 'elem.date': today, 'elem.checkIn': { $ne: null }, 'elem.checkOut': null } ]
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
