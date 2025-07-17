import express from 'express';
import User from '../models/User.js';
import { protect, verifyEligibility } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/attendance/checkin
// @desc    User self check-in
// @access  Private

router.post('/checkin', verifyEligibility, async (req, res) => {
  try {
    const { uniqueId } = req.body;

    if (!uniqueId) {
      return res.status(400).json({ message: 'Unique ID is required' });
    }

    const user = await User.findOne({ uniqueId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure attendance array exists
    if (!Array.isArray(user.attendance)) {
      user.attendance = [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyCheckedIn = user.attendance.some((a) => {
      if (!a.date || !a.checkIn) return false;
      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === today.getTime();
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const now = new Date();
    user.attendance.push({
      date: now,
      checkIn: now,
      checkOut: null
    });

    await user.save();

    res.json({
      message: 'Check-in successful',
      checkInTime: now
    });
  } catch (error) {
    console.error('Check-in failed:', error);
    res.status(500).json({ message: 'Server error' });
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