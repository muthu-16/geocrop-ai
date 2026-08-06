import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporter = null;

// Initialize Nodemailer Transporter
async function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    // Real SMTP Transporter (Gmail / SendGrid / Custom SMTP)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    console.log('📧 Configured Real Production SMTP Transporter for:', smtpUser);
  } else {
    // Ethereal SMTP Test Account Fallback (Generates real test email inbox URL!)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('✉️ Initialized Ethereal Test Email Service. Test User:', testAccount.user);
    } catch (err) {
      console.warn('Could not create Ethereal test account:', err.message);
    }
  }

  return transporter;
}

/**
 * Send 6-Digit OTP Email
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6-digit numeric OTP code
 * @param {string} userName - User's full name
 */
export async function sendOTPEmail(toEmail, otpCode, userName = 'Engineer') {
  try {
    const mailer = await getTransporter();
    if (!mailer) {
      console.log(`🔒 [Console Fallback OTP]: Real OTP for ${toEmail} is [${otpCode}]`);
      return { success: true, simulated: true };
    }

    const fromSender = process.env.EMAIL_FROM || '"GeoCrop AI Platform" <noreply@geocrop.ai>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0b1118; color: #f8fafc; padding: 30px; borderRadius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #10b981; margin: 0; font-size: 24px; font-weight: 800;">GeoCrop AI v2.0</h1>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Civil & Agricultural Intelligence Platform</p>
        </div>
        
        <div style="background-color: #111923; padding: 24px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 16px;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #94a3b8; font-size: 13px;">Your 6-digit account verification code is:</p>
          
          <div style="background-color: #070b10; border: 2px dashed #10b981; padding: 16px; border-radius: 10px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 900; font-family: monospace; letter-spacing: 8px; color: #34d399;">${otpCode}</span>
          </div>

          <p style="color: #f59e0b; font-size: 12px; margin-top: 12px;">⚠️ This OTP code will expire in <strong>${config.otpExpiryMinutes} minutes</strong>.</p>
        </div>

        <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 24px;">
          If you did not request this verification code, please ignore this email.<br/>
          GeoCrop AI Engineering Security Team
        </p>
      </div>
    `;

    const info = await mailer.sendMail({
      from: fromSender,
      to: toEmail,
      subject: `🛡️ ${otpCode} - GeoCrop AI Verification Code`,
      html: htmlContent
    });

    console.log(`✅ OTP Email successfully sent to [${toEmail}]! MessageId: ${info.messageId}`);
    
    // If Ethereal test email was used, print the direct preview link!
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Preview Test Email Inbox Link: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    console.log(`🔒 [Console Fallback OTP]: Real OTP for ${toEmail} is [${otpCode}]`);
    return { success: false, error: err.message };
  }
}
