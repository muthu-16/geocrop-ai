import React, { useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { RegisterForm } from './RegisterForm';
import { OTPVerifyForm } from './OTPVerifyForm';
import { LoginForm } from './LoginForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';

export function AuthModal({ onAuthSuccess }) {
  const { lang, setLang } = useLanguage();
  // view: 'login' | 'register' | 'otp_verify' | 'forgot_password' | 'reset_password'
  const [view, setView] = useState('login');
  const [regData, setRegData] = useState(null);
  const [resetData, setResetData] = useState(null);

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
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

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'ta' ? 'en' : 'ta')}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center gap-2"
        >
          🌐 {lang === 'ta' ? 'English' : 'தமிழ்'}
        </button>
      </header>

      {/* Center Auth Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-4">
        <div className="w-full max-w-md bg-[#111923]/95 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative">
          
          {view === 'login' && (
            <LoginForm
              onLoginSuccess={onAuthSuccess}
              onSwitchToRegister={() => setView('register')}
              onSwitchToForgotPassword={() => setView('forgot_password')}
              onRequiresOTP={(data) => {
                setRegData(data);
                setView('otp_verify');
              }}
            />
          )}

          {view === 'register' && (
            <RegisterForm
              onRegisterSuccess={(data) => {
                setRegData(data);
                setView('otp_verify');
              }}
              onSwitchToLogin={() => setView('login')}
            />
          )}

          {view === 'otp_verify' && (
            <OTPVerifyForm
              regData={regData}
              onVerificationSuccess={onAuthSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          )}

          {view === 'forgot_password' && (
            <ForgotPasswordForm
              onOTPSent={(data) => {
                setResetData(data);
                setView('reset_password');
              }}
              onSwitchToLogin={() => setView('login')}
            />
          )}

          {view === 'reset_password' && (
            <ResetPasswordForm
              resetData={resetData}
              onResetSuccess={() => setView('login')}
            />
          )}

        </div>
      </main>

      <footer className="p-4 text-center text-xs text-slate-500 z-10 border-t border-slate-900 bg-[#070b10]">
        <span>GeoCrop AI v2.0 Platform • Protected by SQLite Database & 10 Reqs/Sec Rate Limiter</span>
      </footer>

    </div>
  );
}
