import express from 'express';
import User from '../models/User.js';
import { protect, verifyEligibility } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/attendance/checkin
// @desc    User self check-in
// @access  Public (uses uniqueId)

router.post('/checkin', async (req, res) => {
  try {
    const { uniqueId } = req.body;

    // Validate input
    if (!uniqueId || typeof uniqueId !== 'string') {
      return res.status(400).json({ message: 'Unique ID is required and must be a string' });
    }

    // Find user by unique ID
    const user = await User.findOne({ uniqueId });
    if (!user) {
      console.warn(`Check-in failed: No user found with uniqueId "${uniqueId}"`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify user eligibility inline (because this endpoint uses uniqueId rather than authenticated req.user)
    if (!user.isRegistered || !user.hasPaid || !user.isOnboarded) {
      return res.status(403).json({
        message: 'User is not eligible for check-in',
        isRegistered: user.isRegistered,
        hasPaid: user.hasPaid,
        isOnboarded: user.isOnboarded,
      });
    }

    if (!user.hasActiveSubscription()) {
      return res.status(403).json({
        message: 'User subscription has expired',
        subscription: user.subscription,
      });
    }

    // Ensure attendance array exists
    if (!Array.isArray(user.attendance)) {
      user.attendance = [];
    }

    // Normalize today's date (00:00:00) for the date field
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const alreadyCheckedIn = user.attendance.some((a) => {
      if (!a.date || !a.checkIn) return false;
      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === today.getTime();
    });

    if (alreadyCheckedIn) {
      return res.status(409).json({ message: 'Already checked in today' });
    }

    // Record check-in - store date as midnight (for queries) but keep exact checkIn timestamp
    const attendanceRecord = {
      date: today,
      checkIn: now,
      checkOut: null
    };

    user.attendance.push(attendanceRecord);
    await user.save();

    console.log(`✅ User ${user.name} (${uniqueId}) checked in at ${now.toISOString()}`);

    return res.status(200).json({
      message: 'Check-in successful',
      checkInTime: now,
      userId: user._id,
      attendance: attendanceRecord
    });

  } catch (error) {
    console.error('🚨 Server error during check-in:', error);
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
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendanceIndex = user.attendance.findIndex(a => {
      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === today.getTime() && a.checkIn && !a.checkOut;
    });
    
    if (todayAttendanceIndex === -1) {
      return res.status(400).json({ message: 'No active check-in found for today' });
    }
    
    // Update check-out time
    user.attendance[todayAttendanceIndex].checkOut = new Date();
    
    await user.save();
    
    res.json({ 
      message: 'Check-out successful',
      checkOutTime: new Date()
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
