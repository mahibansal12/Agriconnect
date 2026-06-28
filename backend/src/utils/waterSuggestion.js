// Water-based crop suggestion — pure rule-based logic
// Suggests crops based on water availability and rainfall forecast

// Crop Data by Water Need 
const cropsByWater = {
    low: [
        {
            cropName:         "Bajra / Pearl Millet (बाजरा)",
            waterRequirement: "200-350mm",
            season:           "Kharif (June-September)",
            yieldPerAcre:     "8-12 quintal",
            profitPerAcre:    "₹12,000-22,000",
            duration:         "70-90 days",
            why:              "Extremely drought-tolerant. Thrives in low rainfall areas of Rajasthan, Gujarat, and Maharashtra.",
        },
        {
            cropName:         "Moong / Green Gram (मूंग)",
            waterRequirement: "300-350mm",
            season:           "Kharif / Zaid",
            yieldPerAcre:     "4-6 quintal",
            profitPerAcre:    "₹15,000-25,000",
            duration:         "60-75 days",
            why:              "Short duration and low water need. Ideal when water availability is uncertain.",
        },
        {
            cropName:         "Moth Bean (मोठ)",
            waterRequirement: "200-300mm",
            season:           "Kharif",
            yieldPerAcre:     "3-5 quintal",
            profitPerAcre:    "₹10,000-18,000",
            duration:         "60-75 days",
            why:              "One of the most drought-resistant crops. Grown widely in arid Rajasthan.",
        },
        {
            cropName:         "Sesame / Til (तिल)",
            waterRequirement: "250-350mm",
            season:           "Kharif",
            yieldPerAcre:     "3-5 quintal",
            profitPerAcre:    "₹14,000-24,000",
            duration:         "80-95 days",
            why:              "Highly drought-resistant oilseed. Requires little irrigation and yields well even in dry conditions.",
        },
        {
            cropName:         "Chickpea / Gram (चना)",
            waterRequirement: "300-400mm",
            season:           "Rabi (Oct-March)",
            yieldPerAcre:     "6-10 quintal",
            profitPerAcre:    "₹18,000-30,000",
            duration:         "90-120 days",
            why:              "Rabi crop that largely depends on residual soil moisture. Very suitable for limited irrigation conditions.",
        },
        {
            cropName:         "Mustard (सरसों)",
            waterRequirement: "250-400mm",
            season:           "Rabi (Oct-March)",
            yieldPerAcre:     "6-10 quintal",
            profitPerAcre:    "₹15,000-28,000",
            duration:         "90-110 days",
            why:              "Low water requirement. Managed well with just 2-3 irrigations or rain.",
        },
    ],

    medium: [
        {
            cropName:         "Wheat (गेहूं)",
            waterRequirement: "400-500mm",
            season:           "Rabi (Oct-March)",
            yieldPerAcre:     "12-18 quintal",
            profitPerAcre:    "₹25,000-40,000",
            duration:         "120-150 days",
            why:              "Needs 4-6 irrigations. Best suited for canal-irrigated areas of Punjab, Haryana, and UP.",
        },
        {
            cropName:         "Maize (मक्का)",
            waterRequirement: "500-800mm",
            season:           "Kharif / Rabi / Zaid",
            yieldPerAcre:     "15-25 quintal",
            profitPerAcre:    "₹20,000-38,000",
            duration:         "90-110 days",
            why:              "Moderate water requirement. Grows well with good rainfall or 4-5 irrigations.",
        },
        {
            cropName:         "Groundnut (मूंगफली)",
            waterRequirement: "500-600mm",
            season:           "Kharif",
            yieldPerAcre:     "6-10 quintal",
            profitPerAcre:    "₹20,000-35,000",
            duration:         "90-120 days",
            why:              "Moderate water need. Highly profitable oilseed with wide market demand.",
        },
        {
            cropName:         "Soybean (सोयाबीन)",
            waterRequirement: "450-700mm",
            season:           "Kharif",
            yieldPerAcre:     "8-12 quintal",
            profitPerAcre:    "₹18,000-30,000",
            duration:         "90-120 days",
            why:              "Well-suited for medium rainfall. Popular in MP, Maharashtra and Rajasthan.",
        },
        {
            cropName:         "Cotton (कपास)",
            waterRequirement: "700-1200mm",
            season:           "Kharif",
            yieldPerAcre:     "8-15 quintal",
            profitPerAcre:    "₹25,000-55,000",
            duration:         "150-180 days",
            why:              "Needs moderate to high water but is highly profitable. Grows best in black soil with drip irrigation.",
        },
        {
            cropName:         "Sunflower (सूरजमुखी)",
            waterRequirement: "400-600mm",
            season:           "Rabi / Kharif / Zaid",
            yieldPerAcre:     "6-10 quintal",
            profitPerAcre:    "₹16,000-28,000",
            duration:         "90-120 days",
            why:              "Moderate water need. Good option for off-season (zaid) when water is available.",
        },
    ],

    high: [
        {
            cropName:         "Rice / Paddy (धान)",
            waterRequirement: "1200-1800mm",
            season:           "Kharif",
            yieldPerAcre:     "15-25 quintal",
            profitPerAcre:    "₹20,000-45,000",
            duration:         "90-150 days",
            why:              "Requires standing water during most of its growth. Only viable with abundant water or high rainfall.",
        },
        {
            cropName:         "Sugarcane (गन्ना)",
            waterRequirement: "1500-2500mm",
            season:           "Year-round (planted Feb-March)",
            yieldPerAcre:     "250-400 quintal",
            profitPerAcre:    "₹50,000-1,00,000",
            duration:         "300-365 days",
            why:              "Highest water consumer but most profitable. Requires perennial irrigation. Best in UP, Maharashtra, Karnataka.",
        },
        {
            cropName:         "Banana (केला)",
            waterRequirement: "1200-2200mm",
            season:           "Year-round",
            yieldPerAcre:     "200-300 quintal",
            profitPerAcre:    "₹80,000-1,50,000",
            duration:         "300-365 days",
            why:              "Very high water requirement. Extremely profitable when water is consistently available.",
        },
        {
            cropName:         "Turmeric (हल्दी)",
            waterRequirement: "1200-1500mm",
            season:           "Kharif",
            yieldPerAcre:     "25-35 quintal",
            profitPerAcre:    "₹60,000-1,20,000",
            duration:         "210-240 days",
            why:              "Needs high and well-distributed moisture. Very high market value spice crop.",
        },
    ],
};

