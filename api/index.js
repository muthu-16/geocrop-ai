import nodemailer from 'nodemailer';

// Memory store for Vercel Serverless Functions
const tempUserStore = new Map();
const tempOtpStore = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';

  // 1. REGISTER ROUTE (/api/auth/register)
  if (url.includes('/api/auth/register') && req.method === 'POST') {
    try {
      const { fullName, username, email, mobile, password, confirmPassword } = req.body || {};

      if (!fullName || !email || !password) {
        return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const userId = Date.now();

      tempUserStore.set(userId, {
        id: userId,
        fullName,
        username: username || cleanEmail,
        email: cleanEmail,
        mobile,
        password,
        isVerified: false
      });

      tempOtpStore.set(userId, {
        otp: rawOtp,
        expiresAt: Date.now() + 5 * 60 * 1000
      });

      // Send Real Email via Gmail Nodemailer
      const smtpUser = process.env.SMTP_USER || 'kbsam0304@gmail.com';
      const smtpPass = process.env.SMTP_PASS || 'awhtcrzearfqyagt';

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      const mailOptions = {
        from: '"GeoCrop AI Security" <kbsam0304@gmail.com>',
        to: cleanEmail,
        subject: `🛡️ ${rawOtp} - GeoCrop AI Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0b1118; color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #10b981; margin: 0; font-size: 24px; font-weight: 800;">GeoCrop AI v2.0</h1>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Civil & Agricultural Intelligence Platform</p>
            </div>
            
            <div style="background-color: #111923; padding: 24px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
              <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 16px;">Hello <strong>${fullName}</strong>,</p>
              <p style="color: #94a3b8; font-size: 13px;">Your 6-digit account verification code is:</p>
              
              <div style="background-color: #070b10; border: 2px dashed #10b981; padding: 16px; border-radius: 10px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 900; font-family: monospace; letter-spacing: 8px; color: #34d399;">${rawOtp}</span>
              </div>

              <p style="color: #f59e0b; font-size: 12px; margin-top: 12px;">⚠️ This OTP code will expire in <strong>5 minutes</strong>.</p>
            </div>

            <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 24px;">
              If you did not request this verification code, please ignore this email.<br/>
              GeoCrop AI Engineering Security Team
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent OTP email to [${cleanEmail}] via Vercel Serverless Function!`);

      return res.status(200).json({
        success: true,
        userId,
        email: cleanEmail,
        message: 'Registration successful! OTP email sent to inbox.'
      });

    } catch (err) {
      console.error('Vercel Register Error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to send OTP email.' });
    }
  }

  // 2. VERIFY OTP ROUTE (/api/auth/verify-otp)
  if (url.includes('/api/auth/verify-otp') && req.method === 'POST') {
    const { userId, otp } = req.body || {};
    const record = tempOtpStore.get(Number(userId));

    if (record && record.otp === String(otp).trim()) {
      const user = tempUserStore.get(Number(userId));
      return res.status(200).json({
        success: true,
        user: user || { id: userId, fullName: 'Civil Engineer', email: 'user@geocrop.ai' }
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid 6-digit OTP code.' });
  }

  // 3. LOGIN ROUTE (/api/auth/login)
  if (url.includes('/api/auth/login') && req.method === 'POST') {
    const { identifier, password } = req.body || {};
    return res.status(200).json({
      success: true,
      user: { id: Date.now(), fullName: 'Civil Engineer', username: identifier, email: identifier }
    });
  }

  return res.status(200).json({ status: 'OK', message: 'Vercel Serverless API Active' });
}
