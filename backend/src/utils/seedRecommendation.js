// Seed recommendation engine — pure rule-based logic
// Suggests specific seed varieties based on region, soil, rainfall, water

//Seed Database 
const seedDatabase = {
    // Bajra / Pearl Millet 
    "HHB-67 Bajra": {
        crop:             "Bajra (बाजरा)",
        variety:          "HHB-67 (Improved)",
        type:             "drought-resistant",
        soilTypes:        ["sandy loam", "sandy", "red", "loam"],
        rainfallNeeded:   "low",       // < 400mm
        waterNeed:        "low",
        regions:          ["rajasthan", "gujarat", "haryana", "punjab", "maharashtra"],
        season:           "Kharif (June-July sowing)",
        seedRate:         "1.5-2 kg per acre",
        duration:         "65-70 days",
        yieldPerAcre:     "10-14 quintal",
        price:            "₹180-250 per kg",
        features:         ["Drought tolerant", "Early maturing", "Downy mildew resistant"],
        govtApproved:     true,
    },
    "Kaveri Super Boss Bajra": {
        crop:             "Bajra (बाजरा)",
        variety:          "Kaveri Super Boss (Hybrid)",
        type:             "drought-resistant",
        soilTypes:        ["sandy loam", "loam", "red"],
        rainfallNeeded:   "low",
        waterNeed:        "low",
        regions:          ["rajasthan", "gujarat", "maharashtra", "andhra pradesh", "telangana"],
        season:           "Kharif",
        seedRate:         "1.5 kg per acre",
        duration:         "72-78 days",
        yieldPerAcre:     "12-16 quintal",
        price:            "₹280-350 per kg",
        features:         ["High yield hybrid", "Thick stem", "Bold grains", "Drought resistant"],
        govtApproved:     false,
    },

    // Moong / Green Gram 
    "Pusa Vishal Moong": {
        crop:             "Moong (मूंग)",
        variety:          "Pusa Vishal",
        type:             "short-duration",
        soilTypes:        ["sandy loam", "loam", "alluvial"],
        rainfallNeeded:   "low",
        waterNeed:        "low",
        regions:          ["rajasthan", "up", "haryana", "punjab", "mp"],
        season:           "Kharif / Zaid",
        seedRate:         "6-8 kg per acre",
        duration:         "60-65 days",
        yieldPerAcre:     "5-7 quintal",
        price:            "₹120-180 per kg",
        features:         ["Short duration", "High protein", "Yellow mosaic virus resistant"],
        govtApproved:     true,
    },
    "SML-668 Moong": {
        crop:             "Moong (मूंग)",
        variety:          "SML-668",
        type:             "short-duration",
        soilTypes:        ["sandy loam", "loam", "red", "alluvial"],
        rainfallNeeded:   "low",
        waterNeed:        "low",
        regions:          ["rajasthan", "haryana", "punjab", "up"],
        season:           "Kharif / Zaid",
        seedRate:         "6-8 kg per acre",
        duration:         "62-68 days",
        yieldPerAcre:     "4-6 quintal",
        price:            "₹100-150 per kg",
        features:         ["Extra early", "Synchronous maturity", "Suitable for multiple cuttings"],
        govtApproved:     true,
    },

    //  Wheat 
    "HD-3086 Wheat": {
        crop:             "Wheat (गेहूं)",
        variety:          "HD-3086 (Malav Shakti)",
        type:             "high-yield",
        soilTypes:        ["loam", "clay loam", "alluvial", "sandy loam"],
        rainfallNeeded:   "medium",
        waterNeed:        "medium",
        regions:          ["up", "mp", "rajasthan", "haryana", "punjab"],
        season:           "Rabi (Nov sowing)",
        seedRate:         "40-45 kg per acre",
        duration:         "115-120 days",
        yieldPerAcre:     "16-22 quintal",
        price:            "₹55-75 per kg",
        features:         ["Rust resistant", "Heat tolerant", "High yield", "Good chapati quality"],
        govtApproved:     true,
    },
    "GW-496 Wheat": {
        crop:             "Wheat (गेहूं)",
        variety:          "GW-496",
        type:             "drought-tolerant",
        soilTypes:        ["loam", "sandy loam", "clay loam"],
        rainfallNeeded:   "low",
        waterNeed:        "low",
        regions:          ["rajasthan", "gujarat", "mp"],
        season:           "Rabi",
        seedRate:         "40-45 kg per acre",
        duration:         "110-118 days",
        yieldPerAcre:     "14-18 quintal",
        price:            "₹50-70 per kg",
        features:         ["Drought tolerant", "Less irrigation needed", "Heat tolerant"],
        govtApproved:     true,
    },

    // Rice 
    "Pusa Basmati 1121": {
        crop:             "Rice (धान)",
        variety:          "Pusa Basmati 1121",
        type:             "premium basmati",
        soilTypes:        ["alluvial", "clay loam", "loam"],
        rainfallNeeded:   "high",
        waterNeed:        "high",
        regions:          ["punjab", "haryana", "up", "uttarakhand", "delhi"],
        season:           "Kharif (June-July)",
        seedRate:         "4-5 kg per acre",
        duration:         "140-145 days",
        yieldPerAcre:     "12-16 quintal",
        price:            "₹180-250 per kg",
        features:         ["Extra long grain", "Premium export quality", "High aroma"],
        govtApproved:     true,
    },
    "Swarna Sub1 Rice": {
        crop:             "Rice (धान)",
        variety:          "Swarna Sub1 (Flood tolerant)",
        type:             "flood-tolerant",
        soilTypes:        ["clay", "alluvial", "clay loam"],
        rainfallNeeded:   "high",
        waterNeed:        "high",
        regions:          ["bihar", "up", "wb", "odisha", "assam"],
        season:           "Kharif",
        seedRate:         "8-10 kg per acre",
        duration:         "130-140 days",
        yieldPerAcre:     "14-20 quintal",
        price:            "₹60-90 per kg",
        features:         ["Flood tolerant up to 2 weeks", "High yield", "Blast resistant"],
        govtApproved:     true,
    },

    // Soybean 
    "JS-335 Soybean": {
        crop:             "Soybean (सोयाबीन)",
        variety:          "JS-335",
        type:             "high-yield",
        soilTypes:        ["loam", "clay loam", "black", "alluvial"],
        rainfallNeeded:   "medium",
        waterNeed:        "medium",
        regions:          ["mp", "maharashtra", "rajasthan", "chhattisgarh"],
        season:           "Kharif (June-July)",
        seedRate:         "25-30 kg per acre",
        duration:         "90-100 days",
        yieldPerAcre:     "10-14 quintal",
        price:            "₹70-100 per kg",
        features:         ["Most popular variety", "Suitable for all soil types", "Disease resistant"],
        govtApproved:     true,
    },

    // Mustard 
    "Pusa Bold Mustard": {
        crop:             "Mustard (सरसों)",
        variety:          "Pusa Bold",
        type:             "high-yield",
        soilTypes:        ["loam", "sandy loam", "alluvial", "clay loam"],
        rainfallNeeded:   "low",
        waterNeed:        "low",
        regions:          ["rajasthan", "haryana", "up", "punjab", "mp"],
        season:           "Rabi (Oct-Nov)",
        seedRate:         "1.5-2 kg per acre",
        duration:         "110-120 days",
        yieldPerAcre:     "8-12 quintal",
        price:            "₹250-350 per kg",
        features:         ["Large seed size", "High oil content (42%)", "Aphid tolerant"],
        govtApproved:     true,
    },

    //  Cotton 
    "Bollgard II Cotton": {
        crop:             "Cotton (कपास)",
        variety:          "Bollgard II (BG-II Bt)",
        type:             "bt-cotton",
        soilTypes:        ["black", "clay", "clay loam", "alluvial"],
        rainfallNeeded:   "medium",
        waterNeed:        "medium",
        regions:          ["gujarat", "maharashtra", "telangana", "punjab", "haryana"],
        season:           "Kharif (April-June)",
        seedRate:         "750g-1 kg per acre",
        duration:         "150-180 days",
        yieldPerAcre:     "10-18 quintal",
        price:            "₹800-1200 per packet (450g)",
        features:         ["Bollworm resistant", "Less pesticide needed", "High yield"],
        govtApproved:     true,
    },

    //  Chickpea 
    "JG-11 Chickpea": {
        crop:             "Chickpea / Gram (चना)",
        variety:          "JG-11 (Desi)",
        type:             "drought-tolerant",
        soilTypes:        ["sandy loam", "loam", "clay loam", "black"],
        rainfallNeeded:   "low",
        waterNeed:        "low",
        regions:          ["mp", "rajasthan", "maharashtra", "up", "andhra pradesh"],
        season:           "Rabi (Oct-Nov)",
        seedRate:         "30-35 kg per acre",
        duration:         "90-100 days",
        yieldPerAcre:     "8-12 quintal",
        price:            "₹60-90 per kg",
        features:         ["Wilt resistant", "Large seed size", "High yield desi variety"],
        govtApproved:     true,
    },
};

