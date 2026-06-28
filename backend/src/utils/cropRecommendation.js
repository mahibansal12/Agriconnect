// Pure rule-based crop recommendation logic
// No DB calls — just agricultural data + input matching

//       Crop Database 
const cropDatabase = {
    wheat: {
        displayName: "Wheat (गेहूं)",
        season: ["rabi"],
        soilTypes: ["loam", "clay loam", "alluvial", "sandy loam", "black"],
        waterNeed: "medium",
        depletes: "nitrogen",
        yieldPerAcre: "12-18 quintal",
        profitPerAcre: "₹25,000-40,000",
        waterRequirement: "400-500mm",
        duration: "120-150 days",
    },
    rice: {
        displayName: "Rice (धान)",
        season: ["kharif"],
        soilTypes: ["clay", "alluvial", "loam", "clay loam"],
        waterNeed: "high",
        depletes: "potassium",
        yieldPerAcre: "15-25 quintal",
        profitPerAcre: "₹20,000-45,000",
        waterRequirement: "1200-1800mm",
        duration: "90-150 days",
    },
    moong: {
        displayName: "Moong / Green Gram (मूंग)",
        season: ["kharif", "zaid"],
        soilTypes: ["sandy loam", "loam", "alluvial", "red"],
        waterNeed: "low",
        depletes: "none",
        fixes: "nitrogen",
        yieldPerAcre: "4-6 quintal",
        profitPerAcre: "₹15,000-25,000",
        waterRequirement: "300-350mm",
        duration: "60-75 days",
    },
    groundnut: {
        displayName: "Groundnut (मूंगफली)",
        season: ["kharif"],
        soilTypes: ["sandy loam", "red", "loam", "alluvial"],
        waterNeed: "medium",
        depletes: "none",
        fixes: "nitrogen",
        yieldPerAcre: "6-10 quintal",
        profitPerAcre: "₹20,000-35,000",
        waterRequirement: "500-600mm",
        duration: "90-120 days",
    },
    soybean: {
        displayName: "Soybean (सोयाबीन)",
        season: ["kharif"],
        soilTypes: ["loam", "clay loam", "black", "alluvial"],
        waterNeed: "medium",
        depletes: "none",
        fixes: "nitrogen",
        yieldPerAcre: "8-12 quintal",
        profitPerAcre: "₹18,000-30,000",
        waterRequirement: "450-700mm",
        duration: "90-120 days",
    },
    maize: {
        displayName: "Maize (मक्का)",
        season: ["kharif", "rabi", "zaid"],
        soilTypes: ["loam", "sandy loam", "alluvial", "clay loam"],
        waterNeed: "medium",
        depletes: "nitrogen",
        yieldPerAcre: "15-25 quintal",
        profitPerAcre: "₹20,000-38,000",
        waterRequirement: "500-800mm",
        duration: "90-110 days",
    },
    mustard: {
        displayName: "Mustard (सरसों)",
        season: ["rabi"],
        soilTypes: ["loam", "sandy loam", "alluvial", "clay loam"],
        waterNeed: "low",
        depletes: "sulphur",
        yieldPerAcre: "6-10 quintal",
        profitPerAcre: "₹15,000-28,000",
        waterRequirement: "250-400mm",
        duration: "90-110 days",
    },
    chickpea: {
        displayName: "Chickpea / Gram (चना)",
        season: ["rabi"],
        soilTypes: ["sandy loam", "loam", "clay loam", "black", "red"],
        waterNeed: "low",
        depletes: "none",
        fixes: "nitrogen",
        yieldPerAcre: "6-10 quintal",
        profitPerAcre: "₹18,000-30,000",
        waterRequirement: "300-400mm",
        duration: "90-120 days",
    },
    lentil: {
        displayName: "Lentil (मसूर)",
        season: ["rabi"],
        soilTypes: ["loam", "clay loam", "alluvial", "sandy loam"],
        waterNeed: "low",
        depletes: "none",
        fixes: "nitrogen",
        yieldPerAcre: "5-8 quintal",
        profitPerAcre: "₹14,000-22,000",
        waterRequirement: "250-350mm",
        duration: "90-110 days",
    },
    cotton: {
        displayName: "Cotton (कपास)",
        season: ["kharif"],
        soilTypes: ["black", "clay", "clay loam", "alluvial"],
        waterNeed: "medium",
        depletes: "potassium",
        yieldPerAcre: "8-15 quintal",
        profitPerAcre: "₹25,000-55,000",
        waterRequirement: "700-1200mm",
        duration: "150-180 days",
    },
    bajra: {
        displayName: "Bajra / Pearl Millet (बाजरा)",
        season: ["kharif"],
        soilTypes: ["sandy loam", "red", "loam", "sandy"],
        waterNeed: "low",
        depletes: "none",
        yieldPerAcre: "8-12 quintal",
        profitPerAcre: "₹12,000-22,000",
        waterRequirement: "200-350mm",
        duration: "70-90 days",
    },
    sugarcane: {
        displayName: "Sugarcane (गन्ना)",
        season: ["kharif", "rabi"],
        soilTypes: ["loam", "clay loam", "alluvial", "clay"],
        waterNeed: "high",
        depletes: "nitrogen potassium",
        yieldPerAcre: "250-400 quintal",
        profitPerAcre: "₹50,000-1,00,000",
        waterRequirement: "1500-2500mm",
        duration: "300-365 days",
    },
    sunflower: {
        displayName: "Sunflower (सूरजमुखी)",
        season: ["kharif", "rabi", "zaid"],
        soilTypes: ["loam", "sandy loam", "alluvial", "clay loam"],
        waterNeed: "medium",
        depletes: "none",
        yieldPerAcre: "6-10 quintal",
        profitPerAcre: "₹16,000-28,000",
        waterRequirement: "400-600mm",
        duration: "90-120 days",
    },
    turmeric: {
        displayName: "Turmeric (हल्दी)",
        season: ["kharif"],
        soilTypes: ["loam", "clay loam", "red", "alluvial"],
        waterNeed: "medium",
        depletes: "none",
        yieldPerAcre: "25-35 quintal",
        profitPerAcre: "₹60,000-1,20,000",
        waterRequirement: "1200-1500mm",
        duration: "210-240 days",
    },
};

