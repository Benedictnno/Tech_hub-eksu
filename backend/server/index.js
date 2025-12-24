import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import attendanceRoutes from './routes/attendance.js';
import adminRoutes from './routes/admin.js';
import reservationRoutes from './routes/reservations.js';
import blogRoutes from './routes/blog.js';
import galleryRoutes from './routes/gallery.js';
import registrationRoutes from './routes/registration.js';
import productRoutes from './routes/products.js';

// Import models
import User from './models/User.js';
import cookieParser from 'cookie-parser';

// Add this after express.json() middleware
// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

app.set('trust proxy', 1);

app.use(cookieParser());
app.use(express.json());
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,https://tech-hub-eksu.vercel.app,https://www.techhubeksu.com,https://techhubeksu.com")
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: function (origin, callback) {
    // During debugging, let's log everything
    console.log('CORS Request Origin:', origin);

    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(o => origin.toLowerCase() === o.toLowerCase());

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS BLOCKED:', origin);
      console.log('Valid Origins:', allowedOrigins);
      console.log('Full Request Headers:', req.headers); // This might need a custom middleware if cors() doesn't give req
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"]
}));

app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err instanceof SyntaxError)) {
    return res.status(400).json({ message: 'Invalid JSON payload', error: err.message });
  }
  return next(err);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/products', productRoutes);

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Schedule automatic checkout at 6 PM every day
cron.schedule('0 18 * * *', async () => {
  try {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find all users who checked in today but haven't checked out
    // Use date range to match attendance.date stored as midnight
    const result = await User.updateMany(
      {
        'attendance.date': { $gte: date, $lt: nextDay },
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

cron.schedule('0 * * * *', async () => {
  try {
    const Application = (await import('./models/Application.js')).default
    const now = new Date()
    const result = await Application.updateMany({ status: 'Approved - Awaiting Payment', paymentDeadline: { $lt: now } }, { $set: { status: 'Rejected' } })
    if (result.modifiedCount) {
      console.log(`Expired reservations rejected: ${result.modifiedCount}`)
    }
  } catch (e) {
    console.error(e)
  }
})

// Error handling middleware
app.use((err, req, res, _next) => {
  void _next;
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
