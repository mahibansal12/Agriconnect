import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getRecommendation } from "../utils/cropRecommendation.js";
import { getWaterBasedSuggestion } from "../utils/waterSuggestion.js";
import { getSeedRecommendation } from "../utils/seedRecommendation.js";

// Crop Recommendation 
// POST /api/v1/recommend/crop
// Public
const recommendCrop = asyncHandler(async (req, res) => {
    const {
        previousCrop,
        soilType,
        season,
        waterAvailability,
        landSize,
    } = req.body;

    const result = getRecommendation(
        previousCrop,
        soilType,
        season,
        waterAvailability,
        landSize
    );

    if (!result.success) {
        throw new ApiError(400, result.errors.join(", "));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Crop recommendations fetched"));
});

//  Water Based Crop Suggestion 
// POST /api/v1/recommend/water
// Public
const recommendByWater = asyncHandler(async (req, res) => {
    const {
        waterAvailability,
        rainfallForecast,
        irrigationType,
    } = req.body;

    const result = getWaterBasedSuggestion(
        waterAvailability,
        rainfallForecast,
        irrigationType
    );

    if (!result.success) {
        throw new ApiError(400, result.errors.join(", "));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Water-based crop suggestions fetched"));
});

//  Seed Recommendation 
// POST /api/v1/recommend/seed
// Public
const recommendSeed = asyncHandler(async (req, res) => {
    const {
        rainfallForecast,
        soilType,
        waterAvailability,
        region,
    } = req.body;

    const result = getSeedRecommendation(
        rainfallForecast,
        soilType,
        waterAvailability,
        region
    );

    if (!result.success) {
        throw new ApiError(400, result.errors.join(", "));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Seed recommendations fetched"));
});

export { recommendCrop, recommendByWater, recommendSeed };