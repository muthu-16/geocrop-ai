import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, AlertOctagon, CheckCircle2, Zap, ArrowRight, Activity, Layers, Building2, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { loginRateLimiter } from '../engine/rateLimiter';

export function LoginPage({ onLoginSuccess }) {
  const { lang, setLang } = useLanguage();
  const isTa = lang === 'ta';

  const [email, setEmail] = useState('engineer@geocrop.ai');
  const [password, setPassword] = useState('geocrop2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);
  const [currentRate, setCurrentRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isStressTesting, setIsStressTesting] = useState(false);

  // Poll rate limiter every 200ms to show real-time load meter
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRate(loginRateLimiter.getCurrentRate());
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setRateLimitExceeded(false);

    // Rate Limit Check (Max 10 req / sec)
    const rateCheck = loginRateLimiter.checkLimit();
    setCurrentRate(rateCheck.currentRate);

    if (!rateCheck.allowed) {
      setRateLimitExceeded(true);
      setErrorMsg(isTa ? rateCheck.messageTa : rateCheck.messageEn);
      return;
    }

    setIsLoading(true);

    // Simulate authentication processing
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email,
        name: 'Civil Engineer',
        role: 'Chief Geotechnical Auditor',
        loggedInAt: new Date().toISOString()
      });
    }, 400);
  };

  // Stress test function to simulate 12 rapid clicks within 1 second
  const runRateLimitStressTest = () => {
    setIsStressTesting(true);
    setErrorMsg('');
    setRateLimitExceeded(false);

    let blockedCount = 0;
    let allowedCount = 0;

    for (let i = 0; i < 14; i++) {
      const check = loginRateLimiter.checkLimit();
      if (check.allowed) {
        allowedCount++;
      } else {
        blockedCount++;
      }
    }

    setCurrentRate(loginRateLimiter.getCurrentRate());
    setRateLimitExceeded(true);
    setErrorMsg(
      isTa
        ? `🔥 நெரிசல் சோதனை! 14 கோரிக்கைகளில் ${allowedCount} அனுமதிக்கப்பட்டது, ${blockedCount} தடுக்கப்பட்டது (அதிகபட்ச வரம்பு: 10/வினாடி).`
        : `🔥 Stress Test Triggered! Sent 14 rapid logins: ${allowedCount} allowed, ${blockedCount} blocked (Limit: 10 req/sec).`
    );

    setTimeout(() => {
      setIsStressTesting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="p-6 flex justify-between items-center z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">GeoCrop AI v2.0</h1>
            <p className="text-[10px] text-slate-400 font-mono">Civil & Agricultural Intelligence Platform</p>
          </div>
        </div>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'ta' ? 'en' : 'ta')}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center gap-2"
        >
          🌐 {lang === 'ta' ? 'English' : 'தமிழ்'}
        </button>
      </header>

      {/* Center Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-6">
        <div className="w-full max-w-md bg-[#111923]/90 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-6 relative">
          
          {/* Top Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> Secure Authentication Portal
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isTa ? 'உள்நுழைவு மையம்' : 'Engineering Portal Access'}
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isTa
                ? 'நிலப்பரப்பு மற்றும் விவசாய பகுப்பாய்வு தளத்தை அணுக உள்நுழையவும்.'
                : 'Enter your credentials to access civil engineering & precision crop analytics.'}
            </p>
          </div>

          {/* RATE LIMIT OR ERROR ALERT */}
          {errorMsg && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              rateLimitExceeded
                ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
            }`}>
              <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${rateLimitExceeded ? 'text-rose-400' : 'text-amber-400'}`} />
              <div>
                <strong className="block font-bold mb-0.5">
                  {rateLimitExceeded ? (isTa ? 'அளவுக்கு அதிகமான கோரிக்கைகள் (429)' : 'Rate Limit Triggered (429)') : 'Auth Error'}
                </strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-bold block">
                {isTa ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="engineer@geocrop.ai"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-bold block">
                {isTa ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isStressTesting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span>{isTa ? 'சரிபார்க்கிறது...' : 'Authenticating...'}</span>
              ) : (
                <>
                  <span>{isTa ? 'உள்நுழையவும்' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* STRESS TEST & QUICK DEMO BUTTONS */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="text-[10px] text-slate-500 font-mono text-center uppercase tracking-wider">
              Rate Limit Testing Controls
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={runRateLimitStressTest}
                disabled={isStressTesting}
                className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Test 14 Reqs/Sec</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoginSuccess({
                    email: 'guest.engineer@geocrop.ai',
                    name: 'Guest Engineer',
                    role: 'Guest Inspector',
                    loggedInAt: new Date().toISOString()
                  });
                }}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                Guest Direct Access
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 z-10 border-t border-slate-900 bg-[#070b10]">
        <span>GeoCrop AI v2.0 Platform • Protected by 10 Requests/Sec Rate Limiter</span>
      </footer>

    </div>
  );
}
