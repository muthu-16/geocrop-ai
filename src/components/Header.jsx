import React, { useState, useEffect } from 'react';
import { Layers, Sprout, FileText, Globe, Sparkles, Building2, Smartphone, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Header({ activeTab, setActiveTab, currentUser, onLogout }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        lang === 'ta'
          ? 'ஆப்-ஐ போனில் நிறுவ: உங்கள் உலாவியின் "Add to Home Screen" அல்லது "Install App" பட்டனை அழுத்தவும்.'
          : 'To install the app: Tap your browser menu and select "Add to Home Screen" or "Install App".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b1118]/90 backdrop-blur-lg border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-geo-600 via-emerald-500 to-earth-500 p-0.5 shadow-lg shadow-geo-500/20">
              <div className="w-full h-full bg-[#0d131a] rounded-[14px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-geo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-geo-300 bg-clip-text text-transparent font-sans">
                  {t('appTitle')}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-geo-500/20 text-geo-300 border border-geo-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> PWA App Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('geo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === 'geo'
                  ? 'bg-geo-600 text-white shadow-md shadow-geo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('geotechnicalTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('agri')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === 'agri'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>{t('agricultureTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                activeTab === 'report'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('reportTab')}</span>
            </button>
          </div>

          {/* Actions: Language Toggle & User Logout */}
          <div className="flex items-center gap-2.5">
            
            {/* Logged In User Profile Badge */}
            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="text-left leading-tight">
                  <span className="text-white font-bold block">{currentUser.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono block">{currentUser.role}</span>
                </div>
              </div>
            )}

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-geo-300 border border-geo-500/40 shadow-lg transition-all duration-200 group"
              title="Switch Language (English / தமிழ்)"
            >
              <Globe className="w-4 h-4 text-geo-400 group-hover:rotate-45 transition-transform" />
              <span>{t('toggleLanguage')}</span>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all duration-200"
                title="Logout from Session"
              >
                <span>{lang === 'ta' ? 'வெளியேறு' : 'Logout'}</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('geo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeTab === 'geo' ? 'bg-geo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Geo</span>
          </button>

          <button
            onClick={() => setActiveTab('agri')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeTab === 'agri' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Agri</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              activeTab === 'report' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>

      </div>
    </header>
  );
}
