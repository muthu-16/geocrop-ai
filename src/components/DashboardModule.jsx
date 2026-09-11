import React from 'react';
import { Building2, Sprout, FileText, ArrowRight, Activity, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function DashboardModule({ currentUser, setActiveTab, location }) {
  const { lang } = useLanguage();
  const isTa = lang === 'ta';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 via-[#0b1118] to-[#0b1118] border border-emerald-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-geo-500/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>{isTa ? 'பயனர்: ' : 'USER: '} {currentUser?.fullName || currentUser?.name || 'Engineer'}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {isTa ? 'வரவேற்கிறோம்' : 'Welcome'}
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
            {isTa 
              ? 'உங்கள் நிலத்தின் புவியியல் மற்றும் விவசாய தரவுகளை துல்லியமாக பகுப்பாய்வு செய்து, அஸ்திவாரம் மற்றும் உரம் குறித்த ஆலோசனைகளை பெறலாம்.' 
              : 'You are now securely logged into GeoCrop AI. Access your high-precision geotechnical engineering analytics and agronomy intelligence below.'}
          </p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Geo Card */}
        <button 
          onClick={() => setActiveTab('geo')}
          className="group relative text-left bg-[#16202c]/80 hover:bg-[#1a2634] border border-slate-800 hover:border-geo-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building2 className="w-24 h-24 text-geo-400" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-geo-500/20 text-geo-400 flex items-center justify-center border border-geo-500/30 mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-2 group-hover:text-geo-300 transition-colors">
            {isTa ? 'சிவில் / மண் பகுப்பாய்வு' : 'Civil Foundation & Soil'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {isTa ? 'மண்ணின் தாங்கும் திறன், அஸ்திவாரம், மற்றும் 17-வகை மண் சோதனைகளை மேற்கொள்ளவும்.' : 'Calculate Safe Bearing Capacity (SBC), Foundation recommendations, and analyze 17 physical soil parameters.'}
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-geo-400">
            <span>{isTa ? 'தொடங்க' : 'Launch Module'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Agri Card */}
        <button 
          onClick={() => setActiveTab('agri')}
          className="group relative text-left bg-[#16202c]/80 hover:bg-[#1a2634] border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sprout className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-4 group-hover:scale-110 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-2 group-hover:text-emerald-300 transition-colors">
            {isTa ? 'துல்லிய விவசாயம்' : 'Precision Agriculture'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {isTa ? 'பயிர் பரிந்துரைகள், NPK உர அளவுகள், மற்றும் பாசன தேவைகளை கண்டறியவும்.' : 'Calculate NPK fertilizer schedules, crop suitability algorithms, and precision micronutrient deficits.'}
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span>{isTa ? 'தொடங்க' : 'Launch Module'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Report Card */}
        <button 
          onClick={() => setActiveTab('report')}
          className="group relative text-left bg-[#16202c]/80 hover:bg-[#1a2634] border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition-all duration-300 shadow-xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText className="w-24 h-24 text-amber-400" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-2 group-hover:text-amber-300 transition-colors">
            {isTa ? 'அறிக்கை உருவாக்கம்' : 'Official PDF Reports'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            {isTa ? 'உங்கள் பகுப்பாய்வு முடிவுகளை அதிகாரப்பூர்வ PDF அறிக்கையாக தரவிறக்கம் செய்யவும்.' : 'Generate officially formatted Government / Structural Engineering Audit PDF reports for client handoffs.'}
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <span>{isTa ? 'தொடங்க' : 'Launch Module'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>
    </div>
  );
}
