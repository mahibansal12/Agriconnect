// src/controllers/cropCalendar.controller.js

import { CropCalendar } from "../models/cropCalendar.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllCalendarEntries = asyncHandler(async (req, res) => {
    const { cropName, month } = req.query;

    const filter = {};
    if (cropName) filter.cropName = cropName;
    if (month) filter.month = parseInt(month);

    const entries = await CropCalendar.find(filter)
        .populate("createdBy", "name")
        .sort({ month: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, entries, "Calendar entries fetched successfully"));
});


const getCalendarEntryById = asyncHandler(async (req, res) => {
    const entry = await CropCalendar.findById(req.params.id)
        .populate("createdBy", "name");

    if (!entry) {
        throw new ApiError(404, "Calendar entry not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, entry, "Calendar entry fetched successfully"));
});


const createCalendarEntry = asyncHandler(async (req, res) => {
    const { cropName, activity, month, notes } = req.body;

    if (!cropName || !activity || !month) {
        throw new ApiError(400, "Crop name, activity and month are required");
    }

    const entry = await CropCalendar.create({
        cropName,
        activity,
        month,
        notes,
        createdBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, entry, "Calendar entry created successfully"));
});


const updateCalendarEntry = asyncHandler(async (req, res) => {
    const entry = await CropCalendar.findById(req.params.id);

    if (!entry) {
        throw new ApiError(404, "Calendar entry not found");
    }

    const updated = await CropCalendar.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Calendar entry updated successfully"));
});


const deleteCalendarEntry = asyncHandler(async (req, res) => {
    const entry = await CropCalendar.findById(req.params.id);

    if (!entry) {
        throw new ApiError(404, "Calendar entry not found");
    }

    await CropCalendar.findByIdAndDelete(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Calendar entry deleted successfully"));
});

export {
    getAllCalendarEntries,
    getCalendarEntryById,
    createCalendarEntry,
    updateCalendarEntry,
    deleteCalendarEntry,
};