// Crop Rotation Rules 
// Based on soil nutrient replenishment and pest break cycle
const rotationRules = {
    wheat:     { next: ["moong", "groundnut", "soybean", "maize", "cotton"],    reason: "Wheat depletes nitrogen. Follow with legumes (moong, groundnut, soybean) to naturally replenish nitrogen and break pest cycles." },
    rice:      { next: ["wheat", "mustard", "chickpea", "lentil", "sunflower"], reason: "Rice depletes potassium and leaves high moisture. Rabi crops like wheat and mustard thrive after rice harvest." },
    maize:     { next: ["chickpea", "lentil", "mustard", "wheat", "moong"],     reason: "Maize is a heavy nitrogen feeder. Follow with nitrogen-fixing legumes or rabi crops to restore soil fertility." },
    cotton:    { next: ["wheat", "chickpea", "sunflower", "lentil", "mustard"], reason: "Cotton is a long-duration crop. Rabi crops after cotton make efficient use of residual moisture and nutrients." },
    sugarcane: { next: ["wheat", "mustard", "lentil", "chickpea", "moong"],     reason: "Sugarcane exhausts the soil heavily. Short-duration rabi crops restore structure and allow soil to recover." },
    moong:     { next: ["wheat", "rice", "maize", "cotton", "sugarcane"],       reason: "Moong fixes nitrogen. Any subsequent crop benefits from improved soil fertility." },
    groundnut: { next: ["wheat", "maize", "cotton", "rice", "sorghum"],         reason: "Groundnut fixes nitrogen and improves soil structure. Heavy feeders like wheat and maize benefit greatly." },
    soybean:   { next: ["wheat", "maize", "sugarcane", "cotton", "rice"],       reason: "Soybean enriches soil with nitrogen. Follow with any cereal or cash crop for maximum benefit." },
    chickpea:  { next: ["rice", "maize", "cotton", "wheat", "sugarcane"],       reason: "Chickpea leaves soil nitrogen-rich. Ideal to follow with heavy-feeding crops." },
    mustard:   { next: ["moong", "rice", "maize", "groundnut", "soybean"],      reason: "Mustard suppresses weeds naturally. Kharif crops after mustard benefit from weed-free soil." },
    bajra:     { next: ["chickpea", "mustard", "wheat", "lentil", "moong"],     reason: "Bajra improves drainage in sandy soils. Rabi legumes after bajra restore nutrients efficiently." },
    lentil:    { next: ["rice", "maize", "cotton", "wheat", "sunflower"],       reason: "Lentil fixes nitrogen. High-demand crops grown after lentil show significantly better yields." },
};

