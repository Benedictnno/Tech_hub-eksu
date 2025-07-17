import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // adjust path as needed

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Allow to proceed
      return next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  // If no token was found
  return res.status(401).json({ message: 'Not authorized, no token' });
}; 


export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export const verifyEligibility = async (req, res, next) => {
 
  
  try {
    const user = await User.findById(req.body.id);
    
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