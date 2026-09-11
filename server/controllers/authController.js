import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { config } from '../config/env.js';
import { sendOTPEmail } from '../utils/emailSender.js';

// Helper: Generate 6-digit numeric OTP
function generate6DigitOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 1. User Registration API
 */
export async function register(req, res) {
  try {
    const { fullName, username, email, mobile, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !username || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Password and Confirm Password do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    // Check unique constraints (only in confirmed users)
    const existingUser = db.prepare(
      'SELECT id, username, email, mobile, is_verified FROM users WHERE username = ? OR email = ? OR mobile = ?'
    ).get(cleanUsername, cleanEmail, cleanMobile);

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return res.status(400).json({ success: false, error: 'Username is already taken.' });
      }
      if (existingUser.email === cleanEmail) {
        return res.status(400).json({ success: false, error: 'Email address is already registered.' });
      }
      if (existingUser.mobile === cleanMobile) {
        return res.status(400).json({ success: false, error: 'Mobile number is already registered.' });
      }
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6-Digit OTP
    const rawOtp = generate6DigitOTP();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000).toISOString();

    // DO NOT save to users table yet. Save to pending_registrations.
    const insertStmt = db.prepare(`
      INSERT INTO pending_registrations (full_name, username, email, mobile, password_hash, otp_code_hash, plain_otp, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      fullName.trim(), cleanUsername, cleanEmail, cleanMobile, passwordHash, otpHash, rawOtp, expiresAt
    );
    const pendingId = result.lastInsertRowid;

    // Dispatch real email via Nodemailer
    const emailResult = await sendOTPEmail(cleanEmail, rawOtp, fullName.trim());

    return res.status(201).json({
      success: true,
      message: 'Registration successful! A 6-digit OTP code has been sent to your email.',
      userId: pendingId, // Sending pending ID as userId
      email: cleanEmail,
      emailPreviewUrl: emailResult.previewUrl || null,
      expiresInMinutes: config.otpExpiryMinutes
    });

  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed due to server error.' });
  }
}

/**
 * 2. Verify OTP API
 */
export async function verifyOTP(req, res) {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, error: 'User ID and 6-digit OTP code are required.' });
    }

    const pendingRecord = db.prepare(`
      SELECT * FROM pending_registrations 
      WHERE id = ? 
    `).get(userId);

    if (!pendingRecord) {
      return res.status(400).json({ success: false, error: 'No OTP request found for this account.' });
    }

    // Check expiration (5 minutes)
    if (new Date() > new Date(pendingRecord.expires_at)) {
      return res.status(400).json({ success: false, error: 'OTP has expired (5-minute limit). Please click Resend OTP.' });
    }

    // Verify OTP hash
    const isMatch = await bcrypt.compare(otp.trim(), pendingRecord.otp_code_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid 6-digit OTP code.' });
    }

    // Double check unique constraints again in case someone else took it while pending
    const existingUser = db.prepare(
      'SELECT id, username, email, mobile FROM users WHERE username = ? OR email = ? OR mobile = ?'
    ).get(pendingRecord.username, pendingRecord.email, pendingRecord.mobile);

    if (existingUser) {
       return res.status(400).json({ success: false, error: 'Username/Email/Mobile was taken while verifying OTP.' });
    }

    // Activate user account (Move from pending to real users table)
    const insertUserStmt = db.prepare(`
      INSERT INTO users (full_name, username, email, mobile, password_hash, is_verified)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    
    const userResult = insertUserStmt.run(
      pendingRecord.full_name, pendingRecord.username, pendingRecord.email, pendingRecord.mobile, pendingRecord.password_hash
    );
    const newUserId = userResult.lastInsertRowid;

    // Delete verified pending record
    db.prepare('DELETE FROM pending_registrations WHERE id = ?').run(userId);

    // Get final user details
    const user = db.prepare('SELECT id, full_name, username, email, mobile FROM users WHERE id = ?').get(newUserId);

    // Issue JWT Token
    const token = jwt.sign({ userId: user.id, username: user.username }, config.jwtSecret, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user
    });

  } catch (err) {
    console.error('Verify OTP Error:', err);
    return res.status(500).json({ success: false, error: 'OTP verification failed.' });
  }
}

/**
 * 3. Resend OTP API (60-second cooldown)
 */
