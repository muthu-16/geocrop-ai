import express from 'express';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  saveReport,
  getReports
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { strict10ReqPerSecLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply strict 10 requests / second rate limiter to all auth routes
router.use(strict10ReqPerSecLimiter);

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateToken, getProfile);

// Audit Report Archive Endpoints
router.post('/save-report', saveReport);
router.get('/reports', getReports);

export default router;
