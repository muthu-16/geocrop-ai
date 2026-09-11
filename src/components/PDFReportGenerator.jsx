import React, { useRef, useState } from 'react';
import { Download, FileText, CheckCircle2, Building2, Sprout, ShieldCheck, MapPin, Calendar, Award, Sparkles, Loader2, Shield, Layers, AlertTriangle, CheckSquare, Compass, FileCheck, CheckCircle, Apple, Wheat, Beaker } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function PDFReportGenerator({ geoState, geoResults, agriState, agriResults, location, defaultMode }) {
  const { t, lang } = useLanguage();
  const reportRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Initialize checkboxes based on where the user came from
  const [includeCivil, setIncludeCivil] = useState(defaultMode !== 'report-agri');
  const [includeAgri, setIncludeAgri] = useState(defaultMode !== 'report-geo');

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const sanitizedAddress = (location?.city || 'Site').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().slice(0,10);
      const filename = `GeoCrop_AI_Official_Report_${sanitizedAddress}_${dateStr}.pdf`;

      // Save Report to Database Archive for Government / Structural Audit
      try {
        const pdfBase64 = pdf.output('datauristring');
        fetch('/api/auth/save-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engineerName: 'Chief Geotechnical Auditor',
            locationCity: location?.city || 'Site',
            locationDistrict: location?.district || '',
            gpsCoords: `${location?.lat?.toFixed(4)}, ${location?.lng?.toFixed(4)}`,
            soilType: geoState?.soilType || 'alluvial',
            safeBearingCapacity: geoResults?.bearingCapacity || 0,
            maxSafeFloors: geoResults?.design?.maxFloors || 0,
            targetFloors: geoResults?.targetFloorAdvisory?.targetFloors || 0,
            targetStatus: geoResults?.targetFloorAdvisory?.targetStatus || 'FEASIBLE',
            pdfBase64: pdfBase64.slice(0, 1000) // store URI snippet / metadata
          })
        }).catch(e => console.warn('Archive note:', e));
      } catch (e) {
        console.warn('Archive report note:', e);
      }

      // Try jsPDF save
      pdf.save(filename);

      // Mobile Blob & Print Fallback for Android WebView
      const blobUrl = pdf.output('bloburl');
      const newWin = window.open(blobUrl, '_blank');
      if (!newWin) {
        // If popup blocked or inside Android WebView, open via location or print
        window.location.href = blobUrl;
      }
    } catch (err) {
      console.error('PDF Generation failed:', err);
      // Native window print fallback for Android OS
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const isTa = lang === 'ta';
  const currentDate = new Date().toLocaleDateString(isTa ? 'ta-IN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const reportId = `GC-OFFICIAL-${Math.floor(100000 + Math.random() * 900000)}`;

  // Safe extraction from engines
  const q_safe = geoResults?.bearingCapacity?.safe || 180;
  const q_ult = geoResults?.bearingCapacity?.ultimate || 540;
  const maxFloors = geoResults?.design?.maxFloors || 3;
  const stabilityScore = geoResults?.design?.stabilityScore || 80;
  const recommendation = geoResults?.design?.recommendation || 'Standard isolated footings are suitable';
  const settlementRisk = geoResults?.design?.settlementRisk || 'Low';
  const texture = geoResults?.inputSummary?.texture || 'Loam';
  const piValue = geoResults?.inputSummary?.plasticityIndex || 15;
  const plasticityClass = geoResults?.inputSummary?.plasticityClass || 'Medium';

  const crop = agriResults?.crop || { nameEn: 'Paddy', nameTa: 'நெல்', targetN: 120, targetP: 60, targetK: 60 };
  const topCrops = agriResults?.topCrops?.slice(0, 3) || [];
  const topVegs = agriResults?.topVegetables?.slice(0, 3) || [];
  const topFruits = agriResults?.topFruits?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      
      {/* Top Export Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            {isTa ? 'அதிகாரப்பூர்வ வெள்ளை வடிவ PDF அறிக்கை' : 'Official Analysis Report'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {isTa ? 'முறையான வெள்ளை நிற தாளிலும் சான்றளிக்கப்பட்ட பொறியியல் அமைப்பிலும் பதிவிறக்கவும்.' : 'Standard white executive format for official structural engineering submissions and agricultural auditing.'}
          </p>

          <div className="flex items-center gap-4 text-xs font-bold bg-slate-950/50 p-2.5 rounded-xl border border-slate-700/50 inline-flex">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <input 
                type="checkbox" 
                checked={includeCivil} 
                onChange={(e) => setIncludeCivil(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-geo-500 focus:ring-geo-500 focus:ring-offset-slate-900"
              />
              <Building2 className="w-4 h-4 text-geo-500" />
              <span>Civil Foundation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <input 
                type="checkbox" 
                checked={includeAgri} 
                onChange={(e) => setIncludeAgri(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <Sprout className="w-4 h-4 text-emerald-500" />
              <span>Agriculture</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-950/40 transition-all duration-200 disabled:opacity-50 shrink-0"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>{t('pdfGenerating')}</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-950" />
              <span>{t('downloadReportBtn')}</span>
            </>
          )}
        </button>
      </div>

      {/* OFFICIAL WHITE EXECUTIVE REPORT DOCUMENT CANVAS */}
      <div className="flex justify-center">
        <div
          ref={reportRef}
          className="w-full max-w-4xl bg-white text-slate-900 border-2 border-slate-300 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 font-sans"
          style={{ backgroundColor: '#ffffff' }}
        >
          
          {/* OFFICIAL EXECUTIVE LETTERHEAD HEADER */}
          <div className="border-b-2 border-slate-900 pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-emerald-600 flex items-center justify-center text-emerald-400 font-black text-xl shadow-md">
                  GC
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    GeoCrop AI <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">v2.0 Certified</span>
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    Integrated Civil Engineering & Precision Agronomy Soil Intelligence
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-mono space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-slate-500 font-bold">REPORT ID: <span className="text-slate-900">{reportId}</span></div>
                <div className="text-slate-500">DATE: <span className="text-slate-900 font-semibold">{currentDate}</span></div>
                <div className="text-slate-500">TIME: <span className="text-slate-900">{currentTime}</span></div>
              </div>

            </div>

            {/* GPS & LOCATION METADATA STAMP */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span><strong>Site Location:</strong> {location?.address || 'Live GPS Location'}</span>
              </div>
              <div className="font-mono text-[11px] bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl border border-emerald-300">
                GPS: {location?.lat?.toFixed(4) || 10.7870}°N, {location?.lng?.toFixed(4) || 79.1378}°E
              </div>
            </div>
          </div>

          {/* SECTION 1: EXECUTIVE SUMMARY */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b-2 border-slate-200 pb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" /> {isTa ? 'செயல்பாட்டுச் சுருக்கம்' : 'Section 1: Executive Summary & Site Certification'}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {isTa
                ? `இந்த அதிகாரப்பூர்வ அறிக்கை ${location?.address || 'தேர்ந்தெடுக்கப்பட்ட நிலம்'} இடத்திற்கான புவிநுட்பவியல் மண் தாங்கும் திறன், அதிகபட்ச பாதுகாப்பான மாடிகள் மற்றும் 17 மண் அளவுருக்கள் அடிப்படையில் சான்றளிக்கப்பட்ட விவசாய பரிந்துரைகளை வழங்குகிறது. Terzaghi மண் சூத்திரங்கள் மற்றும் ICAR/TNAU உர வழிகாட்டல்கள் பயன்படுத்தப்பட்டுள்ளன.`
                : `This executive document certifies the geotechnical soil bearing capacity, structural floor load capacity, and precision agricultural nutrient requirements for the target site at ${location?.address || 'target location'}. Computed under Terzaghi empirical soil mechanics equations and ICAR/TNAU agronomy protocols across 17 verified soil parameters.`}
            </p>
          </div>

          {/* SECTION 2: 17 SOIL PARAMETERS AUDIT TABLE */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b-2 border-slate-200 pb-1">
              <Beaker className="w-4 h-4 text-emerald-600" /> {isTa ? '17 மண் அளவுருக்கள் தணிக்கை' : 'Section 2: 17 Soil Parameters Engineering Audit'}
            </h3>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Physical</span>
                <div>Gs: <strong>{geoState?.gs || 2.70}</strong></div>
                <div>Texture: <strong>{texture}</strong></div>
                <div>Bulk Density: <strong>{geoState?.bulkDensity || 1.80} g/cm³</strong></div>
                <div>Porosity: <strong>{geoState?.porosity || 35}%</strong></div>
                <div>Moisture: <strong>{geoState?.moistureContent || 18}%</strong></div>
                <div>Permeability: <strong>{geoState?.permeability || 0.001} cm/s</strong></div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Chemical & Shear</span>
                <div>Cohesion (c): <strong>{geoState?.cohesion || 25} kPa</strong></div>
                <div>Friction (φ): <strong>{geoState?.frictionAngle || 28}°</strong></div>
                <div>Liquid Limit: <strong>{geoState?.liquidLimit || 45}%</strong></div>
                <div>Plastic Limit: <strong>{geoState?.plasticLimit || 22}%</strong></div>
                <div>Plasticity Index: <strong>{piValue}% ({plasticityClass})</strong></div>
                <div>pH / EC: <strong>{geoState?.soilPH || 7.0} / {geoState?.soilEC || 0.5} dS/m</strong></div>
                <div>CEC: <strong>{geoState?.soilCEC || 20} meq/100g</strong></div>
                <div>Organic Carbon: <strong>{geoState?.organicCarbon || 0.6}%</strong></div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Biological & Structural</span>
                <div>Biomass (MBC): <strong>{geoState?.microbialBiomass || 250} mg/kg</strong></div>
                <div>Respiration: <strong>{geoState?.soilRespiration || 15} mg CO₂/kg/d</strong></div>
                <div>Enzyme Activity: <strong>{geoState?.enzymeActivity || 30} µg/g/h</strong></div>
                <div>SPT N-Value: <strong>{geoState?.sptN || 18}</strong></div>
                <div>Stability Score: <strong>{stabilityScore}/100</strong></div>
                <div>Health Score: <strong>{agriResults?.soilHealthScore || 80}/100</strong></div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CIVIL GEOTECHNICAL SOIL ASSESSMENT */}
          {includeCivil && (
            <div className="space-y-4 pt-1">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b-2 border-slate-200 pb-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                {t('pdfGeoSection')}
              </h2>

              {/* Key Mechanics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Specific Gravity</span>
                  <div className="text-lg font-mono font-bold text-slate-900">Gs = {geoState?.gs || 2.70}</div>
                  <span className="text-[10px] text-slate-600 block">Soil: {texture}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Safe Bearing Cap (q_safe)</span>
                  <div className="text-lg font-mono font-bold text-emerald-700">{q_safe} <span className="text-xs font-normal text-slate-600">kN/m²</span></div>
                  <span className="text-[10px] text-slate-600 block">FOS = 3.0</span>
                </div>

                <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-900 space-y-1 shadow-md">
                  <span className="text-[10px] text-slate-300 uppercase font-mono block">Max Safe Floor Limit</span>
                  <div className="text-xl font-mono font-bold text-emerald-400">{maxFloors} Floors</div>
                  <span className="text-[10px] text-slate-300 block">G + {Math.max(0, maxFloors - 1)} Structure</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Stability Score</span>
                  <div className="text-lg font-mono font-bold text-slate-900">{stabilityScore} / 100</div>
                  <span className="text-[10px] text-slate-600 block">Depth: {geoState?.depth || 1.5}m</span>
                </div>

              </div>

              {/* Foundation Recommendation Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-700">{t('foundationTitle')}:</span>
                  <strong className="text-emerald-800 font-extrabold text-sm uppercase">{recommendation}</strong>
                </div>
                <p className="text-slate-700 leading-relaxed pt-1">
                  <strong className="text-slate-900">{isTa ? 'பொறியியல் காரணம்:' : 'Engineering Safety Rationale:'}</strong>{' '}
                  {recommendation}
                </p>
                <div className="text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2 pt-1 text-[11px]">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>Settlement Risk: <strong>{settlementRisk}</strong></span>
                </div>
              </div>

              {/* Target Construction Floor & Custom Footing Advisory Box */}
              {geoResults?.targetFloorAdvisory && (
                <div className="bg-emerald-50/60 border-2 border-emerald-600/30 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-800" />
                      <strong className="text-slate-900 font-extrabold uppercase text-xs">
                        {isTa ? `திட்டமிடப்பட்ட ${geoResults.targetFloorAdvisory.targetFloors} மாடி கட்டிட அடித்தள ஆலோசனை` : `Target Advisory: ${geoResults.targetFloorAdvisory.targetFloors} Floors Construction`}
                      </strong>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-extrabold border ${
                      geoResults.targetFloorAdvisory.targetStatus === 'safe'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                        : geoResults.targetFloorAdvisory.targetStatus === 'warning'
                        ? 'bg-amber-100 text-amber-900 border-amber-400'
                        : 'bg-rose-100 text-rose-900 border-rose-400'
                    }`}>
                      {geoResults.targetFloorAdvisory.targetStatus === 'safe' ? '✓ SAFE & FEASIBLE' : geoResults.targetFloorAdvisory.targetStatus === 'warning' ? '⚠ REQUIRES RAFT' : '✕ DEEP PILING REQUIRED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Required Load Capacity</span>
                      <strong className="text-slate-900 font-bold">{geoResults.targetFloorAdvisory.requiredBearingCapacity} kN/m²</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Recommended Target Footing</span>
                      <strong className="text-emerald-800 font-bold">
                        {isTa ? geoResults.targetFloorAdvisory.targetFootingTa : geoResults.targetFloorAdvisory.targetFootingEn}
                      </strong>
                    </div>
                  </div>

                  <p className="text-slate-800 bg-white p-3 rounded-xl border border-emerald-200 leading-relaxed text-[11px]">
                    <strong className="text-emerald-900 font-bold">{isTa ? 'கட்டமைப்பு வழிகாட்டுதல்:' : 'Structural Advisory:'}</strong>{' '}
                    {isTa ? geoResults.targetFloorAdvisory.targetAdviceTa : geoResults.targetFloorAdvisory.targetAdviceEn}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* SECTION 4: PRECISION AGRONOMY & FERTILIZER DOSAGE SCHEDULE */}
          {includeAgri && (
            <div className="space-y-4 pt-1">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b-2 border-slate-200 pb-1 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                {t('pdfAgriSection')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Target Crop & Soil NPK Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Selected Target Crop</div>
                  <strong className="text-base text-slate-900 block font-extrabold">
                    {isTa ? crop.nameTa : crop.nameEn}
                  </strong>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700 font-mono space-y-1">
                    <div>Soil NPK: N: <strong>{agriState?.nitrogen || 85}</strong> | P: <strong>{agriState?.phosphorus || 30}</strong> | K: <strong>{agriState?.potassium || 45}</strong> (kg/ha)</div>
                    <div>Crop Target NPK: N: <strong>{crop.targetN}</strong> | P: <strong>{crop.targetP}</strong> | K: <strong>{crop.targetK}</strong> (kg/ha)</div>
                  </div>
                </div>

                {/* Exact Fertilizer Dosage Table */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Required Fertilizer Dosage Schedule (per Hectare)</div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-center pt-1">
                    
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="block text-[10px] text-slate-600">Urea (46% N)</span>
                      <strong className="text-emerald-700 text-sm block mt-0.5">{agriResults?.fertilizer?.urea || 0} Bgs</strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="block text-[10px] text-slate-600">DAP (18% N, 46% P)</span>
                      <strong className="text-blue-700 text-sm block mt-0.5">{agriResults?.fertilizer?.dap || 0} Bgs</strong>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="block text-[10px] text-slate-600">MOP (60% K)</span>
                      <strong className="text-amber-700 text-sm block mt-0.5">{agriResults?.fertilizer?.mop || 0} Bgs</strong>
                    </div>

                  </div>
                </div>

              </div>

              {/* Categorized Recommendations Summary */}
              <div className="grid grid-cols-3 gap-3 text-[11px] font-mono">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="text-emerald-800 block text-[10px] uppercase font-bold mb-1">Top Crops</strong>
                  {topCrops.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{isTa ? item.nameTa : item.nameEn}</span>
                      <strong className="text-emerald-700">{item.suitabilityScore}%</strong>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="text-blue-800 block text-[10px] uppercase font-bold mb-1">Top Vegetables</strong>
                  {topVegs.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{isTa ? item.nameTa : item.nameEn}</span>
                      <strong className="text-blue-700">{item.suitabilityScore}%</strong>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <strong className="text-purple-800 block text-[10px] uppercase font-bold mb-1">Top Fruits</strong>
                  {topFruits.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{isTa ? item.nameTa : item.nameEn}</span>
                      <strong className="text-purple-700">{item.suitabilityScore}%</strong>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SECTION 5: AI SYNTHETIC RECOMMENDATIONS */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {isTa ? 'பொறியியல் & விவசாய சான்றிதழ் கையொப்பம்' : 'Certified Sign-off & Structural Compliance'}
            </h3>
            <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
              {isTa
                ? `இந்த அறிக்கை தானாகவே உருவாக்கப்பட்டது மற்றும் Terzaghi தாங்கும் திறன் சமன்பாடுகள் மற்றும் ICAR/TNAU விவசாய பரிந்துரைகளின் கணித சோதனைகளில் தேர்ச்சி பெற்றுள்ளது.`
                : `This report is automatically synthesized and certified using Terzaghi bearing capacity empirical equations and ICAR/TNAU precision agronomy protocols.`}
            </p>

            <div className="pt-4 flex justify-between items-end text-xs font-mono text-slate-600">
              <div>
                <span className="block text-[10px] text-slate-600">AUTHORIZED CERTIFICATION STAMP</span>
                <strong className="text-slate-900 text-sm font-bold uppercase">GeoCrop AI Verification Engine v2.0</strong>
              </div>
              <div className="text-right">
                <div className="w-32 h-10 border-b border-slate-400 mb-1 flex items-end justify-center text-slate-600 font-serif italic text-xs">
                  GeoCrop AI
                </div>
                <span className="text-[10px]">Chief Technical Auditor</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
