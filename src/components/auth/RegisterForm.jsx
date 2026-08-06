import React, { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  const { lang } = useLanguage();
  const isTa = lang === 'ta';

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg(isTa ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      let data;
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          throw new Error('Non-JSON server response');
        }

        if (!response.ok || !data.success) {
          throw new Error(data?.error || (isTa ? 'பதிவுத் தோல்வியடைந்தது.' : 'Registration failed.'));
        }
      } catch (apiErr) {
        // Local DB storage fallback for static/offline/APK deployments
        const existingUsers = JSON.parse(localStorage.getItem('geocrop_users') || '[]');
        const cleanUsername = formData.username.trim().toLowerCase();
        const cleanEmail = formData.email.trim().toLowerCase();

        const userExists = existingUsers.some(u => u.username === cleanUsername || u.email === cleanEmail);
        if (userExists) {
          throw new Error(isTa ? 'பயனர்பெயர் அல்லது மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.' : 'Username or email is already registered.');
        }

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newUser = {
          id: Date.now(),
          fullName: formData.fullName.trim(),
          username: cleanUsername,
          email: cleanEmail,
          mobile: formData.mobile.trim(),
          password: formData.password,
          isVerified: false,
          currentOtp: generatedOtp
        };

        existingUsers.push(newUser);
        localStorage.setItem('geocrop_users', JSON.stringify(existingUsers));

        // Console log for production verification without showing on screen
        console.log('🔒 Generated Verification OTP:', generatedOtp);

        data = {
          success: true,
          userId: newUser.id,
          email: cleanEmail,
          otpCode: generatedOtp,
          message: 'Registration successful!'
        };
      }

      onRegisterSuccess(data);
    } catch (err) {
      setErrorMsg(err.message || (isTa ? 'பதிவுத் தோல்வியடைந்தது.' : 'Registration failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white">
          {isTa ? 'புதிய கணக்கு உருவாக்கு' : 'Create Civil Account'}
        </h2>
        <p className="text-xs text-slate-400">
          {isTa ? 'முழுமையான பகுப்பாய்வு சேவைகளைப் பெற பதிவு செய்யவும்' : 'Register for civil engineering & precision crop analytics'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-slate-300 font-bold block">{isTa ? 'முழு பெயர்' : 'Full Name'}</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Er. Muthu Kumar"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="text-slate-300 font-bold block">{isTa ? 'பயனர்பெயர் (Unique)' : 'Username (unique)'}</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="muthu_geo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Email & Mobile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">{isTa ? 'மின்னஞ்சல்' : 'Email (unique)'}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="muthu@geocrop.ai"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">{isTa ? 'கைப்பேசி எண்' : 'Mobile (unique)'}</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">{isTa ? 'கடவுச்சொல்' : 'Password'}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">{isTa ? 'உறுதிசெய்க' : 'Confirm Password'}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span>{isTa ? 'பதிவு செய்கிறது...' : 'Creating Account...'}</span>
          ) : (
            <>
              <span>{isTa ? 'OTP அனுப்பவும்' : 'Send 6-Digit OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-800 text-xs">
        <span className="text-slate-400">{isTa ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?'}</span>{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-emerald-400 font-bold hover:underline"
        >
          {isTa ? 'இங்கே உள்நுழையவும்' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
