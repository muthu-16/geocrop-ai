import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function ResetPasswordForm({ resetData, onResetSuccess }) {
  const { lang } = useLanguage();
  const isTa = lang === 'ta';

  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState(resetData?.otpDemoDisplay || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg(isTa ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      let data;
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: resetData?.userId,
            otp,
            newPassword,
            confirmPassword
          })
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          throw new Error('Non-JSON server response');
        }

        if (!response.ok || !data.success) {
          throw new Error(data?.error || 'Failed to reset password.');
        }
      } catch (apiErr) {
        // Local DB password reset check
        const existingUsers = JSON.parse(localStorage.getItem('geocrop_users') || '[]');
        const userIndex = existingUsers.findIndex(u => u.id === resetData?.userId || u.email === resetData?.email);

        if (userIndex === -1) {
          throw new Error(isTa ? 'பயனர் கணக்கு பெறப்படவில்லை.' : 'User account not found.');
        }

        const user = existingUsers[userIndex];
        if (user.currentOtp !== otp.trim()) {
          throw new Error(isTa ? 'தவறான 6-இலக்க OTP குறியீடு.' : 'Invalid 6-digit OTP code.');
        }

        existingUsers[userIndex].password = newPassword;
        localStorage.setItem('geocrop_users', JSON.stringify(existingUsers));
        data = { success: true };
      }

      onResetSuccess();
    } catch (err) {
      setErrorMsg(err.message || (isTa ? 'கடவுச்சொல் மாற்றுவது தோல்வியடைந்தது.' : 'Failed to reset password.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white">
          {isTa ? 'புதிய கடவுச்சொல் அமைவு' : 'Set New Password'}
        </h2>
        <p className="text-xs text-slate-400">
          {isTa ? '6-இலக்க OTP மற்றும் புதிய கடவுச்சொல்லை உள்ளிடவும்' : 'Enter 6-digit OTP code and your new password'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        
        {/* OTP Input */}
        <div className="space-y-1 text-center">
          <label className="text-slate-300 font-bold block">{isTa ? '6-இலக்க OTP' : '6-Digit Reset OTP'}</label>
          <input
            type="text"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="123456"
            className="w-full text-center tracking-[0.8em] font-mono text-xl font-bold bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-amber-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="text-slate-300 font-bold block">{isTa ? 'புதிய கடவுச்சொல்' : 'New Password'}</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-slate-300 font-bold block">{isTa ? 'உறுதிசெய்க' : 'Confirm New Password'}</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span>{isTa ? 'புதுப்பிக்கிறது...' : 'Resetting Password...'}</span>
          ) : (
            <>
              <span>{isTa ? 'கடவுச்சொல்லை மாற்று' : 'Save New Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
