// src/controllers/scheme.controller.js

import { Scheme } from "../models/scheme.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/v1/schemes
// public — farmers browse govt schemes
const getAllSchemes = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const filter = {};
    if (category) filter.category = category;

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, schemes, "Schemes fetched successfully"));
});

// GET /api/v1/schemes/:id
// public
const getSchemeById = asyncHandler(async (req, res) => {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
        throw new ApiError(404, "Scheme not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, scheme, "Scheme fetched successfully"));
});

// POST /api/v1/schemes
// admin only
const createScheme = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        eligibility,
        benefits,
        applicationLink,
        lastDate,
        category,
    } = req.body;

    if (!title || !description || !eligibility || !benefits || !category) {
        throw new ApiError(400, "Title, description, eligibility, benefits and category are required");
    }

    const scheme = await Scheme.create({
        title,
        description,
        eligibility,
        benefits,
        applicationLink,
        lastDate,
        category,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, scheme, "Scheme created successfully"));
});

// PATCH /api/v1/schemes/:id
// admin only
const updateScheme = asyncHandler(async (req, res) => {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
        throw new ApiError(404, "Scheme not found");
    }

    const updated = await Scheme.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Scheme updated successfully"));
});

// DELETE /api/v1/schemes/:id
// admin only
const deleteScheme = asyncHandler(async (req, res) => {
    const scheme = await Scheme.findById(req.params.id);

    if (!scheme) {
        throw new ApiError(404, "Scheme not found");
    }

    await Scheme.findByIdAndDelete(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Scheme deleted successfully"));
});

export {
    getAllSchemes,
    getSchemeById,
    createScheme,
    updateScheme,
    deleteScheme,
};