export async function resendOTP(req, res) {
  try {
    const { userId } = req.body; // Actually the pending_registration ID

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required.' });
    }

    const pendingRecord = db.prepare('SELECT id, email, full_name, created_at FROM pending_registrations WHERE id = ?').get(userId);
    if (!pendingRecord) {
      return res.status(404).json({ success: false, error: 'Registration session expired or not found. Please register again.' });
    }

    // Check 60-second cooldown from last OTP
    const secondsPassed = Math.floor((Date.now() - new Date(pendingRecord.created_at).getTime()) / 1000);
    if (secondsPassed < config.otpResendCooldownSeconds) {
      const remainingSec = config.otpResendCooldownSeconds - secondsPassed;
      return res.status(429).json({
        success: false,
        error: `Please wait ${remainingSec} seconds before requesting a new OTP.`
      });
    }

    // Generate new 6-digit OTP
    const rawOtp = generate6DigitOTP();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000).toISOString();

    db.prepare(`
      UPDATE pending_registrations 
      SET otp_code_hash = ?, plain_otp = ?, expires_at = ?, created_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(otpHash, rawOtp, expiresAt, userId);

    // Dispatch real email via Nodemailer
    const emailResult = await sendOTPEmail(pendingRecord.email, rawOtp, pendingRecord.full_name || 'Engineer');

    return res.status(200).json({
      success: true,
      message: 'A new 6-digit OTP has been sent to your email.',
      emailPreviewUrl: emailResult.previewUrl || null,
      expiresInMinutes: config.otpExpiryMinutes
    });

  } catch (err) {
    console.error('Resend OTP Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to resend OTP.' });
  }
}

/**
 * 4. User Login API (With 5 Failed Attempt Lockout & Rate Limiting)
 */
export async function login(req, res) {
  try {
    const { identifier, password } = req.body; // identifier = username or email

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Username/Email and Password are required.' });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Check Account Lockout State
    const attemptRecord = db.prepare('SELECT * FROM login_attempts WHERE identifier = ?').get(cleanId);
    if (attemptRecord && attemptRecord.locked_until) {
      const lockUntilDate = new Date(attemptRecord.locked_until);
      if (new Date() < lockUntilDate) {
        const minutesLeft = Math.ceil((lockUntilDate.getTime() - Date.now()) / (1000 * 60));
        return res.status(423).json({
          success: false,
          error: `Account locked due to 5 failed login attempts. Please try again in ${minutesLeft} minutes.`
        });
      } else {
        // Lockout expired, reset failed count
        db.prepare('UPDATE login_attempts SET failed_count = 0, locked_until = NULL WHERE identifier = ?').run(cleanId);
      }
    }

    // Find User by Username or Email
    const user = db.prepare(
      'SELECT * FROM users WHERE username = ? OR email = ?'
    ).get(cleanId, cleanId);

    if (!user) {
      recordFailedAttempt(cleanId);
      return res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    }

    // Verify Password Hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const remainingAttempts = recordFailedAttempt(cleanId);
      if (remainingAttempts === 0) {
        return res.status(423).json({
          success: false,
          error: `Account locked due to 5 failed login attempts. Please try again in 15 minutes.`
        });
      }
      return res.status(401).json({
        success: false,
        error: `Invalid password. ${remainingAttempts} attempts remaining before account lock.`
      });
    }

    // Check Account Verification
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        error: 'Your account is not verified yet. Please complete OTP verification.',
        requiresOTP: true,
        userId: user.id
      });
    }

    // Clear failed attempts on successful login
    db.prepare('DELETE FROM login_attempts WHERE identifier = ?').run(cleanId);

    // Create JWT Token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Save session in DB
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO sessions (user_id, jwt_token, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, token, req.ip, req.headers['user-agent'] || '', sessionExpires);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        mobile: user.mobile
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, error: 'Login failed due to server error.' });
  }
}

// Helper: Record Failed Login Attempt & Handle 15-min Lockout
function recordFailedAttempt(identifier) {
  let record = db.prepare('SELECT * FROM login_attempts WHERE identifier = ?').get(identifier);
  
  if (!record) {
    db.prepare('INSERT INTO login_attempts (identifier, failed_count) VALUES (?, 1)').run(identifier);
    return config.maxLoginAttempts - 1;
  }

  const newCount = record.failed_count + 1;

  if (newCount >= config.maxLoginAttempts) {
    const lockedUntil = new Date(Date.now() + config.lockoutMinutes * 60 * 1000).toISOString();
    db.prepare(
      'UPDATE login_attempts SET failed_count = ?, locked_until = ?, last_attempt_at = CURRENT_TIMESTAMP WHERE identifier = ?'
    ).run(newCount, lockedUntil, identifier);
    return 0;
  } else {
    db.prepare(
      'UPDATE login_attempts SET failed_count = ?, last_attempt_at = CURRENT_TIMESTAMP WHERE identifier = ?'
    ).run(newCount, identifier);
    return config.maxLoginAttempts - newCount;
  }
}

/**
 * 5. Forgot Password API
 */
export async function forgotPassword(req, res) {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Username or Email is required.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = db.prepare('SELECT id, email FROM users WHERE username = ? OR email = ?').get(cleanId, cleanId);

    if (!user) {
      // Return success even if not found to prevent user enumeration attacks
      return res.status(200).json({
        success: true,
        message: 'If the account exists, a password reset 6-digit OTP has been issued.'
      });
    }

    const rawOtp = generate6DigitOTP();
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO password_resets (user_id, reset_otp_hash, plain_otp, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(user.id, otpHash, rawOtp, expiresAt);

    // Send the real email
    const emailResult = await sendOTPEmail(user.email, rawOtp, 'Engineer');

    return res.status(200).json({
      success: true,
      message: 'Password reset 6-digit OTP has been sent to your email.',
      userId: user.id,
      emailPreviewUrl: emailResult.previewUrl || null,
      expiresInMinutes: config.otpExpiryMinutes
    });

  } catch (err) {
    console.error('Forgot Password Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process forgot password.' });
  }
}

/**
 * 6. Reset Password API
 */
export async function resetPassword(req, res) {
  try {
    const { userId, otp, newPassword, confirmPassword } = req.body;

    if (!userId || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'User ID, OTP, New Password, and Confirm Password are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'New Password and Confirm Password do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const resetRecord = db.prepare(`
      SELECT * FROM password_resets 
      WHERE user_id = ? AND is_used = 0 
      ORDER BY id DESC LIMIT 1
    `).get(userId);

    if (!resetRecord) {
      return res.status(400).json({ success: false, error: 'No active password reset request found.' });
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ success: false, error: 'Reset OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), resetRecord.reset_otp_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid 6-digit OTP code.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newPasswordHash, userId);

    // Mark reset record as used
    db.prepare('UPDATE password_resets SET is_used = 1 WHERE id = ?').run(resetRecord.id);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (err) {
    console.error('Reset Password Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
}

/**
 * 7. Get Authenticated Profile API
 */
export async function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}

/**
 * 8. Save Official Audit Generated Report API (Government Audit Archive)
 */
export async function saveReport(req, res) {
  try {
    const {
      userId,
      engineerName,
      locationCity,
      locationDistrict,
      gpsCoords,
      soilType,
      safeBearingCapacity,
      maxSafeFloors,
      targetFloors,
      targetStatus,
      pdfBase64
    } = req.body;

    const reportRefId = `GC-REPORT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const stmt = db.prepare(`
      INSERT INTO generated_reports (
        report_ref_id, user_id, engineer_name, location_city, location_district,
        gps_coords, soil_type, safe_bearing_capacity, max_safe_floors,
        target_floors, target_status, pdf_base64
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      reportRefId,
      userId || null,
      engineerName || 'Civil Engineer',
      locationCity || 'Site',
      locationDistrict || '',
      gpsCoords || '',
      soilType || 'alluvial',
      parseFloat(safeBearingCapacity) || 0,
      parseInt(maxSafeFloors) || 0,
      parseInt(targetFloors) || 0,
      targetStatus || 'FEASIBLE',
      pdfBase64 || null
    );

    console.log(`📄 Official Audit Report [${reportRefId}] archived into SQLite Database!`);

    return res.status(201).json({
      success: true,
      message: 'Report saved to Government Audit database archive.',
      reportRefId
    });
  } catch (err) {
    console.error('Save Report Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to archive report.' });
  }
}

/**
 * 9. Get Archived Government Reports API
 */
export async function getReports(req, res) {
  try {
    const reports = db.prepare(`
      SELECT id, report_ref_id, engineer_name, location_city, location_district, gps_coords, soil_type, safe_bearing_capacity, max_safe_floors, target_floors, target_status, created_at
      FROM generated_reports
      ORDER BY id DESC LIMIT 50
    `).all();

    return res.status(200).json({ success: true, reports });
  } catch (err) {
    console.error('Get Reports Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch archived reports.' });
  }
}
