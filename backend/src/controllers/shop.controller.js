// src/controllers/shop.controller.js

import { Shop } from "../models/shop.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getAllShops = asyncHandler(async (req, res) => {
    const { state, district, category } = req.query;

    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (category) filter.category = category;

    const shops = await Shop.find(filter).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, shops, "Shops fetched successfully"));
});


const getNearbyShops = asyncHandler(async (req, res) => {
    const { longitude, latitude, maxDistance = 10000 } = req.query;
    // maxDistance is in meters, default 10km

    if (!longitude || !latitude) {
        throw new ApiError(400, "Longitude and latitude are required");
    }

    const shops = await Shop.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [
                        parseFloat(longitude),
                        parseFloat(latitude)
                    ],
                },
                $maxDistance: parseInt(maxDistance),
            },
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, shops, "Nearby shops fetched successfully"));
});


const getShopById = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
        throw new ApiError(404, "Shop not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, shop, "Shop fetched successfully"));
});


const createShop = asyncHandler(async (req, res) => {
    const {
        name,
        ownerName,
        phone,
        address,
        state,
        district,
        category,
        longitude,
        latitude,
    } = req.body;

    if (!name || !ownerName || !phone || !address || !state || !district || !category || !longitude || !latitude) {
        throw new ApiError(400, "All fields including coordinates are required");
    }

    const shop = await Shop.create({
        name,
        ownerName,
        phone,
        address,
        state,
        district,
        category,
        location: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, shop, "Shop created successfully"));
});


const updateShop = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
        throw new ApiError(404, "Shop not found");
    }

    const updated = await Shop.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Shop updated successfully"));
});


const deleteShop = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
        throw new ApiError(404, "Shop not found");
    }

    await Shop.findByIdAndDelete(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Shop deleted successfully"));
});

export {
    getAllShops,
    getNearbyShops,
    getShopById,
    createShop,
    updateShop,
    deleteShop,
};