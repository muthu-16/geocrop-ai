import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function OTPVerifyForm({ regData, onVerificationSuccess, onSwitchToLogin }) {
  const { lang } = useLanguage();
  const isTa = lang === 'ta';

  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState(regData?.otpDemoDisplay || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Timers
  const [expirySeconds, setExpirySeconds] = useState(5 * 60); // 5 minutes (300s)
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds

  // 5-minute Expiry Countdown Timer
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setExpirySeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [expirySeconds]);

  // 60-second Resend Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (otp.length !== 6) {
      setErrorMsg(isTa ? '6 இலக்க OTP குறியீட்டை உள்ளிடவும்.' : 'Please enter full 6-digit OTP code.');
      return;
    }

    setIsLoading(true);

    try {
      let data;
      try {
        const response = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: regData?.userId, otp })
        });

        const resText = await response.text();
        const jsonRes = resText ? JSON.parse(resText) : null;

        if (response.ok && jsonRes && jsonRes.success) {
          data = jsonRes;
        } else if (jsonRes && jsonRes.error) {
          throw new Error(jsonRes.error);
        } else {
          throw new Error('FALLBACK_TRIGGERED');
        }
      } catch (apiErr) {
        if (apiErr.message !== 'FALLBACK_TRIGGERED' && apiErr.message && !apiErr.message.includes('JSON')) {
          throw apiErr;
        }

        // Local DB verification
        const existingUsers = JSON.parse(localStorage.getItem('geocrop_users') || '[]');
        const userIndex = existingUsers.findIndex(u => u.id === regData?.userId || u.email === regData?.email);

        if (userIndex === -1) {
          throw new Error(isTa ? 'பயனர் கணக்கு பெறப்படவில்லை. மீண்டும் பதிவு செய்யவும்.' : 'User account not found. Please register again.');
        }

        const user = existingUsers[userIndex];
        if (user.currentOtp !== otp.trim()) {
          throw new Error(isTa ? 'தவறான 6-இலக்க OTP குறியீடு.' : 'Invalid 6-digit OTP code.');
        }

        // Mark verified
        existingUsers[userIndex].isVerified = true;
        localStorage.setItem('geocrop_users', JSON.stringify(existingUsers));

        data = {
          success: true,
          user: {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email
          }
        };
      }

      setSuccessMsg(isTa ? 'கணக்கு வெற்றிகரமாக சரிபார்க்கப்பட்டது!' : 'Account verified successfully!');
      setTimeout(() => {
        onVerificationSuccess(data);
      }, 600);

    } catch (err) {
      setErrorMsg(err.message || (isTa ? 'OTP சரிபார்ப்பு தோல்வியடைந்தது.' : 'OTP Verification failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const uId = regData?.userId || regData?.id;
      const uEmail = regData?.email;

      let data;
      try {
        const response = await fetch('/api/auth/resend-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uId })
        });

        const resText = await response.text();
        data = resText ? JSON.parse(resText) : null;
      } catch (e) {
        data = null;
      }

      // Generate fresh OTP in local storage
      const existingUsers = JSON.parse(localStorage.getItem('geocrop_users') || '[]');
      const userIndex = existingUsers.findIndex(u => u.id === uId || u.email === uEmail);

      if (userIndex !== -1) {
        const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUsers[userIndex].currentOtp = freshOtp;
        localStorage.setItem('geocrop_users', JSON.stringify(existingUsers));
        console.log('🔒 Resent Verification OTP:', freshOtp);
      }

      setExpirySeconds(5 * 60);
      setResendCooldown(60);
      setSuccessMsg(isTa ? 'புதிய 6-இலக்க OTP அனுப்பப்பட்டது!' : 'New 6-digit OTP has been sent!');
    } catch (err) {
      setErrorMsg(err.message || (isTa ? 'OTP மீண்டும் அனுப்புவதில் பிழை.' : 'Failed to resend OTP.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white">
          {isTa ? '6-இலக்க OTP சரிபார்ப்பு' : 'Verify 6-Digit OTP'}
        </h2>
        <p className="text-xs text-slate-400">
          {isTa ? 'உங்கள் பதிவுசெய்த மின்னஞ்சல் / மொபைலுக்கு அனுப்பப்பட்ட OTP ஐ உள்ளிடவும்' : `Enter the 6-digit OTP code sent to ${regData?.email || 'your account'}`}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerifySubmit} className="space-y-4">
        
        {/* OTP Input */}
        <div className="space-y-1 text-center">
          <label className="text-slate-300 text-xs font-bold block">{isTa ? '6-இலக்க OTP' : 'Enter 6-Digit OTP Code'}</label>
          <input
            type="text"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="123456"
            className="w-full text-center tracking-[1em] font-mono text-2xl font-black bg-slate-950 border border-slate-700 rounded-2xl py-3 text-emerald-400 focus:outline-none focus:border-emerald-400 shadow-inner"
          />
        </div>

        {/* Timers & Expiry Bar */}
        <div className="flex justify-between items-center text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>OTP Expires: <strong className="text-white">{formatTime(expirySeconds)}</strong></span>
          </div>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0 || isLoading}
            className="text-emerald-400 font-bold hover:underline flex items-center gap-1 disabled:opacity-40 disabled:no-underline"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}</span>
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6 || expirySeconds <= 0}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span>{isTa ? 'சரிபார்க்கிறது...' : 'Verifying Code...'}</span>
          ) : (
            <>
              <span>{isTa ? 'கணக்கை செயல்படுத்துக' : 'Activate & Verify Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
