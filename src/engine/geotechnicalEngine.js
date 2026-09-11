import { predictSoil, predictFoundation, soilTextureCodeFromDensity } from './annModel.js';

export const SOIL_TYPES_GEO = [
  { id: 'alluvial', nameEn: 'Alluvial Soil (River Basin)', nameTa: 'வண்டல் மண்' },
  { id: 'black_cotton', nameEn: 'Black Cotton Soil (Regur)', nameTa: 'கரிசல் மண்' },
  { id: 'red_yellow', nameEn: 'Red & Yellow Soil', nameTa: 'செம்மண்' },
  { id: 'laterite', nameEn: 'Laterite Soil', nameTa: 'லேட்டரைட் மண்' },
  { id: 'arid', nameEn: 'Arid / Desert Sand', nameTa: 'மணற்பாங்கு மண்' },
  { id: 'forest', nameEn: 'Forest & Mountain Soil', nameTa: 'மலை / காட்டு மண்' },
  { id: 'peaty', nameEn: 'Peaty & Organic Marsh', nameTa: 'பீட் கரிம மண்' },
  { id: 'rocky', nameEn: 'Hard Bedrock / Rock', nameTa: 'பாறை தளம்' },
  { id: 'sandy', nameEn: 'Medium / Dense Sand', nameTa: 'மணல் மண்' },
  { id: 'clayey', nameEn: 'Clayey Soil', nameTa: 'களிமண்' }
];

export function classifySoilTexture(sand, silt, clay) {
  const s = parseFloat(sand) || 0;
  const si = parseFloat(silt) || 0;
  const c = parseFloat(clay) || 0;

  if (c >= 40) return 'Clay';
  if (si >= 80) return 'Silt';
  if (s >= 85) return 'Sand';
  if (c >= 27 && c < 40 && s <= 45) return 'Clay Loam';
  if (si >= 50 && c < 27) return 'Silty Loam';
  if (s >= 50 && c < 20) return 'Sandy Loam';
  return 'Loam';
}

export function getPlasticityClass(PI) {
  if (PI < 7) return 'Low';
  if (PI <= 17) return 'Medium';
  return 'High';
}

function getTerzaghiFactors(phi) {
  const factors = {
    0: { Nc: 5.7, Nq: 1.0, Ngamma: 0.0 },
    5: { Nc: 7.3, Nq: 1.6, Ngamma: 0.5 },
    10: { Nc: 9.6, Nq: 2.7, Ngamma: 1.2 },
    15: { Nc: 12.9, Nq: 4.4, Ngamma: 2.5 },
    20: { Nc: 17.7, Nq: 7.4, Ngamma: 5.0 },
    25: { Nc: 25.1, Nq: 12.7, Ngamma: 9.7 },
    30: { Nc: 37.2, Nq: 22.5, Ngamma: 19.7 },
    35: { Nc: 57.8, Nq: 41.4, Ngamma: 42.4 },
    40: { Nc: 95.7, Nq: 81.3, Ngamma: 100.4 },
    45: { Nc: 172.3, Nq: 173.3, Ngamma: 297.5 }
  };
  
  const angles = Object.keys(factors).map(Number).sort((a, b) => a - b);
  const p = Math.max(0, Math.min(45, phi));

  if (p <= angles[0]) return factors[angles[0]];
  if (p >= angles[angles.length - 1]) return factors[angles[angles.length - 1]];
  
  let lower = angles[0];
  let upper = angles[1];
  for (let i = 0; i < angles.length - 1; i++) {
    if (p >= angles[i] && p <= angles[i+1]) {
      lower = angles[i];
      upper = angles[i+1];
      break;
    }
  }
  
  const factor = (p - lower) / (upper - lower);
  return {
    Nc: factors[lower].Nc + factor * (factors[upper].Nc - factors[lower].Nc),
    Nq: factors[lower].Nq + factor * (factors[upper].Nq - factors[lower].Nq),
    Ngamma: factors[lower].Ngamma + factor * (factors[upper].Ngamma - factors[lower].Ngamma)
  };
}

