
// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  let tokenSource = 'None';
  try {
    // 1. Check cookies
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
      tokenSource = 'Cookie';
    }
    // 2. Fallback to Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      tokenSource = 'Header';
    }

    if (token) {
      token = token.trim();
    }

    // Handle case where frontend sends "null" or "undefined" as a string
    if (!token || token === 'null' || token === 'undefined') {
      console.log(`Auth failed: Invalid token found (${token}) in ${tokenSource}`);
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    console.log(`Auth verification - Source: ${tokenSource}, Token (first 10 chars): ${token.substring(0, 10)}`);

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET is not defined!');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error('Full Token Verification Error:', error);
    console.error('Token attempted (length):', token ? token.length : 0);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// ... rest of the auth middleware remains the same


export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export const verifyEligibility = async (req, res, next) => {
  try {
    // Prefer req.user (set by protect) but fall back to req.body.id
    const id = req.user?._id || req.body?.id;

    if (!id) {
      return res.status(400).json({ message: 'User id is required for eligibility check' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isRegistered || !user.hasPaid || !user.isOnboarded) {
      return res.status(403).json({
        message: 'You are not eligible to access this resource',
        isRegistered: user.isRegistered,
        hasPaid: user.hasPaid,
        isOnboarded: user.isOnboarded
      });
    }

    if (!user.hasActiveSubscription()) {
      return res.status(403).json({
        message: 'Your subscription has expired',
        subscription: user.subscription
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
