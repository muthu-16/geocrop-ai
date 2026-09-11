import React from 'react';
import { Building2, ShieldCheck, AlertTriangle, Layers, Sparkles, Layers2, Mountain, HelpCircle, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SOIL_TYPES_GEO } from '../engine/geotechnicalEngine';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function GeotechnicalModule({ geoInputs, setGeoInputs, handleInputChange, geoResults, setActiveTab }) {
  const { t, lang } = useLanguage();
  const isTa = lang === 'ta';

  const maxFloors = geoResults?.maxFloors || geoResults?.design?.maxFloors || 1;
  const bearingCapacity = geoResults?.bearingCapacity || 180;
  const stabilityScore = geoResults?.stabilityScore || 80;
  const foundationKey = geoResults?.foundationTypeKey || 'fndIsolated';

  const getFoundationTitle = (key) => {
    return t(key) || key;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-geo-950 via-slate-900 to-slate-900 border border-geo-800/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-geo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-geo-500/20 text-geo-300 border border-geo-500/30 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" /> Civil & Geotechnical Structural Engineering
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('geoHeaderTitle')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {t('geoHeaderSub')}
          </p>
        </div>
      </div>

      {/* HERO ANIMATED BUILDING SIMULATOR & HIGHLIGHT SLIDE */}
      <div className="bg-gradient-to-br from-[#121c27] via-[#162232] to-[#0d1620] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ring-1 ring-emerald-500/20">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left info badge */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Terzaghi Safety Simulation
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {isTa ? 'பாதுகாப்பான கட்டிட மாடி வரம்பு' : 'Maximum Safe Structural Capacity'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isTa
                ? `உங்கள் நிலத்தின் Gs = ${geoInputs.gs || 2.70}, தாங்கும் திறன் = ${bearingCapacity} kN/m² அடிப்படையில் கணக்கிடப்பட்ட மாடிகள்.`
                : `Simulated based on your soil Gs = ${geoInputs.gs || 2.70}, Safe Bearing Capacity = ${bearingCapacity} kN/m², and water table level.`}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="bg-slate-900/80 border border-emerald-500/40 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase font-mono block font-bold">Max Safe Floors</span>
                <span className="text-3xl font-black text-emerald-400 font-mono">{maxFloors} Floors</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">(G + {Math.max(0, maxFloors - 1)} Building)</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl">
                <span className="text-xs text-slate-400 font-mono block font-bold">Bearing Capacity (q_safe)</span>
                <span className="text-2xl font-black text-white font-mono">{bearingCapacity} <span className="text-xs font-normal text-slate-400">kN/m²</span></span>
                <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">FOS = 3.0 Verified</span>
              </div>
            </div>
          </div>

          {/* Right Building Visualizer */}
          <div className="lg:col-span-7 flex flex-col items-center justify-end bg-slate-950/70 border border-slate-800 rounded-3xl p-6 relative min-h-[300px]">
            <div className="w-full text-center text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider font-bold">
              Structural Floor Elevation View
            </div>

            {/* Vertical Floor Stack */}
            <div className="w-full max-w-md flex flex-col-reverse items-center gap-1.5 py-2">
              {Array.from({ length: Math.min(maxFloors, 12) }).map((_, idx) => {
                const floorNum = idx + 1;
                const isTop = idx === Math.min(maxFloors, 12) - 1;
                const isGround = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between text-xs font-mono font-bold transition-all duration-300 ${
                      isTop
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/50 scale-[1.02] animate-pulse'
                        : isGround
                        ? 'bg-slate-800 text-slate-200 border-slate-600'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className={`w-4 h-4 ${isTop ? 'text-white' : 'text-emerald-400'}`} />
                      <span>{isGround ? 'Ground Floor (G)' : `Floor ${floorNum - 1} (G+${floorNum - 1})`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isTop ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-300' : 'bg-slate-800 text-emerald-400'}`}>
                        {isTop ? 'Max Safe Limit' : 'Safe Structural Load'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Foundation Sub-Base */}
              <div className="w-full py-3 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/50 rounded-2xl text-center text-xs font-mono font-bold text-amber-300 shadow-xl flex items-center justify-center gap-2 mt-1">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>FOUNDATION STRATUM: {t(foundationKey) || 'Isolated Pad Footing'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN INPUT & OUTPUT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT FORM PANEL (COL-SPAN-5) */}
        <div className="lg:col-span-5 bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Mountain className="text-amber-500 w-5 h-5" />
              {isTa ? 'மண் & அடித்தள அளவீடுகள்' : 'Geotechnical Soil Inputs'}
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2.5 py-1 rounded-full border border-slate-700">
              Civil Parameters
            </span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            
            {/* SOIL TYPE DROPDOWN */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">
                {isTa ? 'மண் வகை (Primary Soil Type)' : 'Primary Soil Type'}
              </label>
              <select
                name="soilType"
                value={geoInputs.soilType || 'alluvial'}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:border-emerald-500 transition"
              >
                {SOIL_TYPES_GEO.map((type) => (
                  <option key={type.id} value={type.id}>
                    {isTa ? type.nameTa : type.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Gravity (Gs) Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-slate-300">
                <label className="font-bold">{t('specificGravity')} (Gs)</label>
                <span className="font-mono text-emerald-400 font-bold text-sm bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                  {geoInputs.gs || 2.70}
                </span>
              </div>
              <input
                type="range"
                name="gs"
                min="1.50"
                max="3.20"
                step="0.01"
                value={geoInputs.gs || 2.70}
                onChange={handleInputChange}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Soil Texture Proportions (Sand, Silt, Clay %) */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">{t('soilTextureLabel')} (%)</label>
              <div className="grid grid-cols-3 gap-2 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Sand %</span>
                  <input
                    type="number"
                    name="sandPct"
                    min="0"
                    max="100"
                    value={geoInputs.sandPct || 40}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Silt %</span>
                  <input
                    type="number"
                    name="siltPct"
                    min="0"
                    max="100"
                    value={geoInputs.siltPct || 30}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Clay %</span>
                  <input
                    type="number"
                    name="clayPct"
                    min="0"
                    max="100"
                    value={geoInputs.clayPct || 30}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Bulk Density & Moisture */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Bulk Density (g/cm³)</label>
                <input
                  type="number"
                  name="bulkDensity"
                  min="1.0"
                  max="2.5"
                  step="0.01"
                  value={geoInputs.bulkDensity || 1.80}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Moisture Content (%)</label>
                <input
                  type="number"
                  name="moistureContent"
                  min="0"
                  max="100"
                  value={geoInputs.moistureContent || 18}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Cohesion (c) & Friction Angle (phi) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Cohesion c (kPa)</label>
                <input
                  type="number"
                  name="cohesion"
                  min="0"
                  max="200"
                  value={geoInputs.cohesion || 25}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">Friction Angle φ (°)</label>
                <input
                  type="number"
                  name="frictionAngle"
                  min="0"
                  max="50"
                  value={geoInputs.frictionAngle || 28}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Foundation Depth & Water Table */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">{t('foundationDepthLabel')} (m)</label>
                <input
                  type="number"
                  name="depth"
                  min="0.5"
                  max="10.0"
                  step="0.1"
                  value={geoInputs.depth || 1.5}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold block mb-1">{t('waterTableLabel')} (m)</label>
                <input
                  type="number"
                  name="waterTable"
                  min="0.0"
                  max="20.0"
                  step="0.1"
                  value={geoInputs.waterTable || 3.0}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* SPT N-Value & Desired Construction Floors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">{t('sptNValueLabel')} (N)</label>
                <input
                  type="number"
                  name="sptN"
                  min="2"
                  max="60"
                  value={geoInputs.sptN || 18}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-emerald-400 font-bold block mb-1">
                  {isTa ? 'கட்ட விரும்பும் மாடிகள்' : 'Desired Floors to Build'}
                </label>
                <input
                  type="number"
                  name="desiredFloors"
                  placeholder="e.g. 4"
                  min="1"
                  max="15"
                  value={geoInputs.desiredFloors}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-emerald-500/60 rounded-xl p-2.5 text-emerald-300 font-mono font-extrabold focus:outline-none focus:border-emerald-400 ring-1 ring-emerald-500/30"
                />
              </div>
            </div>

          </div>
        </div>

        {/* RESULTS & RECOMMENDATIONS PANEL (COL-SPAN-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Safe Bearing Capacity Card */}
            <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden group shadow-xl">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck size={100} />
              </div>
              <div className="text-slate-400 text-sm font-medium mb-2">{t('bearingCapacity') || 'Safe Bearing Capacity'}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight">{bearingCapacity}</span>
                <span className="text-emerald-400 font-bold">kN/m²</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20">
                <Sparkles size={14} /> FOS = 3.0 Terzaghi Computed
              </div>
            </div>

            {/* Soil Stability Score Card */}
            <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between shadow-xl">
              <div>
                <div className="text-slate-400 text-sm font-medium mb-3">Soil Stability Score</div>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" stroke="currentColor" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-emerald-400" strokeDasharray={`${stabilityScore}, 100`} stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute text-white font-black text-base font-mono">{stabilityScore}</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed font-sans">
                    Computed based on soil cohesion, friction angle, SPT N-value, and moisture content.
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Soil Texture Class:</span>
                <strong className="text-emerald-400 font-mono font-bold">{geoResults?.soilTexture || 'Loam'}</strong>
              </div>
            </div>

          </div>

          {/* TARGET FLOOR CUSTOM FOOTING ADVISORY CARD */}
          {geoResults?.targetFloorAdvisory && (
            <div className="bg-[#16202c]/90 border-2 border-emerald-500/40 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {isTa ? `திட்டமிடப்பட்ட ${geoResults.targetFloorAdvisory.targetFloors} மாடி கட்டிட அடித்தள ஆலோசனை` : `Target Advisory: ${geoResults.targetFloorAdvisory.targetFloors} Floors Construction`}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {isTa ? 'தேவைப்படும் தாங்கு திறன்:' : 'Required Capacity:'} {geoResults.targetFloorAdvisory.requiredBearingCapacity} kN/m²
                    </span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase ${
                  geoResults.targetFloorAdvisory.targetStatus === 'idle'
                    ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    : geoResults.targetFloorAdvisory.targetStatus === 'safe'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : geoResults.targetFloorAdvisory.targetStatus === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {geoResults.targetFloorAdvisory.targetStatus === 'idle' ? 'ℹ ENTER FLOORS' : geoResults.targetFloorAdvisory.targetStatus === 'safe' ? '✓ SAFE FEASIBLE' : geoResults.targetFloorAdvisory.targetStatus === 'warning' ? '⚠ REQUIRES RAFT' : '✕ DEEP PILING REQUIRED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium font-mono block mb-1">
                    {isTa ? 'பரிந்துரைக்கப்படும் அஸ்திவாரம்' : 'Suggested Footing Type for Target'}
                  </span>
                  <strong className="text-emerald-300 font-extrabold text-sm block">
                    {isTa ? geoResults.targetFloorAdvisory.targetFootingTa : geoResults.targetFloorAdvisory.targetFootingEn}
                  </strong>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    {isTa ? 'பாதுகாப்பு காரணி வரம்பு' : 'Structural Safety Ratio'}
                  </span>
                  <strong className="text-white font-mono font-bold text-base">
                    {geoResults.targetFloorAdvisory.capacityRatio}% {isTa ? 'தாங்கு திறன்' : 'Soil Capacity'}
                  </strong>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed">
                <strong className="text-emerald-400 font-bold">{isTa ? 'பொறியியல் வழிகாட்டுதல்:' : 'Structural Advisory:'}</strong>{' '}
                {isTa ? geoResults.targetFloorAdvisory.targetAdviceTa : geoResults.targetFloorAdvisory.targetAdviceEn}
              </p>
            </div>
          )}

          {/* FOUNDATION RECOMMENDATION CARD */}
          <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                <AlertTriangle className="text-amber-500" size={24} />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider block font-bold">{t('foundationTitle')}</span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t(foundationKey) || 'Isolated Column Footing'}
                </h3>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <strong className="text-white">{isTa ? 'பொறியியல் காரணம்:' : 'Engineering Safety Rationale:'}</strong>{' '}
              {isTa ? geoResults?.rationaleTa : geoResults?.rationaleEn}
            </p>

            <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{isTa ? geoResults?.settlementRiskTa : geoResults?.settlementRiskEn}</span>
            </div>
          </div>

          {/* BEARING CAPACITY VS DEPTH PROFILE CHART */}
          <div className="bg-[#16202c]/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <div className="text-slate-300 font-bold text-sm mb-4 flex items-center justify-between">
              <span>Bearing Capacity vs Depth Profile</span>
              <span className="text-xs font-mono text-slate-400">q_safe (kN/m²)</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={geoResults?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCapacity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="depth" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Area type="monotone" dataKey="bearingCapacity" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCapacity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* GENERATE REPORT ACTION */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => setActiveTab('report-geo')}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold px-6 py-4 rounded-2xl shadow-xl shadow-amber-900/20 transition-all duration-300 group"
        >
          <HelpCircle className="w-5 h-5 hidden" />
          <span>{isTa ? 'அதிகாரப்பூர்வ அறிக்கை உருவாக்கு' : 'Generate Official PDF Report'}</span>
          <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
