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

  const texture = classifySoilTexture(sandPct, siltPct, clayPct);
  const PI = liquidLimit - plasticLimit;
  const plasticityClass = getPlasticityClass(PI);

  const B = 1.5; // Footing width 1.5m
  const gamma = bulkDensity * 9.81; // kN/m³

  // Water table reduction factor W'
  let W = 1.0;
  if (waterTable <= depth) {
    W = 0.5;
  } else if (waterTable < depth + B) {
    W = 0.5 + 0.5 * ((waterTable - depth) / B);
  }

  // Terzaghi bearing capacity calculation for shallow footing (B = 1.5m)
  // Apply local shear failure reduction factor 0.67 for typical soil strata
  const c_effective = cohesion * 0.67;
  const { Nc, Nq, Ngamma } = getTerzaghiFactors(frictionAngle * 0.85);

  let q_ult = (1.3 * c_effective * Nc) + (gamma * depth * Nq) + (0.4 * gamma * B * Ngamma * W);
  
  // Soil Type Modifiers
  if (soilType === 'rocky') {
    q_ult = Math.max(q_ult, 1800);
  } else if (soilType === 'peaty') {
    q_ult = Math.min(q_ult, 240);
  } else if (soilType === 'black_cotton') {
    q_ult = Math.min(q_ult, 480);
  }

  const q_safe = Math.round(q_ult / 3.0); // Factor of Safety = 3.0

  // Standard structural load per floor = ~65 kN/m² (Dead + Live + Column Footing factor)
  let maxFloors = Math.floor(q_safe / 65);
  if (maxFloors < 1) maxFloors = 1;
  
  if (soilType === 'rocky') maxFloors = Math.max(maxFloors, 12);
  if (soilType === 'peaty') maxFloors = 1;
  if (soilType === 'black_cotton') maxFloors = Math.min(maxFloors, 3);
  if (sptN < 8) maxFloors = Math.min(maxFloors, 2);

  // Foundation Recommendation Engine
  let foundationTypeKey = 'fndIsolated';
  let rationaleEn = 'Standard isolated column footings are economical and safe for moderate 3-4 story loads.';
  let rationaleTa = 'நிலையான தனியடைப்பு அடித்தளம் 3-4 மாடி கட்டிடங்களுக்கு பாதுகாப்பானது.';
  let settlementRiskEn = 'Low Settlement Risk.';
  let settlementRiskTa = 'குறைந்த அமிழ்தல் ஆபத்து.';

  if (soilType === 'rocky' || (q_safe >= 450 && frictionAngle >= 35)) {
    foundationTypeKey = 'fndRock';
    rationaleEn = 'Hard bedrock stratum provides maximum bearing capacity for heavy high-rise structures.';
    rationaleTa = 'கெட்டி பாறை தளம் மிகச்சிறந்த தாங்கும் திறனை வழங்கி பல மாடிகளை தாங்கும்.';
    settlementRiskEn = 'Negligible Settlement Risk.';
    settlementRiskTa = 'அமிழ்தல் ஆபத்து இல்லை.';
  } else if (soilType === 'peaty' || q_safe < 100 || sptN < 8) {
    foundationTypeKey = 'fndPile';
    rationaleEn = 'Deep bored pile foundation required to bypass soft organic/peat strata and reach firm soil.';
    rationaleTa = 'மென்மையான மேல்தளத்தைத் தாண்டி ஆழமான பைல் அடித்தளம் அமைப்பது கட்டாயம்.';
    settlementRiskEn = 'High Settlement Risk on Shallow Footings.';
    settlementRiskTa = 'ஆழமற்ற அடித்தளத்தில் அதிக அமிழ்தல் ஆபத்து.';
  } else if (soilType === 'black_cotton' || PI > 28 || (q_safe < 130 && clayPct > 40)) {
    foundationTypeKey = 'fndRaft';
    rationaleEn = 'Raft / Mat foundation distributed over entire footprint to counter swelling and differential settlement.';
    rationaleTa = 'கரிசல் மண்ணின் விரிவாக்கம் மற்றும் ஏற்றத்தாழ்வு அமிழ்தலைத் தடுக்க ராஃப்ட் அடித்தளம் ஏற்றது.';
    settlementRiskEn = 'Moderate to High Differential Settlement Risk.';
    settlementRiskTa = 'மிதமான முதல் அதிக ஏற்றத்தாழ்வு அமிழ்தல் ஆபத்து.';
  } else if (soilType === 'arid' || soilType === 'sandy' || (q_safe >= 120 && q_safe < 180)) {
    foundationTypeKey = 'fndStrip';
    rationaleEn = 'Continuous strip footing spreads structural load evenly along load-bearing walls.';
    rationaleTa = 'தொடர் ஸ்ட்ரிப் அடித்தளம் சுவர்களின் பாரத்தை மணல்/வண்டல் மண்ணில் சீராக பரப்புகிறது.';
    settlementRiskEn = 'Low to Moderate Settlement Risk.';
    settlementRiskTa = 'குறைவு முதல் மிதமான அமிழ்தல் ஆபத்து.';
  } else if (q_safe >= 180 && q_safe <= 350) {
    foundationTypeKey = 'fndIsolated';
    rationaleEn = 'Standard reinforced isolated column pad footings are economical and safe for 3-4 floors.';
    rationaleTa = 'நிலையான தனியடைப்பு அடித்தளம் 3-4 மாடிகளுக்கு சிக்கனமானது மற்றும் பாதுகாப்பானது.';
    settlementRiskEn = 'Low Settlement Risk.';
    settlementRiskTa = 'குறைந்த அமிழ்தல் ஆபத்து.';
  } else if (q_safe > 350) {
    foundationTypeKey = 'fndCombined';
    rationaleEn = 'Heavy combined footing suited for multi-story load-bearing columns.';
    rationaleTa = 'கனரக தூண்கள் மற்றும் பல மாடி கட்டிடங்களுக்கு இணைக்கப்பட்ட அடித்தளம் ஏற்றது.';
    settlementRiskEn = 'Very Low Settlement Risk.';
    settlementRiskTa = 'மிகக் குறைந்த அமிழ்தல் ஆபத்து.';
  }

  // Depth Schedule Chart Data
  const depths = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0];
  const chartData = depths.map(d => {
    let d_W = 1.0;
    if (waterTable <= d) d_W = 0.5;
    else if (waterTable < d + B) d_W = 0.5 + 0.5 * ((waterTable - d) / B);

    let d_q_ult = (1.3 * c_effective * Nc) + (gamma * d * Nq) + (0.4 * gamma * B * Ngamma * d_W);
    if (soilType === 'rocky') d_q_ult = Math.max(d_q_ult, 1800);
    else if (soilType === 'peaty') d_q_ult = Math.min(d_q_ult, 240);

    const d_q_safe = Math.round(d_q_ult / 3.0);
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

  // Target Floor Custom Advisory Engine
  const targetFloors = parseInt(inputs.desiredFloors) || 0;
  const requiredBearingCapacity = targetFloors > 0 ? targetFloors * 55 : 0; // Required kN/m² for target floors
  const capacityRatio = requiredBearingCapacity > 0 ? Math.round((q_safe / requiredBearingCapacity) * 100) : 0;

  let targetStatus = 'safe'; // 'safe' | 'warning' | 'critical' | 'idle'
  let targetFootingEn = '';
  let targetFootingTa = '';
  let targetAdviceEn = '';
  let targetAdviceTa = '';

  if (targetFloors === 0) {
    targetStatus = 'idle';
    targetFootingEn = 'Please Enter Desired Floors';
    targetFootingTa = 'மாடிகளின் எண்ணிக்கையை உள்ளிடவும்';
    targetAdviceEn = 'Please enter the number of floors you intend to build to receive customized foundation advice and safety verification.';
    targetAdviceTa = 'பொருத்தமான அஸ்திவார ஆலோசனையைப் பெற, நீங்கள் கட்ட விரும்பும் மாடிகளின் எண்ணிக்கையை உள்ளிடவும்.';
  } else if (q_safe >= requiredBearingCapacity) {
    targetStatus = 'safe';
    if (targetFloors <= 2) {
      targetFootingEn = 'Strip / Isolated Pad Footing (1.2m x 1.2m)';
      targetFootingTa = 'தொடர் / தனியடைப்பு அஸ்திவாரம் (1.2மீ x 1.2மீ)';
    } else if (targetFloors <= 4) {
      targetFootingEn = 'Reinforced Isolated Column Footing (1.8m x 1.8m)';
      targetFootingTa = 'வலுவூட்டப்பட்ட தூண் அஸ்திவாரம் (1.8மீ x 1.8மீ)';
    } else if (targetFloors <= 6) {
      targetFootingEn = 'Heavy Combined Pad Footing (2.4m x 2.4m)';
      targetFootingTa = 'இணைக்கப்பட்ட கனரக அஸ்திவாரம் (2.4மீ x 2.4மீ)';
    } else {
      targetFootingEn = 'Raft / Mat Foundation with Deep Ground Beams';
      targetFootingTa = 'ராஃப்ட் அஸ்திவாரம் மற்றும் ஆழமான பீம்கள்';
    }
    targetAdviceEn = `Your soil safe bearing capacity (${q_safe} kN/m²) comfortably supports your intended ${targetFloors}-floor construction with a safety margin of ${capacityRatio}%.`;
    targetAdviceTa = `உங்கள் மண்ணின் தாங்கும் திறன் (${q_safe} kN/m²) நீங்கள் திட்டமிட்டுள்ள ${targetFloors} மாடி கட்டிடத்தை ${capacityRatio}% பாதுகாப்பு வரம்புடன் தாங்கும்.`;
  } else if (q_safe >= requiredBearingCapacity * 0.75) {
    targetStatus = 'warning';
    targetFootingEn = 'Raft / Grid Mat Foundation or Soil Stabilization';
    targetFootingTa = 'ராஃப்ட் அஸ்திவாரம் அல்லது மண் வலுவூட்டல்';
    targetAdviceEn = `Constructing ${targetFloors} floors requires ${requiredBearingCapacity} kN/m², but current soil capacity is ${q_safe} kN/m². Using a Mat Raft foundation or compacting subgrade will make it safe.`;
    targetAdviceTa = `${targetFloors} மாடிகள் கட்ட ${requiredBearingCapacity} kN/m² தேவை, தற்போதைய திறன் ${q_safe} kN/m². ராஃப்ட் அஸ்திவாரம் அல்லது மண் கெட்டிப்படுத்துதல் மூலம் பாதுகாப்பாக்கலாம்.`;
  } else {
    targetStatus = 'critical';
    targetFootingEn = 'Deep Friction Micro-Piles or Structural Soil Improvement';
    targetFootingTa = 'ஆழ் பைல் அஸ்திவாரம் அல்லது கட்டமைப்பு மண் சீரமைப்பு';
    targetAdviceEn = `High risk for shallow footings! Building ${targetFloors} floors requires deep piles (min 6m-9m depth) to reach firmer soil layers.`;
    targetAdviceTa = `ஆழமற்ற அஸ்திவாரத்திற்கு அதிக ஆபத்து! ${targetFloors} மாடிகள் கட்ட ஆழமான பைல் அஸ்திவாரம் (6மீ-9மீ ஆழம்) தேவை.`;
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
      gamma: parseFloat(gamma.toFixed(2))
    },
    design: {
      maxFloors,
      recommendation: rationaleEn,
      settlementRisk: settlementRiskEn,
      stabilityScore
    },
    chartData
  };
}

export const SOIL_TYPES = ['alluvial', 'black_cotton', 'red_yellow', 'laterite', 'arid', 'forest', 'peaty', 'rocky', 'sandy', 'clayey'];
