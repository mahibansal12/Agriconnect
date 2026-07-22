// src/controllers/farmerEvent.controller.js

import { FarmerEvent } from "../models/farmerEvent.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createFarmerEvent = asyncHandler(async (req, res) => {
    const { title, cropName, activityType, scheduledDate, notes } = req.body;

    if (!title || !activityType || !scheduledDate) {
        throw new ApiError(400, "Title, activityType, and scheduledDate are required");
    }

    const event = await FarmerEvent.create({
        farmerId: req.user._id,
        title,
        cropName,
        activityType,
        scheduledDate,
        notes,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, event, "Event scheduled successfully"));
});

const getFarmerEvents = asyncHandler(async (req, res) => {
    const { month, year, status } = req.query;
    
    let filter = { farmerId: req.user._id };

    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        filter.scheduledDate = { $gte: startDate, $lte: endDate };
    }

    if (status) {
        filter.status = status;
    }

    const events = await FarmerEvent.find(filter).sort({ scheduledDate: 1 });

    return res
        .status(200)
        .json(new ApiResponse(200, events, "Events fetched successfully"));
});

const updateFarmerEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    let event = await FarmerEvent.findById(id);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    if (event.farmerId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this event");
    }

    const updatedEvent = await FarmerEvent.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
});

const deleteFarmerEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const event = await FarmerEvent.findById(id);

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    if (event.farmerId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this event");
    }

    await FarmerEvent.findByIdAndDelete(id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Event deleted successfully"));
});

export {
    createFarmerEvent,
    getFarmerEvents,
    updateFarmerEvent,
    deleteFarmerEvent,
};