//  Main Function 
const getWaterBasedSuggestion = (waterAvailability, rainfallForecast, irrigationType) => {
    waterAvailability = waterAvailability?.toLowerCase().trim();  // low / medium / high
    rainfallForecast  = rainfallForecast?.toLowerCase().trim();   // low / moderate / heavy
    irrigationType    = irrigationType?.toLowerCase().trim();     // none / drip / canal / borewell / rain-fed

    if (!waterAvailability) {
        return { success: false, errors: ["waterAvailability is required (low / medium / high)"] };
    }

    // adjust water level based on rainfall forecast
    let effectiveLevel = waterAvailability;
    if (rainfallForecast === "heavy" && waterAvailability === "medium") effectiveLevel = "high";
    if (rainfallForecast === "low"   && waterAvailability === "medium") effectiveLevel = "low";
    if (rainfallForecast === "low"   && waterAvailability === "high")   effectiveLevel = "medium";

    const suggestions = cropsByWater[effectiveLevel];
    if (!suggestions) {
        return {
            success: false,
            errors: ["Invalid waterAvailability. Use: low / medium / high"],
        };
    }

    // irrigation type tip
    const irrigationTips = {
        drip:     "Drip irrigation can increase effective water availability by 30-40%. Consider medium water crops even with low availability.",
        canal:    "Canal water is seasonal. Plan crops based on canal schedule — avoid year-long crops like sugarcane if canal is unreliable.",
        borewell: "Borewell gives consistent water but may reduce over years. Prefer medium-water crops to ensure sustainability.",
        "rain-fed": "Rain-fed farming is risky. Stick to low or medium water crops with drought tolerance.",
        none:     "Without irrigation, only rain-fed low-water crops are viable. Consider soil moisture conservation techniques (mulching).",
    };

    const labels = { low: "Low Water", medium: "Medium Water", high: "High Water (Irrigated)" };

    return {
        success: true,
        inputSummary: {
            waterAvailability,
            rainfallForecast:  rainfallForecast || "not specified",
            irrigationType:    irrigationType   || "not specified",
            effectiveWaterLevel: effectiveLevel,
        },
        irrigationTip: irrigationTips[irrigationType] || null,
        category: labels[effectiveLevel],
        suggestions: suggestions.slice(0, 4),
    };
};

export { getWaterBasedSuggestion };