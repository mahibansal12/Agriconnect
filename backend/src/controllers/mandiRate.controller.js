// src/controllers/mandiRate.controller.js

import { MandiRate } from "../models/mandiRate.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fetchMandiRates } from "../services/mandi.service.js";


const getLiveMandiRates = asyncHandler(async (req, res) => {
    const { state, commodity, limit } = req.query;

    const records = await fetchMandiRates({
        state,
        commodity,
        limit: limit ? parseInt(limit) : 20,
    });

    if (!records || records.length === 0) {
        throw new ApiError(404, "No mandi rates found for given filters");
    }

    
    const rates = records.map((record) => ({
        cropName: record.commodity,
        mandiName: record.market,
        state: record.state,
        district: record.district,
        minPrice: record.min_price,
        maxPrice: record.max_price,
        modalPrice: record.modal_price,
        date: record.arrival_date,
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, rates, "Live mandi rates fetched successfully"));
});


const saveMandiRates = asyncHandler(async (req, res) => {
    const { state, commodity } = req.body;

    const records = await fetchMandiRates({ state, commodity, limit: 50 });

    if (!records || records.length === 0) {
        throw new ApiError(404, "No records found to save");
    }

    
    const ratesToSave = records.map((record) => ({
        cropName: record.commodity,
        mandiName: record.market,
        state: record.state,
        district: record.district,
        minPrice: record.min_price,
        maxPrice: record.max_price,
        modalPrice: record.modal_price,
        date: new Date(record.arrival_date),
    }));

    
    await MandiRate.insertMany(ratesToSave);

    return res
        .status(201)
        .json(new ApiResponse(201, {}, `${ratesToSave.length} mandi rates saved successfully`));
});


const getSavedMandiRates = asyncHandler(async (req, res) => {
    const { state, cropName } = req.query;

    const filter = {};
    if (state) filter.state = state;
    if (cropName) filter.cropName = cropName;

    const rates = await MandiRate.find(filter)
        .sort({ date: -1 })
        .limit(50);

    return res
        .status(200)
        .json(new ApiResponse(200, rates, "Saved mandi rates fetched successfully"));
});


const getAvailableStates = asyncHandler(async (req, res) => {
    const states = await MandiRate.distinct("state");

    return res
        .status(200)
        .json(new ApiResponse(200, states, "States fetched successfully"));
});

export {
    getLiveMandiRates,
    saveMandiRates,
    getSavedMandiRates,
    getAvailableStates,
};