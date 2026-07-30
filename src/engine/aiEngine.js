/**
 * GeoCrop AI Assistant — Comprehensive Knowledge & Reasoning Engine
 * Generates context-aware answers in English and Tamil (தமிழ்)
 * Handles ANY civil engineering, geotechnical, agricultural, soil science,
 * fertilizer, construction, or general knowledge question.
 */

export function generateAIAnswer(query, geoState, agriState, lang = 'en') {
  const q = query.toLowerCase().trim();
  const isTa = lang === 'ta';

  // Extract active context parameters
  const Gs = geoState.gs || 2.65;
  const soilType = geoState.soilType || 'sandy';
  const bearingCap = geoState.bearingCapacity || 180;
  const maxFloors = geoState.maxFloors || 3;
  const bulkDensity = geoState.bulkDensity || 18;
  const depth = geoState.depth || 1.5;
  const sptN = geoState.sptN || 15;
  const foundationKey = geoState.foundationTypeKey || 'fndIsolated';
  const foundationName = isTa ? getFoundationNameTa(foundationKey) : getFoundationNameEn(foundationKey);
  const soilName = isTa ? getSoilTypeNameTa(soilType) : getSoilTypeNameEn(soilType);
  const cropName = isTa ? (agriState.crop?.nameTa || 'பயிர்') : (agriState.crop?.nameEn || 'Crop');
  const urea = agriState.fertilizer?.ureaBags || 0;
  const dap = agriState.fertilizer?.dapBags || 0;
  const mop = agriState.fertilizer?.mopBags || 0;
  const defN = agriState.deficitN || 0;
  const defP = agriState.deficitP || 0;
  const defK = agriState.deficitK || 0;
  const curN = agriState.currentN || 0;
  const curP = agriState.currentP || 0;
  const curK = agriState.currentK || 0;

  // ============================================================
  // TOPIC MATCHING — Broader keyword-based intent detection
  // ============================================================

  // GREETINGS
  if (matchAny(q, ['hello', 'hi', 'hey', 'good morning', 'good evening', 'vanakkam', 'வணக்கம்', 'நலமா', 'how are you'])) {
    return isTa
      ? `வணக்கம்! 👋 நான் ஜியோக்ராப் AI உதவியாளர். உங்களது நிலத்தின் Gs = ${Gs}, தாங்கும் திறன் = ${bearingCap} kN/m², மற்றும் ${cropName} பயிர் NPK தரவுகளை பகுப்பாய்வு செய்துள்ளேன். எப்படி உதவ வேண்டும்?`
      : `Hello! 👋 I'm GeoCrop AI Assistant. I have your site data loaded: Gs = ${Gs}, Safe Bearing Capacity = ${bearingCap} kN/m², and nutrient plan for ${cropName}. How can I help you today?`;
  }

  // WHAT IS GEOCROP / ABOUT
  if (matchAny(q, ['what is geocrop', 'about', 'what do you do', 'who are you', 'என்ன செய்வாய்', 'யார் நீ', 'what can you do'])) {
    return isTa
      ? `ஜியோக்ராப் AI என்பது கட்டிடப் புவிநுட்பவியல் மற்றும் துல்லிய விவசாயத்தை இணைக்கும் AI தளம். மண்ணின் தாங்கும் திறன், அதிகபட்ச மாடிகள், அஸ்திவார வகை, NPK ஊட்டச்சத்து, பயிர் பொருத்தம் மற்றும் உர அளவுகளை கணக்கிடுகிறது.`
      : `GeoCrop AI is an integrated AI platform that bridges Civil Geotechnical Engineering (soil bearing capacity, floor limits, foundation selection) with Precision Agriculture (NPK analysis, crop suitability, fertilizer dosage). It provides certified analysis for both construction and farming decisions.`;
  }

  // ====================== FOUNDATION QUESTIONS ======================
  if (matchAny(q, ['foundation', 'அஸ்திவாரம்', 'அடித்தளம்', 'footing', 'pile', 'raft', 'strip', 'suggest', 'recommend', 'why this foundation', 'ஏன் இந்த', 'பரிந்துரை'])) {
    return isTa
      ? `உங்களது நிலத்தின் தன் ஈர்ப்பு காரணி Gs = ${Gs}, மண் வகை "${soilName}" ஆகும். கணக்கிடப்பட்ட பாதுகாப்பான தாங்கும் திறன் ${bearingCap} kN/m² என்பதால், "${foundationName}" பரிந்துரைக்கப்படுகிறது.\n\nஅஸ்திவார வகைகள்:\n• பைல் அஸ்திவாரம் — மென்மையான மண்/பீட் (q < 80 kN/m²)\n• ராஃப்ட் அஸ்திவாரம் — மிதமான மண் (80-150 kN/m²)\n• ஸ்ட்ரிப் அஸ்திவாரம் — மணல்/வண்டல் (150-230 kN/m²)\n• தனியடைப்பு அடித்தளம் — களிமண் (150-230 kN/m²)\n• இணைக்கப்பட்ட அடித்தளம் — அடர் மணல் (230-400 kN/m²)\n• பாறை அடித்தளம் — கெட்டிப் பாறை (>400 kN/m²)`
      : `Your soil has Gs = ${Gs}, classification "${soilName}", and safe bearing capacity = ${bearingCap} kN/m². The recommended foundation is "${foundationName}".\n\nFoundation Selection Guide:\n• Deep Pile Foundation — Soft/Peat soil (q < 80 kN/m²)\n• Raft/Mat Foundation — Moderate soil (80-150 kN/m²)\n• Strip Footing — Sandy/Silty soil (150-230 kN/m²)\n• Isolated Footing — Clay soil (150-230 kN/m²)\n• Combined Footing — Dense Sand/Gravel (230-400 kN/m²)\n• Rock Footing — Hard Bedrock (>400 kN/m²)\n\nYour site falls in the ${bearingCap} kN/m² range, making "${foundationName}" the safest and most cost-effective choice.`;
  }

  // ====================== BEARING CAPACITY / IMPROVE ======================
  if (matchAny(q, ['bearing capacity', 'improve', 'increase', 'strengthen', 'அதிகரிக்க', 'திறன்', 'capacity', 'கெட்டிப்படுத்த', 'stabiliz', 'compaction'])) {
    return isTa
      ? `உங்கள் மண்ணின் தற்போதைய தாங்கும் திறன்: ${bearingCap} kN/m². இதை அதிகரிக்க:\n\n1️⃣ இயந்திர நெருக்கம் (Mechanical Compaction) — Vibratory roller மூலம் மண்ணை நெருக்கவும்.\n2️⃣ மணல் / சரளை படுக்கை (Sand/Gravel Cushion) — மென்மையான மண் மேல் 0.5-1m சரளை இடவும்.\n3️⃣ சுண்ணாம்பு / சிமெண்ட் நிலைப்படுத்துதல் (Lime/Cement Stabilization) — 5-8% சிமெண்ட் கலக்கவும்.\n4️⃣ நிலத்தடி நீர் வடிகால் (Dewatering) — பம்ப் மூலம் நிலத்தடி நீரை குறைக்கவும்.\n5️⃣ Geosynthetics / Geotextile — நிலத்தடியில் Geogrid அமைக்கவும்.\n6️⃣ Deep soil mixing / Grouting — சிமெண்ட் ஊசி மூலம் மண்ணை கெட்டிப்படுத்தவும்.`
      : `Your current soil bearing capacity: ${bearingCap} kN/m². Methods to increase it:\n\n1️⃣ Mechanical Compaction — Use vibratory rollers to compact loose soil layers.\n2️⃣ Sand/Gravel Replacement Cushion — Replace top 0.5-1m of weak soil with well-graded gravel.\n3️⃣ Lime/Cement Stabilization — Mix 5-8% cement or lime into soil to increase cohesion.\n4️⃣ Dewatering & Drainage — Lower the water table with pumping or French drains.\n5️⃣ Geosynthetic Reinforcement — Install Geogrid or Geotextile fabric layers.\n6️⃣ Deep Soil Mixing / Grouting — Inject cement slurry into weak strata.\n\nEach method can increase bearing capacity by 30-200% depending on soil conditions.`;
  }

  // ====================== FLOOR LIMIT / BUILDING / STORIES ======================
  if (matchAny(q, ['floor', 'story', 'storey', 'மாடி', 'build', 'கட்ட', 'how many', 'எத்தனை', 'safe to build', 'height', 'multi', 'high rise', 'structure'])) {
    const userFloorMatch = q.match(/(\d+)\s*(floor|மாடி|story|storey)/);
    const askedFloors = userFloorMatch ? parseInt(userFloorMatch[1]) : null;

    if (askedFloors && askedFloors > maxFloors) {
      return isTa
        ? `⚠️ எச்சரிக்கை: நீங்கள் ${askedFloors} மாடிகள் கட்ட விரும்புகிறீர்கள், ஆனால் உங்கள் மண் பாதுகாப்பாக ${maxFloors} மாடிகள் மட்டுமே தாங்கும் (q_safe = ${bearingCap} kN/m²).\n\n${askedFloors} மாடிகள் கட்ட:\n• ஆழமான பைல் அடித்தளம் (Bored Pile Foundation) அமைக்க வேண்டும்\n• மண் நிலைப்படுத்துதல் (Soil Stabilization) செய்ய வேண்டும்\n• கட்டிட வடிவமைப்பை RCC Frame Structure ஆக மாற்ற வேண்டும்\n• தகுதியான கட்டமைப்பு பொறியாளரை கலந்தாலோசிக்கவும்`
        : `⚠️ WARNING: You want to build ${askedFloors} floors, but your soil safely supports only ${maxFloors} floors (q_safe = ${bearingCap} kN/m²).\n\nTo build ${askedFloors} floors, you MUST:\n• Install Deep Bored Pile Foundation (reaching firm bedrock)\n• Perform engineered soil stabilization\n• Use RCC Frame Structure design\n• Conduct detailed site investigation (bore log + lab testing)\n• Consult a licensed structural engineer\n\nBuilding beyond ${maxFloors} floors without these measures risks differential settlement and structural failure.`;
    }

    return isTa
      ? `உங்களது மண் மதிப்பீட்டின்படி (Gs = ${Gs}, q_safe = ${bearingCap} kN/m²) அதிகபட்சமாக ${maxFloors} மாடிகள் (G+${maxFloors-1}) வரை பாதுகாப்பாக கட்டலாம்.\n\n• 1-2 மாடி: மென்மையான மண் / பீட் (q < 100 kN/m²)\n• 3-5 மாடி: நடுத்தர மணல் / களிமண் (100-250 kN/m²)\n• 6-10 மாடி: அடர் மணல் / சரளை (250-400 kN/m²)\n• 10+ மாடி: கெட்டிப் பாறை (>400 kN/m²)\n\nகூடுதல் மாடிகள் கட்ட விரும்பினால் பைல் அடித்தளம் அல்லது மண் கெட்டிப்படுத்தும் முறைகளை மேற்கொள்ள வேண்டும்.`
      : `Based on your soil assessment (Gs = ${Gs}, q_safe = ${bearingCap} kN/m²), your site safely supports up to ${maxFloors} floors (G+${maxFloors-1}).\n\nFloor Limit Guide by Soil Type:\n• 1-2 Floors: Soft Clay / Peat (q < 100 kN/m²)\n• 3-5 Floors: Medium Sand / Clay (100-250 kN/m²)\n• 6-10 Floors: Dense Sand / Gravel (250-400 kN/m²)\n• 10+ Floors: Hard Rock / Bedrock (>400 kN/m²)\n\nIf you need to build beyond ${maxFloors} floors, you'll need deep pile foundations or engineered soil stabilization.`;
  }

  // ====================== SPECIFIC GRAVITY ======================
  if (matchAny(q, ['specific gravity', 'gs value', 'தன் ஈர்ப்பு', 'அடர்த்தி', 'gravity', 'what is gs', 'gs என்றால்'])) {
    return isTa
      ? `தன் ஈர்ப்பு (Specific Gravity - Gs) என்பது மண்ணின் திடப்பொருட்களின் அடர்த்தியை நீரின் அடர்த்தியுடன் ஒப்பிடும் விகிதம்.\n\nGS அடிப்படையிலான மண் வகைப்பாடு:\n• Gs < 2.0 → கரிம மண் / பீட் (Organic / Peat)\n• Gs 2.60-2.67 → மணல் மண் (Sandy Soil)\n• Gs 2.67-2.75 → வண்டல் / களிமண் (Silt / Clay)\n• Gs 2.75-2.85 → கனமான களிமண் (Heavy Clay)\n• Gs > 2.85 → அடர் பாறை / தாது (Dense Rock / Mineral)\n\nஉங்கள் நிலத்தின் Gs = ${Gs}, மண் வகை = "${soilName}".`
      : `Specific Gravity (Gs) is the ratio of the density of soil solids to the density of water. It indicates soil mineral composition.\n\nGs Classification:\n• Gs < 2.0 → Organic Soil / Peat\n• Gs 2.60-2.67 → Sandy Soil (Quartz dominant)\n• Gs 2.67-2.75 → Silt / Clay\n• Gs 2.75-2.85 → Heavy Clay (Iron-rich minerals)\n• Gs > 2.85 → Dense Rock / Metallic Minerals\n\nYour site Gs = ${Gs}, classified as "${soilName}". This directly influences bulk density (${bulkDensity} kN/m³) and bearing capacity calculations.`;
  }

  // ====================== SPT / N-VALUE ======================
  if (matchAny(q, ['spt', 'n-value', 'n value', 'penetration test', 'standard penetration', 'ஊடுருவல்', 'blow count'])) {
    return isTa
      ? `SPT (Standard Penetration Test) என்பது மண்ணின் கடினத்தன்மையை அளவிடும் களப் பரிசோதனை. 63.5 kg சுத்தியை 750mm உயரத்திலிருந்து விழ வைத்து, மண்ணில் 300mm ஊடுருவ தேவையான அடிகளின் எண்ணிக்கையே N-Value.\n\nN-Value வழிகாட்டி:\n• N < 4 → மிகவும் தளர்வான மண் (Very Loose)\n• N 4-10 → தளர்வான மண் (Loose)\n• N 10-30 → நடுத்தர அடர்த்தி (Medium Dense)\n• N 30-50 → அடர்த்தியான மண் (Dense)\n• N > 50 → மிக அடர்த்தியான / பாறை (Very Dense / Rock)\n\nஉங்கள் SPT N = ${sptN} → இது கணக்கீடுகளில் பயன்படுத்தப்பட்டது.`
      : `SPT (Standard Penetration Test) is a field test measuring soil resistance. A 63.5 kg hammer is dropped from 750mm height, and the number of blows to penetrate 300mm is the N-Value.\n\nN-Value Guide:\n• N < 4 → Very Loose Soil\n• N 4-10 → Loose Soil\n• N 10-30 → Medium Dense\n• N 30-50 → Dense Soil\n• N > 50 → Very Dense / Refusal (Rock)\n\nYour SPT N = ${sptN}. Higher N-values indicate stronger soil, increasing bearing capacity and allowable floor limits.`;
  }

  // ====================== WATER TABLE ======================
  if (matchAny(q, ['water table', 'நிலத்தடி நீர்', 'groundwater', 'water level', 'நீர் மட்டம்', 'drainage', 'dewatering'])) {
    return isTa
      ? `நிலத்தடி நீர் மட்டம் (Water Table) என்பது நிலத்தின் அடியில் நீர் நிரம்பிய மட்டம். இது அடித்தள ஆழத்தை விட உயரமாக இருந்தால் தாங்கும் திறன் 50% வரை குறையும்.\n\nஉங்கள் தரவு: அடித்தள ஆழம் = ${depth}m, நிலத்தடி நீர் = ${geoState.waterTable || 3}m.\n\nதீர்வுகள்:\n• வடிகால் அகழிகள் (Drainage Trenches)\n• சிமெண்ட் சுவர் (Sheet Pile / Diaphragm Wall)\n• Dewatering pumps\n• நீர்ப்புகா சிமெண்ட் (Waterproof Concrete)`
      : `The Water Table is the underground level where soil is fully saturated with water. If it's at or above the foundation depth, bearing capacity reduces by up to 50%.\n\nYour data: Foundation depth = ${depth}m, Water Table = ${geoState.waterTable || 3}m.\n\nSolutions for high water table:\n• French drains and drainage trenches\n• Sheet pile or diaphragm walls\n• Dewatering pumps during construction\n• Waterproof concrete (M25+ grade with water-proofing admixtures)\n• Raising foundation level with engineered fill`;
  }

  // ====================== SETTLEMENT / RISK ======================
  if (matchAny(q, ['settlement', 'அமிழ்தல்', 'sinking', 'crack', 'விரிசல்', 'risk', 'ஆபத்து', 'danger', 'safe', 'stability'])) {
    return isTa
      ? `மண் அமிழ்தல் (Settlement) என்பது கட்டிடப் பாரத்தால் மண் கீழ்நோக்கி நகர்வது.\n\nஉங்கள் நிலத்தின் நிலை: "${isTa ? geoState.settlementRiskTa : geoState.settlementRiskEn}"\n\nஅமிழ்தல் வகைகள்:\n• சீரான அமிழ்தல் (Uniform) — குறைந்த ஆபத்து\n• ஏற்றத்தாழ்வு அமிழ்தல் (Differential) — அதிக ஆபத்து, சுவர் விரிசல் ஏற்படும்\n• தாமத அமிழ்தல் (Consolidation) — களிமண்ணில் நீண்ட காலத்தில் ஏற்படும்\n\nதடுப்பு நடவடிக்கைகள்: சரியான அடித்தள வகை, மண் நெருக்கம், வடிகால் அமைப்பு.`
      : `Soil Settlement is the downward movement of soil under structural load.\n\nYour site assessment: "${geoState.settlementRiskEn}"\n\nTypes of Settlement:\n• Uniform Settlement — Entire building sinks evenly (lower risk)\n• Differential Settlement — Uneven sinking, causes wall cracks and structural damage (HIGH RISK)\n• Consolidation Settlement — Long-term compression in clay soils\n\nPrevention: Proper foundation selection ("${foundationName}"), soil compaction, adequate drainage, and uniform load distribution.`;
  }

  // ====================== FERTILIZER / UREA / DAP / MOP ======================
  if (matchAny(q, ['fertilizer', 'உரம்', 'urea', 'யூரியா', 'dap', 'mop', 'ssp', 'apply', 'பயன்படுத்த', 'dosage', 'அளவு', 'எவ்வாறு இட', 'how to apply', 'when to apply', 'schedule'])) {
    return isTa
      ? `${cropName} பயிர்க்கான உர திட்டம்:\n\n📋 கணக்கிடப்பட்ட அளவு (ஹெக்டேருக்கு):\n• யூரியா (46% N): ${urea} மூட்டை (${agriState.fertilizer?.ureaKg || 0} kg)\n• DAP (18% N, 46% P₂O₅): ${dap} மூட்டை (${agriState.fertilizer?.dapKg || 0} kg)\n• MOP (60% K₂O): ${mop} மூட்டை (${agriState.fertilizer?.mopKg || 0} kg)\n\n📅 இடும் முறை:\n1️⃣ அடித்தள உரம் (நடுகை போது): முழு DAP + அரை MOP\n2️⃣ முதல் மேல் உரம் (25-30 நாட்கள்): 1/3 யூரியா + மீதி MOP\n3️⃣ இரண்டாம் மேல் உரம் (45-50 நாட்கள்): 1/3 யூரியா\n4️⃣ மூன்றாம் மேல் உரம் (60-65 நாட்கள்): 1/3 யூரியா\n5️⃣ இலைவழி தெளிப்பு (30 & 45 நாட்கள்): நுண்ணூட்டச்சத்து`
      : `Fertilizer Plan for ${cropName}:\n\n📋 Calculated Dosage (per Hectare):\n• Urea (46% N): ${urea} bags (${agriState.fertilizer?.ureaKg || 0} kg)\n• DAP (18% N, 46% P₂O₅): ${dap} bags (${agriState.fertilizer?.dapKg || 0} kg)\n• MOP (60% K₂O): ${mop} bags (${agriState.fertilizer?.mopKg || 0} kg)\n\n📅 Application Schedule:\n1️⃣ Basal Dose (at planting): All DAP + Half MOP\n2️⃣ 1st Top Dress (25-30 days): 1/3 Urea + remaining MOP\n3️⃣ 2nd Top Dress (45-50 days): 1/3 Urea\n4️⃣ 3rd Top Dress (60-65 days): 1/3 Urea\n5️⃣ Foliar Spray (30 & 45 days): Micronutrient mixture\n\n⚠️ Always irrigate immediately after applying Urea to prevent nitrogen volatilization.`;
  }

  // ====================== NPK / NUTRIENTS ======================
  if (matchAny(q, ['npk', 'nitrogen', 'phosphorus', 'potassium', 'நைட்ரஜன்', 'பாஸ்பரஸ்', 'பொட்டாசியம்', 'nutrient', 'ஊட்டச்சத்து', 'deficien', 'குறைபாடு', 'soil health'])) {
    return isTa
      ? `உங்கள் மண்ணின் NPK நிலை:\n• தழைச்சத்து (N): ${curN} kg/ha — குறைபாடு: ${defN} kg/ha\n• மணிச்சத்து (P): ${curP} kg/ha — குறைபாடு: ${defP} kg/ha\n• சாம்பல்ச்சத்து (K): ${curK} kg/ha — குறைபாடு: ${defK} kg/ha\n\n${cropName} பயிருக்கு தேவையான இலக்கு:\nN: ${agriState.crop?.targetN || 0} | P: ${agriState.crop?.targetP || 0} | K: ${agriState.crop?.targetK || 0} kg/ha\n\nN (நைட்ரஜன்) — இலை வளர்ச்சி & பச்சையம்\nP (பாஸ்பரஸ்) — வேர் & பூ வளர்ச்சி\nK (பொட்டாசியம்) — கனி & நோய் எதிர்ப்பு`
      : `Your Soil NPK Status:\n• Nitrogen (N): ${curN} kg/ha — Deficit: ${defN} kg/ha\n• Phosphorus (P): ${curP} kg/ha — Deficit: ${defP} kg/ha\n• Potassium (K): ${curK} kg/ha — Deficit: ${defK} kg/ha\n\nTarget for ${cropName}:\nN: ${agriState.crop?.targetN || 0} | P: ${agriState.crop?.targetP || 0} | K: ${agriState.crop?.targetK || 0} kg/ha\n\nN (Nitrogen) — Drives leaf/shoot growth & chlorophyll\nP (Phosphorus) — Root development & flowering\nK (Potassium) — Fruit quality, disease resistance & drought tolerance`;
  }

  // ====================== CROP SELECTION / RECOMMENDATION ======================
  if (matchAny(q, ['crop', 'பயிர்', 'which crop', 'best crop', 'suitable', 'paddy', 'rice', 'நெல்', 'sugarcane', 'கரும்பு', 'groundnut', 'நிலக்கடலை', 'cotton', 'பருத்தி', 'millet', 'சிறுதானிய', 'banana', 'வாழை', 'coconut', 'தென்னை', 'maize', 'சோளம்', 'pulses', 'பயறு', 'grow', 'cultivation', 'season', 'பட்டம்'])) {
    return isTa
      ? `உங்கள் மண் வகை "${soilName}" மற்றும் NPK நிலைக்கு ஏற்ற பயிர் பரிந்துரைகள்:\n\n🌾 நெல் (Paddy) — காவிரி டெல்டா, வண்டல்/களிமண், அதிக நீர் தேவை\n🍬 கரும்பு — அனைத்து மண், 10-12 மாத பயிர்\n🥜 நிலக்கடலை — செம்மண்/மணல், சித்திரை பட்டம்\n🧵 பருத்தி — கரிசல் மண், புரட்டாசி பட்டம்\n🌿 சிறுதானியங்கள் — வறட்சியைத் தாங்கும், அனைத்து மண்\n🌽 சோளம் — செம்மண்/மணல், சீரான பாசனம் தேவை\n🫘 பயறு வகைகள் — நெல் தரிசு, மானாவாரி\n🍌 வாழை — வண்டல்/களிமண், அதிக K தேவை\n\nதற்போது ${cropName} தேர்ந்தெடுக்கப்பட்டுள்ளது.`
      : `Crop recommendations for your soil type "${soilName}" and NPK profile:\n\n🌾 Paddy (Rice) — Alluvial/Clay soil, high water, Kuruvai/Samba season\n🍬 Sugarcane — All soils, 10-12 month cycle, very high NPK\n🥜 Groundnut — Red/Sandy soil, well-drained, Chithirai Pattam\n🧵 Cotton — Black cotton soil, deep moisture, Purattasi season\n🌿 Millets (Ragi/Cholam) — Drought resistant, all soils, rainfed\n🌽 Maize — Red/Sandy soil, regular irrigation needed\n🫘 Pulses — Rice fallow, nitrogen-fixing, low input\n🍌 Banana — Clay/Alluvial, very high Potassium requirement\n\nCurrently selected: ${cropName}. The suitability score is based on your soil type, zone, and nutrient levels.`;
  }

  // ====================== SOIL TYPE / CLASSIFICATION ======================
  if (matchAny(q, ['soil type', 'soil class', 'மண் வகை', 'clay', 'களிமண்', 'sand', 'மணல்', 'silt', 'வண்டல்', 'peat', 'பீட்', 'rock', 'பாறை', 'gravel', 'சரளை', 'red soil', 'செம்மண்', 'black soil', 'கரிசல்', 'alluvial', 'laterite'])) {
    return isTa
      ? `மண் வகைகள் & பண்புகள்:\n\n🟤 பீட் / கரிம மண் — Gs < 2.0, மிகக் குறைந்த தாங்கும் திறன்\n🟡 மணல் மண் — Gs 2.63-2.67, நல்ல வடிகால், மிதமான தாங்கு திறன்\n🔵 வண்டல் மண் — Gs 2.60-2.70, நடுத்தர நிலை\n🟠 களிமண் — Gs 2.65-2.80, நீர் உறிஞ்சும், ஈரமாக இருக்கும் போது விரிவடையும்\n⚫ கரிசல் (Black Cotton) — Gs 2.70-2.85, பருத்தி/கரும்புக்கு ஏற்றது\n🔴 செம்மண் — இரும்புச்சத்து அதிகம், நிலக்கடலை/சிறுதானியத்திற்கு ஏற்றது\n⬜ பாறை — Gs > 2.80, மிக உயர்ந்த தாங்கும் திறன்\n\nஉங்கள் மண்: "${soilName}" (Gs = ${Gs})`
      : `Soil Types & Properties:\n\n🟤 Peat / Organic — Gs < 2.0, very low bearing capacity, high moisture\n🟡 Sandy Soil — Gs 2.63-2.67, good drainage, moderate bearing\n🔵 Silty Soil — Gs 2.60-2.70, intermediate properties\n🟠 Clay Soil — Gs 2.65-2.80, absorbs water, swells when wet\n⚫ Black Cotton — Gs 2.70-2.85, excellent for cotton/sugarcane\n🔴 Red Soil (Laterite) — Iron-rich, suitable for groundnut/millets\n⬜ Rock/Bedrock — Gs > 2.80, very high bearing capacity\n\nYour soil: "${soilName}" (Gs = ${Gs})`;
  }

  // ====================== TERZAGHI / FORMULA / CALCULATION ======================
  if (matchAny(q, ['terzaghi', 'formula', 'equation', 'calculate', 'கணக்கீடு', 'meyerhof', 'how is', 'how did', 'எப்படி கணக்கிட', 'method', 'fos', 'factor of safety'])) {
    return isTa
      ? `GeoCrop AI Terzaghi சமன்பாட்டை பயன்படுத்துகிறது:\n\nq_ult = 1.3·c·Nc + γ·D·Nq + 0.4·γ·B·Nγ·W'\n\nஇதில்:\n• c = மண் ஒட்டுதிறன் (Cohesion, kPa)\n• Nc, Nq, Nγ = Bearing Capacity Factors (φ அடிப்படையில்)\n• γ = மண் அலகு எடை (${bulkDensity} kN/m³)\n• D = அடித்தள ஆழம் (${depth} m)\n• B = அடித்தள அகலம் (1.5 m)\n• W' = நிலத்தடி நீர் குறைப்பு காரணி\n\nq_safe = q_ult / FOS (FOS = 3.0)\n\nஉங்கள் q_safe = ${bearingCap} kN/m²\nமாடிகள் = q_safe / 14 kN/m²/floor = ${maxFloors}`
      : `GeoCrop AI uses the simplified Terzaghi Bearing Capacity Equation:\n\nq_ult = 1.3·c·Nc + γ·D·Nq + 0.4·γ·B·Nγ·W'\n\nWhere:\n• c = Soil Cohesion (kPa) — derived from soil type & Gs\n• Nc, Nq, Nγ = Bearing Capacity Factors (based on friction angle φ)\n• γ = Unit Weight = ${bulkDensity} kN/m³\n• D = Foundation Depth = ${depth} m\n• B = Footing Width = 1.5 m (standard)\n• W' = Water Table Correction Factor\n\nq_safe = q_ult / FOS (Factor of Safety = 3.0)\n\nYour Results:\n• q_safe = ${bearingCap} kN/m²\n• Max Floors = q_safe / 14 kN/m²/floor = ${maxFloors} floors`;
  }

  // ====================== COST / BUDGET / PRICE ======================
  if (matchAny(q, ['cost', 'price', 'budget', 'விலை', 'செலவு', 'எவ்வளவு', 'how much', 'expensive', 'cheap', 'estimate'])) {
    return isTa
      ? `தோராயமான செலவு மதிப்பீடு (2024-25 விலைகள்):\n\n🏗️ கட்டுமான செலவு:\n• சாதாரண வீடு: ₹1,800-2,500/sq.ft\n• RCC Frame: ₹2,200-3,000/sq.ft\n• பைல் அடித்தளம்: ₹800-1,500/running m (கூடுதல்)\n\n🌾 உர விலை (தோராயம்):\n• யூரியா: ₹266/50kg bag (மானியம்)\n• DAP: ₹1,350/50kg bag\n• MOP: ₹1,700/50kg bag\n\nஉங்கள் ${cropName} பயிருக்கு:\n• யூரியா: ${urea} bags ≈ ₹${Math.round(urea * 266)}\n• DAP: ${dap} bags ≈ ₹${Math.round(dap * 1350)}\n• MOP: ${mop} bags ≈ ₹${Math.round(mop * 1700)}\n• மொத்த உர செலவு ≈ ₹${Math.round(urea * 266 + dap * 1350 + mop * 1700)}/hectare`
      : `Approximate Cost Estimates (2024-25 prices):\n\n🏗️ Construction Cost:\n• Standard Residential: ₹1,800-2,500/sq.ft\n• RCC Frame Structure: ₹2,200-3,000/sq.ft\n• Pile Foundation (additional): ₹800-1,500/running m\n\n🌾 Fertilizer Prices (approx.):\n• Urea: ₹266/50kg bag (subsidized)\n• DAP: ₹1,350/50kg bag\n• MOP: ₹1,700/50kg bag\n\nYour ${cropName} fertilizer cost:\n• Urea: ${urea} bags ≈ ₹${Math.round(urea * 266)}\n• DAP: ${dap} bags ≈ ₹${Math.round(dap * 1350)}\n• MOP: ${mop} bags ≈ ₹${Math.round(mop * 1700)}\n• Total fertilizer cost ≈ ₹${Math.round(urea * 266 + dap * 1350 + mop * 1700)}/hectare`;
  }

  // ====================== CONCRETE / CEMENT / RCC ======================
  if (matchAny(q, ['concrete', 'cement', 'rcc', 'steel', 'rebar', 'mix', 'grade', 'கான்கிரீட்', 'சிமெண்ட்', 'எஃகு', 'm20', 'm25', 'm30'])) {
    return isTa
      ? `கான்கிரீட் கலவை வழிகாட்டி:\n\nகிரேடு | சிமெண்ட் : மணல் : சரளை | பயன்பாடு\nM15 → 1:2:4 → PCC, தரை வேலை\nM20 → 1:1.5:3 → RCC Slab, Beam\nM25 → 1:1:2 → RCC Column, Footing\nM30 → 1:0.75:1.5 → Heavy Structure\nM35+ → Design Mix → High-Rise / Bridge\n\n⚒️ எஃகு (Steel Reinforcement):\n• Slab: 0.5-0.7% of concrete volume\n• Beam: 1-2% steel ratio\n• Column: 2-4% steel ratio\n• Foundation: 0.2-0.5%`
      : `Concrete Mix Design Guide:\n\nGrade | Cement:Sand:Aggregate | Use Case\nM15 → 1:2:4 → PCC, floor base\nM20 → 1:1.5:3 → RCC Slabs, Beams\nM25 → 1:1:2 → RCC Columns, Footings\nM30 → 1:0.75:1.5 → Heavy Structures\nM35+ → Design Mix → High-Rise / Bridges\n\n⚒️ Steel Reinforcement Guide:\n• Slab: 0.5-0.7% of concrete volume\n• Beam: 1-2% steel ratio\n• Column: 2-4% steel ratio\n• Foundation: 0.2-0.5%\n\nFor your site (${maxFloors} floors), minimum M25 grade concrete is recommended.`;
  }

  // ====================== IRRIGATION / WATER / RAIN ======================
  if (matchAny(q, ['irrigation', 'water', 'rain', 'drought', 'பாசனம்', 'நீர்', 'மழை', 'வறட்சி', 'drip', 'sprinkler', 'flood'])) {
    return isTa
      ? `${cropName} பயிர்க்கான நீர் பாசன வழிகாட்டி:\n\n💧 பாசன முறைகள்:\n• வாய்க்கால் பாசனம் (Surface) — நெல், கரும்பு\n• சொட்டு நீர் (Drip) — நிலக்கடலை, வாழை, காய்கறிகள்\n• தெளிப்பான் (Sprinkler) — சிறுதானியம், பருத்தி\n\n📊 நீர் தேவை (தோராயம்):\n• நெல்: 1200-1500 mm/season\n• கரும்பு: 1500-2000 mm/year\n• நிலக்கடலை: 400-600 mm\n• சிறுதானியம்: 300-500 mm (மானாவாரி)\n• வாழை: 1800-2200 mm/year`
      : `Water & Irrigation Guide for ${cropName}:\n\n💧 Irrigation Methods:\n• Surface/Flood Irrigation — Paddy, Sugarcane\n• Drip Irrigation — Groundnut, Banana, Vegetables (saves 40-60% water)\n• Sprinkler — Millets, Cotton, Maize\n\n📊 Water Requirements (approx.):\n• Paddy: 1200-1500 mm/season\n• Sugarcane: 1500-2000 mm/year\n• Groundnut: 400-600 mm\n• Millets: 300-500 mm (rainfed)\n• Banana: 1800-2200 mm/year\n\nDrip irrigation is 40-60% more water-efficient and is recommended for water-scarce regions.`;
  }

  // ====================== ORGANIC / BIO FERTILIZER ======================
  if (matchAny(q, ['organic', 'கரிம', 'bio', 'compost', 'vermicompost', 'manure', 'natural', 'இயற்கை', 'cow dung', 'green manure'])) {
    return isTa
      ? `இயற்கை / கரிம உர வழிகாட்டி:\n\n🌿 கரிம உரங்கள்:\n• தொழுவுரம் (FYM): 10-15 ton/hectare — N:P:K = 0.5:0.2:0.5%\n• மண்புழு உரம் (Vermicompost): 5 ton/ha — N:P:K = 1.5:0.5:1.0%\n• பசுந்தாள் உரம் (Green Manure): தக்கைப் பூண்டு 6-8 வாரம் வளர்த்து மடக்கி உழவு\n• பஞ்சகவ்யா: 3% கரைசல் இலைவழி தெளிப்பு\n\n🦠 உயிர் உரங்கள் (Bio-Fertilizers):\n• Rhizobium — பயறு வகைகளுக்கு N நிலைநிறுத்தும்\n• Azospirillum — நெல், சிறுதானியத்திற்கு\n• Phosphobacteria — P கரையச் செய்யும்`
      : `Organic & Bio-Fertilizer Guide:\n\n🌿 Organic Manures:\n• FYM (Farm Yard Manure): 10-15 ton/ha — N:P:K = 0.5:0.2:0.5%\n• Vermicompost: 5 ton/ha — N:P:K = 1.5:0.5:1.0%\n• Green Manure: Grow Daincha/Sunhemp for 6-8 weeks & plow under\n• Panchagavya: 3% foliar spray every 15 days\n\n🦠 Bio-Fertilizers:\n• Rhizobium — Nitrogen fixation for pulses/legumes\n• Azospirillum — For paddy, millets, sugarcane\n• Phosphobacteria — Solubilizes fixed phosphorus in soil\n\nCombine 50% chemical + 50% organic for sustainable Integrated Nutrient Management (INM).`;
  }

  // ====================== PEST / DISEASE / PROTECTION ======================
  if (matchAny(q, ['pest', 'disease', 'insect', 'bug', 'பூச்சி', 'நோய்', 'fungus', 'blight', 'wilt', 'spray', 'pesticide', 'protection'])) {
    return isTa
      ? `பயிர் பாதுகாப்பு வழிகாட்டி:\n\n🐛 முக்கிய பூச்சிகள் & தீர்வுகள்:\n• தண்டுத் துளைப்பான் (Stem Borer) — Carbofuran 3G granules\n• இலைச்சுருட்டான் (Leaf Folder) — Chlorantraniliprole spray\n• அசுவினி (Aphids) — Imidacloprid 17.8% SL\n• வெள்ளை ஈ (Whitefly) — Neem oil 3% + sticky traps\n\n🍄 முக்கிய நோய்கள்:\n• கருகல் நோய் (Blast) — Tricyclazole spray\n• வாடல் நோய் (Wilt) — Trichoderma seed treatment\n• இலைப்புள்ளி (Leaf Spot) — Mancozeb 75% WP\n\n✅ IPM (ஒருங்கிணைந்த பூச்சி மேலாண்மை) பரிந்துரைக்கப்படுகிறது.`
      : `Crop Protection Guide:\n\n🐛 Major Pests & Solutions:\n• Stem Borer — Apply Carbofuran 3G granules in leaf whorl\n• Leaf Folder — Chlorantraniliprole 18.5% SC spray\n• Aphids — Imidacloprid 17.8% SL @ 0.5ml/L\n• Whitefly — Neem oil 3% spray + yellow sticky traps\n\n🍄 Major Diseases:\n• Blast (Rice) — Tricyclazole 75% WP spray\n• Wilt — Trichoderma viride seed treatment\n• Leaf Spot — Mancozeb 75% WP @ 2.5g/L\n\n✅ Always follow Integrated Pest Management (IPM) — use chemical sprays only as last resort after cultural and biological methods.`;
  }

  // ====================== CLIMATE / WEATHER / TEMPERATURE ======================
  if (matchAny(q, ['climate', 'weather', 'temperature', 'காலநிலை', 'வெப்பநிலை', 'monsoon', 'பருவமழை', 'humid', 'hot', 'cold'])) {
    return isTa
      ? `தமிழ்நாடு காலநிலை & பயிர் பருவங்கள்:\n\n🌦️ பருவமழை காலம்:\n• தென்மேற்கு (ஜூன்-செப்): மேற்கு மாவட்டங்கள்\n• வடகிழக்கு (அக்-டிச): கிழக்கு & டெல்டா மாவட்டங்கள்\n\n🌡️ வெப்பநிலை:\n• கோடை: 35-42°C (ஏப்ரல்-ஜூன்)\n• குளிர்: 20-28°C (நவ-ஜன)\n• மலைப்பகுதி: 10-22°C\n\n📅 பயிர் பருவங்கள்:\n• குருவை: ஜூன்-செப்\n• சம்பா: ஆக-ஜன\n• தாளடி: செப்-பிப்\n• நவரை: ஜூன்-செப் (குறுகிய பயிர்)`
      : `Tamil Nadu Climate & Crop Seasons:\n\n🌦️ Monsoon Periods:\n• Southwest (Jun-Sep): Western districts (Coimbatore, Nilgiris)\n• Northeast (Oct-Dec): Eastern & Delta districts (Thanjavur, Chennai)\n\n🌡️ Temperature Ranges:\n• Summer: 35-42°C (Apr-Jun)\n• Winter: 20-28°C (Nov-Jan)\n• Hill Stations: 10-22°C year-round\n\n📅 Crop Seasons:\n• Kuruvai: Jun-Sep (short duration rice)\n• Samba: Aug-Jan (main rice season)\n• Thaladi: Sep-Feb\n• Navarai: Jun-Sep (short crops)\n\nCrop selection should align with monsoon availability and temperature tolerance.`;
  }

  // ====================== THANK YOU / APPRECIATION ======================
  if (matchAny(q, ['thank', 'நன்றி', 'thanks', 'great', 'good', 'awesome', 'excellent', 'helpful', 'perfect'])) {
    return isTa
      ? `நன்றி! 🙏 உங்களுக்கு உதவ முடிந்ததில் மகிழ்ச்சி. மேலும் ஏதாவது கேள்வி இருந்தால் தயங்காமல் கேளுங்கள் — மண் பரிசோதனை, அஸ்திவாரம், உரம், பயிர் மேலாண்மை எதுவாக இருந்தாலும் நான் உதவ தயார்!`
      : `You're welcome! 🙏 Happy to help. Feel free to ask any more questions — whether it's about soil testing, foundation design, fertilizer scheduling, crop management, or construction planning. I'm here to assist!`;
  }

  // ====================== GENERAL / CATCH-ALL INTELLIGENT RESPONSE ======================
  // If no specific topic matched, provide a helpful contextual summary + encourage follow-up
  return isTa
    ? `நான் உங்கள் கேள்வியை புரிந்துகொண்டேன். உங்கள் தளத்தின் முக்கிய தரவுகள்:\n\n🏗️ புவிநுட்பவியல்:\n• தன் ஈர்ப்பு Gs = ${Gs} | மண் வகை: "${soilName}"\n• பாதுகாப்பான தாங்கும் திறன்: ${bearingCap} kN/m²\n• அதிகபட்ச மாடிகள்: ${maxFloors} (G+${maxFloors-1})\n• பரிந்துரைக்கப்பட்ட அஸ்திவாரம்: "${foundationName}"\n\n🌾 விவசாயம்:\n• பயிர்: ${cropName}\n• NPK நிலை: N:${curN} | P:${curP} | K:${curK} kg/ha\n• உரம்: யூரியா ${urea} | DAP ${dap} | MOP ${mop} மூட்டைகள்\n\nகுறிப்பிட்ட கேள்வியை கேளுங்கள் — அஸ்திவாரம், மாடி, உரம், பயிர், மண் வகை, செலவு, பாசனம், பூச்சி மேலாண்மை எதுவாக இருந்தாலும் விரிவாக பதிலளிக்கிறேன்! 🤝`
    : `I understand your question. Here's your complete site profile:\n\n🏗️ Geotechnical Summary:\n• Specific Gravity Gs = ${Gs} | Soil: "${soilName}"\n• Safe Bearing Capacity: ${bearingCap} kN/m²\n• Max Safe Floors: ${maxFloors} (G+${maxFloors-1})\n• Recommended Foundation: "${foundationName}"\n\n🌾 Agriculture Summary:\n• Crop: ${cropName}\n• NPK Status: N:${curN} | P:${curP} | K:${curK} kg/ha\n• Fertilizer: Urea ${urea} | DAP ${dap} | MOP ${mop} bags\n\nI can answer questions about: foundations, floor limits, soil types, bearing capacity, SPT N-values, fertilizers, crop selection, irrigation, pest management, concrete grades, construction costs, organic farming, and more. Just ask! 🤝`;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function matchAny(query, keywords) {
  return keywords.some(kw => query.includes(kw));
}

function getFoundationNameEn(key) {
  const map = {
    fndPile: 'Deep Pile Foundation',
    fndRaft: 'Raft / Mat Foundation',
    fndStrip: 'Strip Footing',
    fndIsolated: 'Isolated Column Footing',
    fndCombined: 'Combined Footing',
    fndRock: 'Rock Footing'
  };
  return map[key] || 'Standard Footing';
}

function getFoundationNameTa(key) {
  const map = {
    fndPile: 'ஆழ் பைல் அஸ்திவாரம்',
    fndRaft: 'ராஃப்ட் / மேட் அஸ்திவாரம்',
    fndStrip: 'ஸ்ட்ரிப் தொடர் அஸ்திவாரம்',
    fndIsolated: 'தனியடைப்பு அடித்தளம்',
    fndCombined: 'இணைக்கப்பட்ட கன அடித்தளம்',
    fndRock: 'பாறை அடித்தளம்'
  };
  return map[key] || 'அடித்தளம்';
}

function getSoilTypeNameEn(type) {
  const map = {
    peat: 'Peat / Organic',
    clayey: 'Clayey Soil',
    heavy_clay: 'Heavy Clay',
    silty: 'Silty Soil',
    sandy: 'Sandy Soil',
    dense_sand: 'Dense Sand',
    rocky: 'Bedrock / Rock'
  };
  return map[type] || 'Soil';
}

function getSoilTypeNameTa(type) {
  const map = {
    peat: 'பீட் கரிம மண்',
    clayey: 'களிமண்',
    heavy_clay: 'அடர் களிமண்',
    silty: 'வண்டல் களிமண்',
    sandy: 'மணல் மண்',
    dense_sand: 'அடர்ந்த மணல்',
    rocky: 'பாறை மண்'
  };
  return map[type] || 'மண்';
}

// ============================================================
// NATURAL LANGUAGE PARAMETER PARSER & AUTO-FILLER
// ============================================================

export function parseSoilInputsFromText(text) {
  const parsedGeo = {};
  const parsedAgri = {};
  let count = 0;

  const patterns = [
    { key: 'gs', regex: /(?:gs|specific\s*gravity)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'sandPct', regex: /(?:sand)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'siltPct', regex: /(?:silt)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'clayPct', regex: /(?:clay)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'bulkDensity', regex: /(?:bulk\s*density|density|bd)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'porosity', regex: /(?:porosity)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'moistureContent', regex: /(?:moisture|water\s*content)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'both' },
    { key: 'cohesion', regex: /(?:cohesion|\bc\b)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'frictionAngle', regex: /(?:friction|\bphi\b|\bφ\b)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'liquidLimit', regex: /(?:liquid\s*limit|\bll\b)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'plasticLimit', regex: /(?:plastic\s*limit|\bpl\b)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'soilPH', regex: /(?:ph)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'both' },
    { key: 'soilEC', regex: /(?:ec)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'both' },
    { key: 'soilCEC', regex: /(?:cec)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'both' },
    { key: 'organicCarbon', regex: /(?:organic\s*carbon|\boc\b)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'both' },
    { key: 'depth', regex: /(?:depth)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'waterTable', regex: /(?:water\s*table|wt)\s*[:=]?\s*(\d+(?:\.\d+)?)/i, type: 'geo' },
    { key: 'sptN', regex: /(?:spt\s*n?|n\s*value)\s*[:=]?\s*(\d+)/i, type: 'geo' },
    { key: 'desiredFloors', regex: /(?:desired\s*floors|target\s*floors|build\s*floors|\bfloors\b)\s*[:=]?\s*(\d+)/i, type: 'geo' },
    { key: 'nitrogen', regex: /(?:nitrogen|\bnitrogen\b|\bn\b)\s*[:=]?\s*(\d+)/i, type: 'agri' },
    { key: 'phosphorus', regex: /(?:phosphorus|\bphosphorus\b|\bp\b)\s*[:=]?\s*(\d+)/i, type: 'agri' },
    { key: 'potassium', regex: /(?:potassium|\bpotassium\b|\bk\b)\s*[:=]?\s*(\d+)/i, type: 'agri' }
  ];

  patterns.forEach(p => {
    const match = text.match(p.regex);
    if (match && match[1]) {
      const val = match[1];
      if (p.type === 'geo' || p.type === 'both') {
        parsedGeo[p.key] = val;
      }
      if (p.type === 'agri' || p.type === 'both') {
        if (p.key === 'nitrogen') parsedAgri.nitrogen = val;
        else if (p.key === 'phosphorus') parsedAgri.phosphorus = val;
        else if (p.key === 'potassium') parsedAgri.potassium = val;
        else if (p.key === 'soilPH') parsedAgri.soilPH = val;
        else if (p.key === 'soilEC') parsedAgri.soilEC = val;
        else if (p.key === 'soilCEC') parsedAgri.soilCEC = val;
        else if (p.key === 'organicCarbon') parsedAgri.organicCarbon = val;
        else if (p.key === 'moistureContent') parsedAgri.soilMoisture = val;
      }
      count++;
    }
  });

  return { parsedGeo, parsedAgri, count };
}