export function calculateGeotechnicalProperties(inputs) {
  try {
    const gs = parseFloat(inputs.gs) || 2.70;
    const sandPct = parseFloat(inputs.sandPct) || 40;
    const siltPct = parseFloat(inputs.siltPct) || 30;
    const clayPct = parseFloat(inputs.clayPct) || 30;
    const bulkDensity = parseFloat(inputs.bulkDensity) || 1.8;
    const cohesion = parseFloat(inputs.cohesion) || 22;
    const frictionAngle = parseFloat(inputs.frictionAngle) || 26;
    const liquidLimit = parseFloat(inputs.liquidLimit) || 45;
    const plasticLimit = parseFloat(inputs.plasticLimit) || 22;
    const soilType = inputs.soilType || 'alluvial';
    const depth = parseFloat(inputs.depth) || 1.5;
    const waterTable = parseFloat(inputs.waterTable) || 3.0;
    const sptN = parseFloat(inputs.sptN) || 16;
    const moisture = parseFloat(inputs.moistureContent) || 18;

    const texture = classifySoilTexture(sandPct, siltPct, clayPct);
    const PI = liquidLimit - plasticLimit;
    const plasticityClass = getPlasticityClass(PI);

    // ============================================
    // ANN INFERENCE ENGINE
    // ============================================
    const { cbr, sbc: q_safe_raw } = predictSoil(moisture, bulkDensity);
    const q_safe = Math.round(q_safe_raw);

    // Standard structural load per floor = ~65 kN/m²
    let maxFloors = Math.floor(q_safe / 65);
    if (maxFloors < 1) maxFloors = 1;
    if (soilType === 'rocky') maxFloors = Math.max(maxFloors, 12);
    if (soilType === 'peaty') maxFloors = 1;
    if (soilType === 'black_cotton') maxFloors = Math.min(maxFloors, 3);
    if (sptN < 8) maxFloors = Math.min(maxFloors, 2);

    // ANN Foundation Recommendation
    const soilTexCode = soilTextureCodeFromDensity(bulkDensity);
    const fndProbs = predictFoundation(cbr, q_safe, soilTexCode, maxFloors);
    const bestFnd = fndProbs[0].name;

    let foundationTypeKey = 'fndIsolated';
    let rationaleEn = `AI Model recommends ${bestFnd} with ${(fndProbs[0].prob * 100).toFixed(1)}% confidence based on soil parameters.`;
    let rationaleTa = `AI மாடல் ${bestFnd} ஐ ${(fndProbs[0].prob * 100).toFixed(1)}% நம்பிக்கையுடன் பரிந்துரைக்கிறது.`;
    let settlementRiskEn = 'Moderate Settlement Risk.';
    let settlementRiskTa = 'மிதமான அமிழ்தல் ஆபத்து.';

    if (bestFnd === 'Pile Foundation') foundationTypeKey = 'fndPile';
    else if (bestFnd === 'Raft Foundation') foundationTypeKey = 'fndRaft';
    else if (bestFnd === 'Combined Footing') foundationTypeKey = 'fndCombined';
    else foundationTypeKey = 'fndIsolated';

    // Depth Schedule Chart Data (Scaled from ANN result)
    const depths = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0];
    const chartData = depths.map(d => {
      // Linearly scale bearing capacity based on depth relative to user depth
      const d_q_safe = Math.round(q_safe * (1 + (d - depth) * 0.15));
      const d_floors = Math.max(1, Math.floor(d_q_safe / 52));
      const isSafe = d_floors <= maxFloors;

      return {
        depth: `${d}m`,
        bearingCapacity: d_q_safe,
        maxFloors: d_floors,
        isSafe,
        status: isSafe ? 'safe' : 'warning'
      };
    });

    // Calculate Soil Stability Score (0-100)
    let stabilityScore = 50;
    stabilityScore += Math.min(30, (q_safe / 350) * 30);
    if (plasticityClass === 'High') stabilityScore -= 15;
    if (waterTable <= depth) stabilityScore -= 10;
    stabilityScore += Math.min(10, (sptN / 50) * 10);
    stabilityScore = Math.max(10, Math.min(100, Math.round(stabilityScore)));

    const targetFloors = parseInt(inputs.desiredFloors) || 0;
    const requiredBearingCapacity = targetFloors > 0 ? targetFloors * 55 : 0;
    const capacityRatio = requiredBearingCapacity > 0 ? Math.round((q_safe / requiredBearingCapacity) * 100) : 0;

    let targetStatus = 'safe';
    let targetFootingEn = 'Raft Foundation';
    let targetFootingTa = 'ராஃப்ட் அடித்தளம்';
    let targetAdviceEn = `Analyzed by ANN.`;
    let targetAdviceTa = `ANN ஆல் பகுப்பாய்வு செய்யப்பட்டது.`;

    if (targetFloors === 0) {
      targetStatus = 'idle';
      targetFootingEn = 'Please Enter Desired Floors';
      targetFootingTa = 'மாடிகளை உள்ளிடவும்';
    } else if (q_safe >= requiredBearingCapacity) {
      targetStatus = 'safe';
      targetAdviceEn = `Your soil safe bearing capacity (${q_safe} kN/m²) supports your intended ${targetFloors}-floor construction.`;
    } else {
      targetStatus = 'warning';
      targetAdviceEn = `Constructing ${targetFloors} floors requires ${requiredBearingCapacity} kN/m², but AI predicts soil capacity is ${q_safe} kN/m².`;
    }

    return {
      gs,
      depth,
      bulkDensity,
      bearingCapacity: q_safe,
      allowableBearingCapacity: q_safe,
      maxFloors,
      foundationTypeKey,
      recommendedFoundation: foundationTypeKey,
      rationaleEn,
      rationaleTa,
      settlementRiskEn,
      settlementRiskTa,
      stabilityScore,
      soilTexture: texture,
      piValue: PI,
      plasticityClass,
      targetFloorAdvisory: {
        targetFloors,
        requiredBearingCapacity,
        capacityRatio,
        targetStatus,
        targetFootingEn,
        targetFootingTa,
        targetAdviceEn,
        targetAdviceTa
      },
      inputSummary: {
        texture,
        plasticityIndex: PI,
        plasticityClass,
        gamma: parseFloat((bulkDensity * 9.81).toFixed(2))
      },
      design: {
        maxFloors,
        recommendation: rationaleEn,
        settlementRisk: settlementRiskEn,
        stabilityScore
      },
      chartData
    };
  } catch (err) {
    console.error("ANN Engine Error:", err);
    // Return safe defaults so the UI doesn't crash
    return {
      gs: 2.7, depth: 1.5, bulkDensity: 1.8, bearingCapacity: 150, allowableBearingCapacity: 150,
      maxFloors: 2, foundationTypeKey: 'fndIsolated', recommendedFoundation: 'fndIsolated',
      rationaleEn: 'Fallback due to AI error.', rationaleTa: '', settlementRiskEn: '', settlementRiskTa: '',
      stabilityScore: 50, soilTexture: 'Unknown', piValue: 0, plasticityClass: 'Low',
      targetFloorAdvisory: { targetStatus: 'idle', targetFootingEn: '', targetFootingTa: '', targetAdviceEn: '', targetAdviceTa: '' },
      inputSummary: { texture: 'Unknown', plasticityIndex: 0, plasticityClass: 'Low', gamma: 18 },
      design: { maxFloors: 2, recommendation: '', settlementRisk: '', stabilityScore: 50 },
      chartData: []
    };
  }
}

export const SOIL_TYPES = ['alluvial', 'black_cotton', 'red_yellow', 'laterite', 'arid', 'forest', 'peaty', 'rocky', 'sandy', 'clayey'];
