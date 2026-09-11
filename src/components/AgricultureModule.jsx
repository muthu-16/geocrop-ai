import React, { useState } from 'react';
import { Sprout, CheckCircle2, Award, Package, Droplets, Calendar, ChevronDown, ChevronUp, Beaker, Apple, Wheat, TreePine, HelpCircle, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DB, VEGETABLES_DB, FRUITS_DB } from '../engine/soilDatabase';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

export function AgricultureModule({ agriInputs, setAgriInputs, agriResults, setActiveTab }) {
  const { lang } = useLanguage();
  const [showMicronutrients, setShowMicronutrients] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setAgriInputs(prev => ({
      ...prev,
      [name]: (type === 'number' || type === 'range') ? (parseFloat(value) || 0) : value
    }));
  };

  const handleCategoryChange = (cat) => {
    setAgriInputs(prev => ({
      ...prev,
      plantCategory: cat,
      targetPlant: '' // reset selection when changing category
    }));
  };

  const activeDB = () => {
    switch(agriInputs.plantCategory) {
      case 'vegetable': return VEGETABLES_DB;
      case 'fruit': return FRUITS_DB;
      case 'crop':
      default: return CROPS_DB;
    }
  };

  // Safely extract from agriResults
  const {
    crop, plant,
    soilHealthScore = 0,
    fertilizer = { ureaKg: 0, ureaBags: 0, dapKg: 0, dapBags: 0, mopKg: 0, mopBags: 0 },
    topCrops = [],
    topVegetables = [],
    topFruits = [],
    radarData = [],
    micronutrientStatus = {}
  } = agriResults || {};

  const selectedPlantData = plant || crop;

  const t = {
    inputs: lang === 'ta' ? 'விவசாய உள்ளீடுகள்' : 'Agriculture Inputs',
    results: lang === 'ta' ? 'பகுப்பாய்வு முடிவுகள்' : 'Analysis Results',
    nitrogen: lang === 'ta' ? 'நைட்ரஜன் (N)' : 'Nitrogen (N)',
    phosphorus: lang === 'ta' ? 'பாஸ்பரஸ் (P)' : 'Phosphorus (P)',
    potassium: lang === 'ta' ? 'பொட்டாசியம் (K)' : 'Potassium (K)',
    chemicalParams: lang === 'ta' ? 'வேதியியல் அளவுருக்கள்' : 'Chemical Parameters',
    soilPh: lang === 'ta' ? 'மண் pH' : 'Soil pH',
    ec: lang === 'ta' ? 'EC (dS/m)' : 'EC (dS/m)',
    cec: lang === 'ta' ? 'CEC (meq/100g)' : 'CEC (meq/100g)',
    organicCarbon: lang === 'ta' ? 'கரிம கார்பன் (%)' : 'Organic Carbon (%)',
    soilMoisture: lang === 'ta' ? 'மண் ஈரப்பதம் (%)' : 'Soil Moisture (%)',
    micronutrients: lang === 'ta' ? 'நுண்ணூட்டச்சத்துக்கள்' : 'Micronutrients',
    iron: lang === 'ta' ? 'இரும்பு (Fe)' : 'Iron (Fe)',
    zinc: lang === 'ta' ? 'துத்தநாகம் (Zn)' : 'Zinc (Zn)',
    manganese: lang === 'ta' ? 'மாங்கனீசு (Mn)' : 'Manganese (Mn)',
    copper: lang === 'ta' ? 'தாமிரம் (Cu)' : 'Copper (Cu)',
    boron: lang === 'ta' ? 'போரான் (B)' : 'Boron (B)',
    category: lang === 'ta' ? 'பயிர் வகை' : 'Plant Category',
    crops: lang === 'ta' ? 'பயிர்கள்' : 'Crops',
    vegetables: lang === 'ta' ? 'காய்கறிகள்' : 'Vegetables',
    fruits: lang === 'ta' ? 'பழங்கள்' : 'Fruits',
    targetPlant: lang === 'ta' ? 'இலக்கு பயிர்' : 'Target Plant',
    selectPlant: lang === 'ta' ? 'பயிரைத் தேர்ந்தெடுக்கவும்' : 'Select a plant...',
    soilHealth: lang === 'ta' ? 'மண் வளக் குறியீடு' : 'Soil Health Score',
    nutrientBalance: lang === 'ta' ? 'ஊட்டச்சத்து சமநிலை' : 'Nutrient Balance',
    fertilizerCalc: lang === 'ta' ? 'உரத் தேவைக் கணக்கீடு' : 'Fertilizer Calculator',
    bags: lang === 'ta' ? 'மூட்டைகள்' : 'bags',
    plantDetails: lang === 'ta' ? 'பயிர் விவரங்கள்' : 'Plant Details',
    waterReq: lang === 'ta' ? 'நீர் தேவை' : 'Water Req',
    season: lang === 'ta' ? 'பருவம்' : 'Season',
    idealPh: lang === 'ta' ? 'சரியான pH' : 'Ideal pH',
    topRecommended: lang === 'ta' ? 'பரிந்துரைக்கப்படும் சிறந்த' : 'Top Recommended',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full text-slate-200">
      
      {/* INPUT PANEL */}
      <div className="lg:col-span-5 bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-slate-700/50 pb-4">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{t.inputs}</h2>
        </div>

        {/* NPK Sliders */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-emerald-300">{t.nitrogen}</span>
              <span className="text-white bg-emerald-500/20 px-2 py-0.5 rounded text-xs">{agriInputs.nitrogen || 0} kg/ha</span>
            </div>
            <input type="range" name="nitrogen" min="10" max="350" value={agriInputs.nitrogen || 0} onChange={handleInputChange} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-blue-300">{t.phosphorus}</span>
              <span className="text-white bg-blue-500/20 px-2 py-0.5 rounded text-xs">{agriInputs.phosphorus || 0} kg/ha</span>
            </div>
            <input type="range" name="phosphorus" min="5" max="200" value={agriInputs.phosphorus || 0} onChange={handleInputChange} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-amber-300">{t.potassium}</span>
              <span className="text-white bg-amber-500/20 px-2 py-0.5 rounded text-xs">{agriInputs.potassium || 0} kg/ha</span>
            </div>
            <input type="range" name="potassium" min="10" max="400" value={agriInputs.potassium || 0} onChange={handleInputChange} 
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          </div>
        </div>

        {/* Chemical Parameters */}
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            {t.chemicalParams}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">{t.soilPh} ({agriInputs.soilPH || 0})</label>
              <input type="range" name="soilPH" min="3.0" max="11.0" step="0.1" value={agriInputs.soilPH || 0} onChange={handleInputChange} 
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">{t.soilMoisture} ({agriInputs.soilMoisture || 0}%)</label>
              <input type="range" name="soilMoisture" min="0" max="100" value={agriInputs.soilMoisture || 0} onChange={handleInputChange} 
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">{t.ec}</label>
              <input type="number" name="soilEC" min="0" max="20" step="0.1" value={agriInputs.soilEC || ''} onChange={handleInputChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">{t.cec}</label>
              <input type="number" name="soilCEC" min="0" max="60" value={agriInputs.soilCEC || ''} onChange={handleInputChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-slate-400 text-xs">{t.organicCarbon}</label>
              <input type="number" name="organicCarbon" min="0" max="8" step="0.1" value={agriInputs.organicCarbon || ''} onChange={handleInputChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Micronutrients Collapsible */}
        <div className="pt-2">
          <button 
            onClick={() => setShowMicronutrients(!showMicronutrients)}
            className="flex items-center justify-between w-full p-3 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border border-slate-700/50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-300">{t.micronutrients} (mg/kg)</span>
            {showMicronutrients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showMicronutrients && (
            <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-slate-800/20 rounded-xl border border-slate-700/30">
              {['fe', 'zn', 'mn', 'cu', 'b'].map((micro, idx) => (
                <div key={micro} className={`space-y-1 ${micro === 'b' ? 'col-span-2' : ''}`}>
                  <label className="text-slate-400 text-xs uppercase">{micro === 'fe' ? t.iron : micro === 'zn' ? t.zinc : micro === 'mn' ? t.manganese : micro === 'cu' ? t.copper : t.boron}</label>
                  <input type="number" name={micro} value={agriInputs[micro] || ''} onChange={handleInputChange} placeholder="0.0"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plant Category Tabs */}
        <div className="pt-4 border-t border-slate-700/50">
          <label className="block text-sm font-semibold text-slate-400 mb-3">{t.category}</label>
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            {[
              { id: 'crop', icon: <Wheat className="w-4 h-4" />, label: t.crops },
              { id: 'vegetable', icon: <Sprout className="w-4 h-4" />, label: t.vegetables },
              { id: 'fruit', icon: <Apple className="w-4 h-4" />, label: t.fruits }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  (agriInputs.plantCategory || 'crop') === cat.id 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-sm border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Plant Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-400">{t.targetPlant}</label>
          <select 
            name="targetPlant" 
            value={agriInputs.targetPlant || ''} 
            onChange={handleInputChange}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
          >
            <option value="">{t.selectPlant}</option>
            {activeDB().map((item, idx) => (
              <option key={idx} value={item.id || item.nameEn}>
                {lang === 'ta' ? item.nameTa : item.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RESULTS PANEL */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Top Section: Score & Radar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Soil Health Score Card */}
          <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TreePine className="w-24 h-24 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-6 w-full text-center">{t.soilHealth}</h3>
            
            {/* Custom Circular Progress */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#score-gradient)" strokeWidth="8" 
                  strokeDasharray="282.7" 
                  strokeDashoffset={282.7 - (282.7 * Math.max(0, Math.min(100, soilHealthScore))) / 100}
                  className="transition-all duration-1000 ease-out" 
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={soilHealthScore > 75 ? "#10b981" : soilHealthScore > 40 ? "#f59e0b" : "#ef4444"} />
                    <stop offset="100%" stopColor={soilHealthScore > 75 ? "#34d399" : soilHealthScore > 40 ? "#fbbf24" : "#f87171"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{Math.round(soilHealthScore)}</span>
                <span className="text-xs text-slate-400 font-medium">/ 100</span>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl min-h-[280px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-300 mb-2">{t.nutrientBalance}</h3>
            <div className="flex-1 w-full min-h-[200px]">
              {radarData && radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Radar name="Actual" dataKey="Actual" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <Radar name="Target" dataKey="Target" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeDasharray="3 3" />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                  {lang === 'ta' ? 'தரவு இல்லை' : 'No data available'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Plant Details */}
        {selectedPlantData && (
          <div className="bg-gradient-to-r from-emerald-900/40 to-slate-800/80 border border-emerald-800/30 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" />
              {t.plantDetails}
            </h3>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-white mb-2">
                  {lang === 'ta' ? selectedPlantData.nameTa : selectedPlantData.nameEn}
                </h4>
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/50 rounded-full text-xs font-medium text-slate-300 border border-slate-700">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    {lang === 'ta' ? selectedPlantData.waterReqTa : selectedPlantData.waterReqEn}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/50 rounded-full text-xs font-medium text-slate-300 border border-slate-700">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    {lang === 'ta' ? selectedPlantData.seasonTa : selectedPlantData.seasonEn}
                  </span>
                  {selectedPlantData.phMin && selectedPlantData.phMax && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/50 rounded-full text-xs font-medium text-slate-300 border border-slate-700">
                      <Beaker className="w-3 h-3 text-purple-400" />
                      pH: {selectedPlantData.phMin} - {selectedPlantData.phMax}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fertilizer Calculator */}
        <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
          <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            {t.fertilizerCalc}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-slate-400 mb-1">Urea (46% N)</span>
              <span className="text-2xl font-bold text-white mb-1">{fertilizer.ureaBags} {t.bags}</span>
              <span className="text-xs text-slate-500">({fertilizer.ureaKg} kg)</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-slate-400 mb-1">DAP (18% Nitrogen, 46% Phosphorus)</span>
              <span className="text-2xl font-bold text-white mb-1">{fertilizer.dapBags} {t.bags}</span>
              <span className="text-xs text-slate-500">({fertilizer.dapKg} kg)</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-slate-400 mb-1">MOP (60% K)</span>
              <span className="text-2xl font-bold text-white mb-1">{fertilizer.mopBags} {t.bags}</span>
              <span className="text-xs text-slate-500">({fertilizer.mopKg} kg)</span>
            </div>
          </div>
        </div>

        {/* Micronutrient Status */}
        {Object.keys(micronutrientStatus).length > 0 && (
          <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">{t.micronutrients} Status</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(micronutrientStatus).map(([key, data]) => (
                <div key={key} className="px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/50 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase">{key}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color || '#94a3b8' }}></div>
                  <span className="text-xs font-medium text-white">{data.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorized Recommendations */}
        <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
          <h3 className="text-lg font-bold text-slate-300 mb-6">{t.topRecommended}</h3>
          
          <div className="space-y-6">
            {/* Crops */}
            {topCrops.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2 border-b border-slate-700/50 pb-2">
                  <Wheat className="w-4 h-4" /> {t.crops}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topCrops.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                      <span className="text-sm font-medium text-slate-200">{lang === 'ta' ? item.nameTa : item.nameEn}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {Math.round(item.suitabilityScore || item.score || 85)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vegetables */}
            {topVegetables.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2 border-b border-slate-700/50 pb-2">
                  <Sprout className="w-4 h-4" /> {t.vegetables}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topVegetables.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                      <span className="text-sm font-medium text-slate-200">{lang === 'ta' ? item.nameTa : item.nameEn}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {Math.round(item.suitabilityScore || item.score || 85)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fruits */}
            {topFruits.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2 border-b border-slate-700/50 pb-2">
                  <Apple className="w-4 h-4" /> {t.fruits}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topFruits.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                      <span className="text-sm font-medium text-slate-200">{lang === 'ta' ? item.nameTa : item.nameEn}</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {Math.round(item.suitabilityScore || item.score || 85)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* GENERATE REPORT ACTION */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => setActiveTab('report-agri')}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-6 py-4 rounded-2xl shadow-xl shadow-amber-900/20 transition-all duration-300 group"
        >
          <HelpCircle className="w-5 h-5 hidden" />
          <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ அறிக்கை உருவாக்கு' : 'Generate Official PDF Report'}</span>
          <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
