// src/controllers/cropKnowledge.controller.js

import { CropKnowledge } from "../models/cropKnowledge.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllCrops = asyncHandler(async (req, res) => {
    const { category, season } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (season) filter.season = season;

    const crops = await CropKnowledge.find(filter).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, crops, "Crops fetched successfully"));
});


const getCropById = asyncHandler(async (req, res) => {
    const crop = await CropKnowledge.findById(req.params.id);

    if (!crop) {
        throw new ApiError(404, "Crop not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, crop, "Crop fetched successfully"));
});


const createCrop = asyncHandler(async (req, res) => {
    const {
        name,
        localName,
        scientificName,
        category,
        season,
        description,
        growingGuide,
        fertilizerGuide,
        irrigationGuide,
        diseaseManagement,
        harvestInfo,
    } = req.body;

    if (!name || !category || !season) {
        throw new ApiError(400, "Name, category and season are required");
    }

    // upload image if provided
    let imageUrl = "";
    const imageLocalPath = req.file?.path;
    if (imageLocalPath) {
        const uploaded = await uploadOnCloudinary(imageLocalPath);
        imageUrl = uploaded?.url || "";
    }

    const crop = await CropKnowledge.create({
        name,
        localName,
        scientificName,
        category,
        season,
        description,
        image: imageUrl,
       
        growingGuide: growingGuide
            ? typeof growingGuide === "string"
                ? JSON.parse(growingGuide)
                : growingGuide
            : {},
        fertilizerGuide: fertilizerGuide
            ? typeof fertilizerGuide === "string"
                ? JSON.parse(fertilizerGuide)
                : fertilizerGuide
            : [],
        irrigationGuide: irrigationGuide
            ? typeof irrigationGuide === "string"
                ? JSON.parse(irrigationGuide)
                : irrigationGuide
            : {},
        diseaseManagement: diseaseManagement
            ? typeof diseaseManagement === "string"
                ? JSON.parse(diseaseManagement)
                : diseaseManagement
            : [],
        harvestInfo: harvestInfo
            ? typeof harvestInfo === "string"
                ? JSON.parse(harvestInfo)
                : harvestInfo
            : {},
    });

    return res
        .status(201)
        .json(new ApiResponse(201, crop, "Crop created successfully"));
});


const updateCrop = asyncHandler(async (req, res) => {
    const crop = await CropKnowledge.findById(req.params.id);

    if (!crop) {
        throw new ApiError(404, "Crop not found");
    }

    
    const updateData = { ...req.body };
    const nestedFields = [
        "growingGuide",
        "fertilizerGuide",
        "irrigationGuide",
        "diseaseManagement",
        "harvestInfo",
    ];
    nestedFields.forEach((field) => {
        if (updateData[field] && typeof updateData[field] === "string") {
            updateData[field] = JSON.parse(updateData[field]);
        }
    });

    const updated = await CropKnowledge.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Crop updated successfully"));
});


const deleteCrop = asyncHandler(async (req, res) => {
    const crop = await CropKnowledge.findById(req.params.id);

    if (!crop) {
        throw new ApiError(404, "Crop not found");
    }

    await CropKnowledge.findByIdAndDelete(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Crop deleted successfully"));
});

export {
    getAllCrops,
    getCropById,
    createCrop,
    updateCrop,
    deleteCrop,
};