//  Main Recommendation Function 

const getRecommendation = (previousCrop, soilType, season, waterAvailability, landSize = 1) => {
    previousCrop = previousCrop?.toLowerCase().trim();
    soilType     = soilType?.toLowerCase().trim();
    season       = season?.toLowerCase().trim();
    waterAvailability = waterAvailability?.toLowerCase().trim(); // low / medium / high

    const errors = [];
    if (!previousCrop)     errors.push("previousCrop is required");
    if (!soilType)         errors.push("soilType is required");
    if (!season)           errors.push("season is required");
    if (!waterAvailability) errors.push("waterAvailability is required");
    if (errors.length)     return { success: false, errors };

    const rotation = rotationRules[previousCrop];
    if (!rotation) {
        return {
            success: false,
            errors: [`No rotation rules found for '${previousCrop}'. Supported crops: ${Object.keys(rotationRules).join(", ")}`],
        };
    }

    // filter suggested crops by season, soil, and water availability
    const waterMap = { low: 1, medium: 2, high: 3 };
    const waterLevel = waterMap[waterAvailability] || 2;

    const candidates = rotation.next
        .map((cropKey) => cropDatabase[cropKey])
        .filter(Boolean)
        .filter((crop) => {
            const seasonMatch = crop.season.includes(season);
            const soilMatch   = crop.soilTypes.some(
                (s) => soilType.includes(s) || s.includes(soilType)
            );
            const cropWater   = waterMap[crop.waterNeed] || 2;
            const waterMatch  = cropWater <= waterLevel;
            return seasonMatch && soilMatch && waterMatch;
        });

    // fallback — if strict filter gives nothing, relax soil filter
    const results = candidates.length
        ? candidates
        : rotation.next
              .map((k) => cropDatabase[k])
              .filter(Boolean)
              .filter((c) => c.season.includes(season));

    if (!results.length) {
        return {
            success: false,
            errors: [`No suitable crops found for season '${season}' after '${previousCrop}'. Try a different season.`],
        };
    }

    return {
        success: true,
        previousCrop,
        rotationReason: rotation.reason,
        landSize: `${landSize} acre`,
        recommendations: results.slice(0, 3).map((crop) => ({
            cropName:         crop.displayName,
            season:           crop.season.join(" / "),
            soilTypes:        crop.soilTypes.join(", "),
            waterRequirement: crop.waterRequirement,
            duration:         crop.duration,
            expectedYield:    scaleByLand(crop.yieldPerAcre, landSize),
            estimatedProfit:  scaleProfit(crop.profitPerAcre, landSize),
        })),
    };
};

//  Helpers 
const scaleByLand = (yieldStr, landSize) => {
    if (landSize === 1) return `${yieldStr} per acre`;
    const [min, max] = yieldStr.split("-").map((v) => parseFloat(v) * landSize);
    const unit = yieldStr.includes("quintal") ? "quintal" : yieldStr.split(" ").pop();
    return `${min.toFixed(0)}-${max.toFixed(0)} ${unit} (for ${landSize} acres)`;
};

const scaleProfit = (profitStr, landSize) => {
    if (landSize === 1) return `${profitStr} per acre`;
    const nums = profitStr.match(/[\d,]+/g).map((n) => parseInt(n.replace(/,/g, "")) * landSize);
    return `₹${nums[0].toLocaleString("en-IN")}-${nums[1].toLocaleString("en-IN")} (for ${landSize} acres)`;
};

export { getRecommendation };