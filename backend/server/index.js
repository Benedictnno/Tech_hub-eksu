import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';

// Import models
import User from './models/User.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000/'], // or just: origin
  credentials: true, // if you need to allow cookies/headers
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Attendance System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      attendance: '/api/attendance',
      admin: '/api/admin'
    }
  });
});

// Schedule automatic checkout at 6 PM every day
cron.schedule('0 18 * * *', async () => {
  try {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    
    // Find all users who checked in today but haven't checked out
    const result = await User.updateMany(
      { 
        'attendance.date': date,
        'attendance.checkIn': { $ne: null },
        'attendance.checkOut': null
      },
      { 
        $set: { 
          'attendance.$.checkOut': new Date(),
          'attendance.$.autoCheckout': true
        } 
      }
    );
    
    console.log(`Auto checkout completed: ${result.modifiedCount} users checked out`);
  } catch (error) {
    console.error('Auto checkout error:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});