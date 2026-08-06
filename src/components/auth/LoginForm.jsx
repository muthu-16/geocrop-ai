import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertOctagon, ShieldAlert, KeyRound } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function LoginForm({ onLoginSuccess, onSwitchToRegister, onSwitchToForgotPassword, onRequiresOTP }) {
  const { lang } = useLanguage();
  const isTa = lang === 'ta';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLocked(false);
    setIsLoading(true);

    try {
      let data;
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });

        const resText = await response.text();
        const jsonRes = resText ? JSON.parse(resText) : null;

        if (response.ok && jsonRes && jsonRes.success) {
          data = jsonRes;
        } else if (jsonRes && jsonRes.error) {
          if (response.status === 423) {
            setIsLocked(true);
          }
          if (jsonRes.requiresOTP) {
            onRequiresOTP(jsonRes);
            return;
          }
          throw new Error(jsonRes.error);
        } else {
          throw new Error('FALLBACK_TRIGGERED');
        }
      } catch (apiErr) {
        if (apiErr.message !== 'FALLBACK_TRIGGERED' && apiErr.message && !apiErr.message.includes('JSON')) {
          throw apiErr;
        }

        // Strict Local DB Authentication Check
        const existingUsers = JSON.parse(localStorage.getItem('geocrop_users') || '[]');
        const cleanId = identifier.trim().toLowerCase();

        const user = existingUsers.find(u => u.username === cleanId || u.email === cleanId);

        if (!user) {
          throw new Error(isTa ? 'கணக்கு பெறப்படவில்லை. தயவுசெய்து முதலில் பதிவு செய்யவும்.' : 'Account not found. Please register first.');
        }

        if (user.password !== password) {
          throw new Error(isTa ? 'தவறான கடவுச்சொல்.' : 'Invalid password.');
        }

        if (!user.isVerified) {
          onRequiresOTP({ userId: user.id, email: user.email });
          return;
        }

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

      onLoginSuccess(data);
    } catch (err) {
      setErrorMsg(err.message || (isTa ? 'உள்நுழைவு தோல்வியடைந்தது.' : 'Login failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white">
          {isTa ? 'பொறியியல் போர்ட்டலில் உள்நுழைக' : 'Sign In to GeoCrop AI'}
        </h2>
        <p className="text-xs text-slate-400">
          {isTa ? 'உங்கள் பயனர்பெயர் / மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்' : 'Enter your Username or Email + Password'}
        </p>
      </div>

      {errorMsg && (
        <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
          isLocked
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
        }`}>
          {isLocked ? <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" /> : <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          <div>
            <strong className="block font-bold mb-0.5">
              {isLocked ? (isTa ? 'கணக்கு முடக்கப்பட்டது (15 நிமிடம்)' : 'Account Locked (15 Minutes)') : 'Authentication Error'}
            </strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
        
        {/* Username or Email */}
        <div className="space-y-1">
          <label className="text-slate-300 font-bold block">{isTa ? 'பயனர்பெயர் அல்லது மின்னஞ்சல்' : 'Username or Email'}</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="engineer@geocrop.ai or muthu_geo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-slate-300 font-bold">{isTa ? 'கடவுச்சொல்' : 'Password'}</label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-[11px] text-emerald-400 hover:underline font-semibold"
            >
              {isTa ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isLocked}
          className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <span>{isTa ? 'சரிபார்க்கிறது...' : 'Authenticating...'}</span>
          ) : (
            <>
              <span>{isTa ? 'உள்நுழைக' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-3 border-t border-slate-800 text-xs">
        <span className="text-slate-400">{isTa ? 'புதிய பயனரா?' : 'Don\'t have an account?'}</span>{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-emerald-400 font-bold hover:underline"
        >
          {isTa ? 'புதிய கணக்கு தொடங்கவும்' : 'Register Now'}
        </button>
      </div>
    </div>
  );
}