//  Main Function 
const getSeedRecommendation = (rainfallForecast, soilType, waterAvailability, region) => {
    rainfallForecast  = rainfallForecast?.toLowerCase().trim();   // low / moderate / heavy
    soilType          = soilType?.toLowerCase().trim();
    waterAvailability = waterAvailability?.toLowerCase().trim();  // low / medium / high
    region            = region?.toLowerCase().trim();

    if (!rainfallForecast || !soilType || !waterAvailability) {
        return {
            success: false,
            errors: ["rainfallForecast, soilType and waterAvailability are required"],
        };
    }

    // map rainfall forecast to water level
    const rainfallMap = { low: "low", moderate: "medium", heavy: "high" };
    const rainfallLevel = rainfallMap[rainfallForecast] || "medium";

    // effective water = combine rainfall and declared availability
    const waterMap   = { low: 1, medium: 2, high: 3 };
    const effective  = Math.max(waterMap[rainfallLevel], waterMap[waterAvailability] || 2);
    const effectiveLevelStr = Object.keys(waterMap).find((k) => waterMap[k] === effective) || "medium";

    const matched = Object.entries(seedDatabase)
        .filter(([, seed]) => {
            const waterMatch    = seed.waterNeed === effectiveLevelStr || seed.rainfallNeeded === effectiveLevelStr;
            const soilMatch     = seed.soilTypes.some((s) => soilType.includes(s) || s.includes(soilType));
            const regionMatch   = !region || seed.regions.some((r) => region.includes(r) || r.includes(region));
            return waterMatch && (soilMatch || regionMatch);
        })
        .map(([name, seed]) => ({ seedName: name, ...seed }));

    // fallback: relax soil filter, keep water match
    const results = matched.length
        ? matched
        : Object.entries(seedDatabase)
              .filter(([, seed]) => seed.waterNeed === effectiveLevelStr || seed.rainfallNeeded === effectiveLevelStr)
              .map(([name, seed]) => ({ seedName: name, ...seed }));

    if (!results.length) {
        return {
            success: false,
            errors: ["No seeds found for the given inputs. Try different soil type or rainfall."],
        };
    }

    return {
        success: true,
        inputSummary: {
            rainfallForecast,
            soilType,
            waterAvailability,
            region: region || "all regions",
            effectiveWaterLevel: effectiveLevelStr,
        },
        recommendations: results.slice(0, 4).map((s) => ({
            seedName:       s.seedName,
            crop:           s.crop,
            variety:        s.variety,
            type:           s.type,
            season:         s.season,
            seedRate:       s.seedRate,
            duration:       s.duration,
            yieldPerAcre:   s.yieldPerAcre,
            price:          s.price,
            features:       s.features,
            suitableFor:    s.regions.join(", "),
            govtApproved:   s.govtApproved,
        })),
    };
};

export { getSeedRecommendation };