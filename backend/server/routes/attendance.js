import express from 'express';
import User from '../models/User.js';
import { protect, verifyEligibility } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/attendance/checkin
// @desc    User self check-in
// @access  Private
router.post('/checkin', protect, verifyEligibility, async (req, res) => {
  try {
    const user = await User.findOne({ uniqueId: req.user.uniqueId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = user.attendance.find(a => {
      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === today.getTime() && a.checkIn;
    });
    
    if (todayAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    
    // Add new attendance record
    user.attendance.push({
      date: today,
      checkIn: new Date(),
      checkOut: null
    });
    
    await user.save();
    
    res.json({ 
      message: 'Check-in successful',
      checkInTime: new Date()
    });
  } catch (error) {
    console.error(error);
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