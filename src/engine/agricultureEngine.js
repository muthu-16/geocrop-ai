import { ALL_PLANTS_DB } from './soilDatabase';

export function calculateAgriculturalPlan(inputs) {
  const {
    nitrogen, phosphorus, potassium,
    soilPH, soilEC, soilCEC, organicCarbon,
    soilMoisture, soilType, targetPlant,
    micronutrients
  } = inputs;

  const { fe, zn, mn, cu, b } = micronutrients || { fe: 0, zn: 0, mn: 0, cu: 0, b: 0 };

  // 1. Find the selected plant
  const selectedPlantData = ALL_PLANTS_DB.find(p => p.id === targetPlant);

  // 2. Calculate NPK deficits for the selected plant (if one is selected)
  let deficits = { n: 0, p: 0, k: 0 };
  let fertilizerBags = { urea: 0, dap: 0, mop: 0 };
  
  if (selectedPlantData) {
    const targetN = selectedPlantData.targetN;
    const targetP = selectedPlantData.targetP;
    const targetK = selectedPlantData.targetK;

    deficits.n = Math.max(0, targetN - nitrogen);
    deficits.p = Math.max(0, targetP - phosphorus);
    deficits.k = Math.max(0, targetK - potassium);

    // 6. Calculate fertilizer bags (approx 50kg bags)
    // DAP provides 46% P2O5 and 18% N
    const dapKg = deficits.p / 0.46;
    fertilizerBags.dap = Math.ceil(dapKg / 50);

    // Remaining N after DAP
    const nFromDap = dapKg * 0.18;
    const remainingN = Math.max(0, deficits.n - nFromDap);
    
    // Urea provides 46% N
    const ureaKg = remainingN / 0.46;
    fertilizerBags.urea = Math.ceil(ureaKg / 50);

    // MOP provides 60% K2O
    const mopKg = deficits.k / 0.60;
    fertilizerBags.mop = Math.ceil(mopKg / 50);
  }

  // 3. Calculate Soil Health Score (0-100)
  let healthScore = 100;
  
  // pH deviation (ideal around 6.5 - 7.5)
  if (soilPH < 6.0) healthScore -= (6.0 - soilPH) * 15;
  else if (soilPH > 8.0) healthScore -= (soilPH - 8.0) * 15;

  // EC deviation (ideal < 2 dS/m)
  if (soilEC > 2) healthScore -= (soilEC - 2) * 10;
  
  // OC% adequacy (ideal > 0.75%)
  if (organicCarbon < 0.5) healthScore -= 15;
  else if (organicCarbon < 0.75) healthScore -= 5;
  
  // CEC adequacy (ideal > 15)
  if (soilCEC < 10) healthScore -= 10;

  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  // 4. Score ALL plants for suitability (0-100%)
  const scoredPlants = ALL_PLANTS_DB.map(plant => {
    let score = 100;

    // pH match (±30pts)
    if (soilPH < plant.idealPH[0]) {
      score -= Math.min(30, (plant.idealPH[0] - soilPH) * 15);
    } else if (soilPH > plant.idealPH[1]) {
      score -= Math.min(30, (soilPH - plant.idealPH[1]) * 15);
    }

    // Soil type match (±20pts)
    if (!plant.idealSoilTypes.includes(soilType)) {
      score -= 20;
    }

    // NPK adequacy (±20pts) - simplistic estimation
    if (nitrogen < plant.targetN * 0.5) score -= 10;
    if (phosphorus < plant.targetP * 0.5) score -= 5;
    if (potassium < plant.targetK * 0.5) score -= 5;

    // EC tolerance (±15pts)
    if (soilEC > plant.idealEC[1]) {
      score -= Math.min(15, (soilEC - plant.idealEC[1]) * 10);
    }

    // Moisture match (±15pts)
    if (soilMoisture < plant.idealMoisture[0]) {
      score -= Math.min(15, (plant.idealMoisture[0] - soilMoisture) * 0.5);
    } else if (soilMoisture > plant.idealMoisture[1]) {
      score -= Math.min(15, (soilMoisture - plant.idealMoisture[1]) * 0.5);
    }

    return {
      ...plant,
      suitabilityScore: Math.max(0, Math.min(100, Math.round(score)))
    };
  });

  // 5. Sort and return top crops, vegetables, fruits separately
  const sortedPlants = [...scoredPlants].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  
  const recommendedCrops = sortedPlants.filter(p => p.category === 'crop').slice(0, 5);
  const recommendedVegetables = sortedPlants.filter(p => p.category === 'vegetable').slice(0, 5);
  const recommendedFruits = sortedPlants.filter(p => p.category === 'fruit').slice(0, 5);

  // 7. Categorize NPK + micronutrient status as Low/Optimal/High
  const categorize = (val, low, high) => val < low ? 'Low' : val > high ? 'High' : 'Optimal';
  
  const status = {
    nitrogen: categorize(nitrogen, 280, 560), // standard kg/ha ranges
    phosphorus: categorize(phosphorus, 11, 22), 
    potassium: categorize(potassium, 118, 280),
    organicCarbon: categorize(organicCarbon, 0.5, 0.75),
    zinc: categorize(zn, 0.6, 1.2),
    iron: categorize(fe, 4.5, 9.0),
    copper: categorize(cu, 0.2, 0.4),
    manganese: categorize(mn, 2.0, 4.0),
    boron: categorize(b, 0.5, 1.0)
  };

  // 8. Return radarData for Recharts
  const radarData = [
    { subject: 'Nitrogen', value: Math.min(100, (nitrogen / 560) * 100), fullMark: 100 },
    { subject: 'Phosphorus', value: Math.min(100, (phosphorus / 22) * 100), fullMark: 100 },
    { subject: 'Potassium', value: Math.min(100, (potassium / 280) * 100), fullMark: 100 },
    { subject: 'pH', value: soilPH >= 6.0 && soilPH <= 7.5 ? 100 : 50, fullMark: 100 },
    { subject: 'Organic Carbon', value: Math.min(100, (organicCarbon / 0.75) * 100), fullMark: 100 },
    { subject: 'Moisture', value: soilMoisture, fullMark: 100 }
  ];

  return {
    crop: selectedPlantData,
    plant: selectedPlantData,
    soilHealthScore: Math.max(0, Math.min(100, Math.round(healthScore))),
    deficits,
    fertilizer: {
      ureaBags: fertilizerBags.urea,
      ureaKg: Math.round(fertilizerBags.urea * 50),
      dapBags: fertilizerBags.dap,
      dapKg: Math.round(fertilizerBags.dap * 50),
      mopBags: fertilizerBags.mop,
      mopKg: Math.round(fertilizerBags.mop * 50)
    },
    topCrops: recommendedCrops,
    topVegetables: recommendedVegetables,
    topFruits: recommendedFruits,
    recommendations: {
      crops: recommendedCrops,
      vegetables: recommendedVegetables,
      fruits: recommendedFruits
    },
    status,
    radarData: [
      { subject: 'Nitrogen', Actual: Math.min(100, Math.round((nitrogen / 300) * 100)), Target: 80 },
      { subject: 'Phosphorus', Actual: Math.min(100, Math.round((phosphorus / 100) * 100)), Target: 75 },
      { subject: 'Potassium', Actual: Math.min(100, Math.round((potassium / 200) * 100)), Target: 70 },
      { subject: 'pH', Actual: Math.round((soilPH / 14) * 100), Target: 50 },
      { subject: 'Organic C', Actual: Math.min(100, Math.round((organicCarbon / 2) * 100)), Target: 65 },
      { subject: 'Moisture', Actual: Math.round(soilMoisture), Target: 60 }
    ]
  };
}
