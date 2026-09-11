import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Locate, CheckCircle2, AlertCircle, Loader2, Search, Building } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Infer regional soil zone based on state/district name or coordinates
 */
function inferSoilZone(address, lat, lng) {
  const text = JSON.stringify(address || {}).toLowerCase();
  
  if (text.includes('thanjavur') || text.includes('tiruvarur') || text.includes('nagapattinam') || text.includes('mayiladuthurai')) {
    return 'cauvery_delta';
  }
  if (text.includes('coimbatore') || text.includes('tiruppur') || text.includes('virudhunagar') || text.includes('madurai')) {
    return 'black_cotton';
  }
  if (text.includes('salem') || text.includes('namakkal') || text.includes('trichy') || text.includes('tiruchirappalli') || text.includes('dindigul')) {
    return 'red_soil';
  }
  if (text.includes('cuddalore') || text.includes('kanyakumari') || text.includes('ramanathapuram') || text.includes('chennai') || text.includes('kancheepuram')) {
    return 'laterite';
  }
  if (text.includes('nilgiris') || text.includes('kodaikanal') || text.includes('ooty') || text.includes('yercaud')) {
    return 'hilly';
  }

  // Default coordinate based approximation for South India if reverse geocode text doesn't match
  if (lat > 11.2 && lat < 11.8 && lng > 78.0 && lng < 78.8) return 'red_soil';
  if (lat > 10.5 && lat < 11.2 && lng > 79.0) return 'cauvery_delta';
  if (lat > 10.5 && lat < 11.5 && lng < 77.5) return 'black_cotton';
  
  return 'red_soil';
}

export function LocationPicker({ location, setLocation, onZoneChange }) {
  const { t, lang } = useLanguage();
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [manualQuery, setManualQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Automatically detect live location on initial load
  useEffect(() => {
    detectLiveLocation();
  }, []);

  // Fetch precise live location via HTML5 Geolocation + OpenStreetMap Reverse Geocoding
  const detectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(lang === 'ta' ? 'உங்கள் உலாவி ஜிபிஎஸ் இருப்பிடத்தை ஆதரிக்கவில்லை.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          // Reverse geocode to get exact city, district, village, and state
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
            { headers: { 'User-Agent': 'GeoCropAI/1.1' } }
          );
          
          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            
            const cityOrTown = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Local Area';
            const district = addr.state_district || addr.county || addr.district || '';
            const state = addr.state || '';
            const country = addr.country || '';

            const displayNameEn = `${cityOrTown}${district ? ', ' + district : ''}${state ? ', ' + state : ''}`;
            const displayNameTa = `${cityOrTown}${district ? ', ' + district : ''}${state ? ', ' + state : ''}`;
            const inferredZone = inferSoilZone(addr, latitude, longitude);

            const newLocation = {
              address: displayNameEn,
              city: cityOrTown,
              district: district,
              state: state,
              country: country,
              lat: latitude,
              lng: longitude,
              accuracy: Math.round(accuracy),
              zone: inferredZone,
              isLive: true
            };

            setLocation(newLocation);
            if (onZoneChange) onZoneChange(inferredZone);
          } else {
            throw new Error('Reverse geocoding failed');
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
          // Fallback to exact GPS coordinates
          const inferredZone = inferSoilZone({}, latitude, longitude);
          const fallbackLocation = {
            address: `GPS Coordinates (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`,
            city: 'Live GPS Location',
            district: 'Detected GPS',
            state: '',
            country: '',
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy),
            zone: inferredZone,
            isLive: true
          };
          setLocation(fallbackLocation);
          if (onZoneChange) onZoneChange(inferredZone);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoError(
          lang === 'ta'
            ? 'ஜிபிஎஸ் அனுமதி பெறப்படவில்லை. உங்கள் இருப்பிடத்தை தேடவும் அல்லது கைமுறையாக குறிப்பிடவும்.'
            : 'Live GPS access denied or timed out. Please enter your location or search below.'
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Handle manual city / address search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    setIsSearching(true);
    setGeoError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualQuery)}&limit=1`,
        { headers: { 'User-Agent': 'GeoCropAI/1.1' } }
      );

      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          const item = results[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const name = item.display_name;
          const inferredZone = inferSoilZone({ display_name: name }, lat, lng);

          const searchLocation = {
            address: name,
            city: item.name || manualQuery,
            district: manualQuery,
            state: '',
            country: '',
            lat: lat,
            lng: lng,
            accuracy: 0,
            zone: inferredZone,
            isLive: false
          };

          setLocation(searchLocation);
          if (onZoneChange) onZoneChange(inferredZone);
          setManualQuery('');
        } else {
          setGeoError(lang === 'ta' ? 'இருப்பிடம் கிடைக்கவில்லை. சரியான ஊர் பெயரை உள்ளிடவும்.' : 'Location not found. Please enter a valid city or district.');
        }
      }
    } catch (err) {
      setGeoError(lang === 'ta' ? 'தேடல் பிழை ஏற்பட்டது.' : 'Search error occurred. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-[#16202c]/95 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl mb-6 space-y-5">
      
      {/* Top Header & Live Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border transition-all ${
            location.isLive 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
              : 'bg-geo-500/20 text-geo-400 border-geo-500/30'
          }`}>
            <MapPin className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                {t('locationStamp')}
              </h2>

              {location.isLive ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Exact GPS Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  Custom Location
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-geo-300 mt-1">
              {location.address}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Lat: <strong className="text-slate-200">{location.lat.toFixed(5)}° N</strong> | Lng: <strong className="text-slate-200">{location.lng.toFixed(5)}° E</strong> {location.accuracy ? `| Accuracy: ±${location.accuracy}m` : ''} | Zone: <strong className="text-emerald-400 capitalize">{location.zone.replace('_', ' ')}</strong>
            </p>
          </div>
        </div>

        {/* Live GPS Re-detect Button */}
        <button
          onClick={detectLiveLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-geo-600 hover:from-emerald-500 hover:to-geo-500 text-white shadow-xl shadow-emerald-950/40 border border-emerald-400/30 transition-all duration-200 disabled:opacity-50 shrink-0"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>{lang === 'ta' ? 'துல்லிய இருப்பிடம் கண்டறியப்படுகிறது...' : 'Detecting Live GPS...'}</span>
            </>
          ) : (
            <>
              <Locate className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>{lang === 'ta' ? 'என் நேரலை இருப்பிடத்தைப் பெறுக' : 'Detect My Exact Live GPS'}</span>
            </>
          )}
        </button>

      </div>

      {geoError && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Manual Search Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={manualQuery}
            onChange={(e) => setManualQuery(e.target.value)}
            placeholder={lang === 'ta' ? 'அல்லது உங்கள் நகரம், மாவட்டம் அல்லது ஊர் பெயரை உள்ளிட்டுத் தேடவும்...' : 'Or enter any city, town, district, or address to search...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-geo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'ta' ? 'தேடுக' : 'Search Location')}
        </button>
      </form>

    </div>
  );
}
