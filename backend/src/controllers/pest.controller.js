// src/controllers/pest.controller.js

import { Pest } from "../models/pest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllPests = asyncHandler(async (req, res) => {
    const { type } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const pests = await Pest.find(filter).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, pests, "Pests fetched successfully"));
});


const getPestById = asyncHandler(async (req, res) => {
    const pest = await Pest.findById(req.params.id);

    if (!pest) {
        throw new ApiError(404, "Pest not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, pest, "Pest fetched successfully"));
});


const getPestsByCrop = asyncHandler(async (req, res) => {
    const { cropName } = req.params;

    const pests = await Pest.find({
        affectedCrops: { $in: [cropName] }
    }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, pests, "Pests fetched successfully"));
});


const createPest = asyncHandler(async (req, res) => {
    const {
        name,
        type,
        affectedCrops,
        symptoms,
        treatment,
        prevention,
    } = req.body;

    if (!name || !type || !symptoms || !treatment) {
        throw new ApiError(400, "Name, type, symptoms and treatment are required");
    }

    let imageUrl = "";
    const imageLocalPath = req.file?.path;
    if (imageLocalPath) {
        const uploaded = await uploadOnCloudinary(imageLocalPath);
        imageUrl = uploaded?.url || "";
    }

    const pest = await Pest.create({
        name,
        type,
        // affectedCrops comes as comma separated string from form
        // so we split it into array
        affectedCrops: typeof affectedCrops === "string"
            ? affectedCrops.split(",").map(c => c.trim())
            : affectedCrops,
        symptoms,
        treatment,
        prevention,
        image: imageUrl,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, pest, "Pest created successfully"));
});


const updatePest = asyncHandler(async (req, res) => {
    const pest = await Pest.findById(req.params.id);

    if (!pest) {
        throw new ApiError(404, "Pest not found");
    }

    const updated = await Pest.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Pest updated successfully"));
});


const deletePest = asyncHandler(async (req, res) => {
    const pest = await Pest.findById(req.params.id);

    if (!pest) {
        throw new ApiError(404, "Pest not found");
    }

    await Pest.findByIdAndDelete(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Pest deleted successfully"));
});

export {
    getAllPests,
    getPestById,
    getPestsByCrop,
    createPest,
    updatePest,
    deletePest,
};