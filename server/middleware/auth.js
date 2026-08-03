import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import db from '../db/database.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required.'
    });
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired authentication token.'
      });
    }

    // Verify user exists and is verified
    const user = db.prepare('SELECT id, full_name, username, email, mobile, is_verified FROM users WHERE id = ?').get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ success: false, error: 'User account is not OTP verified.' });
    }

    req.user = user;
    next();
  });
}
