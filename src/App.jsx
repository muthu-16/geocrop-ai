import React, { useState, useMemo } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { LocationPicker } from './components/LocationPicker';
import { GeotechnicalModule } from './components/GeotechnicalModule';
import { AgricultureModule } from './components/AgricultureModule';
import { PDFReportGenerator } from './components/PDFReportGenerator';
import { DashboardModule } from './components/DashboardModule';
import { AIChatbot } from './components/AIChatbot';
import { AuthModal } from './components/auth/AuthModal';
import { calculateGeotechnicalProperties, SOIL_TYPES } from './engine/geotechnicalEngine';
import { calculateAgriculturalPlan } from './engine/agricultureEngine';
import { Shield } from 'lucide-react';

function MainApp() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null); // auth state

  // Location State
  const [location, setLocation] = useState({
    address: 'Detecting Live Location...',
    city: 'Detecting...',
    district: '',
    state: '',
    country: '',
    lat: 10.7870,
    lng: 79.1378,
    accuracy: 0,
    zone: 'cauvery_delta',
    isLive: false
  });

  // ===== 17-PARAMETER GEOTECHNICAL STATE =====
  const [geoInputs, setGeoInputs] = useState({
    // Physical & Geotechnical (9 params)
    gs: '2.70',
    sandPct: '40',
    siltPct: '30',
    clayPct: '30',
    bulkDensity: '1.80',
    porosity: '35',
    moistureContent: '18',
    permeability: '0.001',
    cohesion: '25',
    frictionAngle: '28',
    liquidLimit: '45',
    plasticLimit: '22',
    coeffConsolidation: '0.50',
    // Chemical (4 params)
    soilPH: '7.0',
    soilEC: '0.5',
    soilCEC: '20',
    organicCarbon: '0.6',
    // Biological (3 params)
    microbialBiomass: '250',
    soilRespiration: '15',
    enzymeActivity: '30',
    // Legacy & Custom Building Target
    soilType: 'alluvial',
    depth: '1.5',
    waterTable: '3.0',
    sptN: '18',
    desiredFloors: ''
  });

  // ===== AGRICULTURE STATE =====
  const [agriInputs, setAgriInputs] = useState({
    nitrogen: '85',
    phosphorus: '30',
    potassium: '45',
    soilPH: '7.0',
    soilEC: '0.5',
    soilCEC: '20',
    organicCarbon: '0.6',
    soilMoisture: '18',
    soilType: 'alluvial',
    targetPlant: 'paddy',
    plantCategory: 'crop',
    // Micronutrients (mg/kg)
    ironFe: '8.0',
    zincZn: '1.5',
    manganeseMn: '5.0',
    copperCu: '1.2',
    boronB: '0.8',
    zone: 'cauvery_delta'
  });

  // Sync pH, EC, CEC, OC between Geo & Agri when Geo changes
  const syncChemicalParams = (name, value) => {
    const syncKeys = ['soilPH', 'soilEC', 'soilCEC', 'organicCarbon'];
    if (syncKeys.includes(name)) {
      setAgriInputs(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'moistureContent') {
      setAgriInputs(prev => ({ ...prev, soilMoisture: value }));
    }
  };

  const handleGeoInputChange = (e) => {
    const { name, value } = e.target;
    setGeoInputs(prev => ({ ...prev, [name]: value }));
    syncChemicalParams(name, value);
  };

  const handleZoneChange = (newZone) => {
    setAgriInputs(prev => ({ ...prev, zone: newZone }));
  };

  // Computations
  const geoResults = useMemo(() => {
    return calculateGeotechnicalProperties(geoInputs);
  }, [geoInputs]);

  const agriResults = useMemo(() => {
    return calculateAgriculturalPlan({
      ...agriInputs,
      micronutrients: {
        fe: parseFloat(agriInputs.ironFe) || 0,
        zn: parseFloat(agriInputs.zincZn) || 0,
        mn: parseFloat(agriInputs.manganeseMn) || 0,
        cu: parseFloat(agriInputs.copperCu) || 0,
        b: parseFloat(agriInputs.boronB) || 0
      }
    });
  }, [agriInputs]);

  if (!currentUser) {
    return <AuthModal onAuthSuccess={(data) => setCurrentUser(data.user || data)} />;
  }

  return (
    <div className="min-h-screen bg-[#0b1118] text-slate-100 font-sans selection:bg-geo-500 selection:text-white pb-24">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {activeTab !== 'dashboard' && (
          <LocationPicker
            location={location}
            setLocation={setLocation}
            onZoneChange={handleZoneChange}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardModule
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            location={location}
          />
        )}

        {activeTab === 'geo' && (
          <GeotechnicalModule
            geoInputs={geoInputs}
            setGeoInputs={setGeoInputs}
            handleInputChange={handleGeoInputChange}
            geoResults={geoResults}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'agri' && (
          <AgricultureModule
            agriInputs={agriInputs}
            setAgriInputs={setAgriInputs}
            agriResults={agriResults}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab.startsWith('report') && (
          <PDFReportGenerator
            geoState={geoInputs}
            geoResults={geoResults}
            agriState={agriInputs}
            agriResults={agriResults}
            location={location}
            defaultMode={activeTab}
          />
        )}
      </main>

      <AIChatbot
        geoState={geoResults}
        agriState={agriResults}
        setGeoInputs={setGeoInputs}
        setAgriInputs={setAgriInputs}
        setActiveTab={setActiveTab}
      />

      <footer className="border-t border-slate-800/80 bg-[#070b10] py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Shield className="w-4 h-4 text-geo-400" />
          <span>GeoCrop AI v2.0 Platform • 17-Parameter Civil Geotechnical & Precision Agriculture Intelligence</span>
        </div>
        <p>{t('disclaimer')}</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
