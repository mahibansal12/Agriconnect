// src/controllers/shop.controller.js

import axios from "axios";
import { Shop } from "../models/shop.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Map an OSM element's tags to one of our 5 category values.
 */
function mapOSMCategory(tags = {}) {
    const shop = (tags.shop || "").toLowerCase();
    const name = (tags.name || tags["name:en"] || "").toLowerCase();

    if (
        shop === "agrarian" ||
        shop === "agricultural_supplies" ||
        name.includes("seed") ||
        name.includes("beej") ||
        name.includes("bij")
    ) return "seeds";

    if (
        name.includes("fertilizer") ||
        name.includes("fertiliser") ||
        name.includes("khad") ||
        name.includes("urea") ||
        name.includes("manure") ||
        name.includes("compost")
    ) return "fertilizer";

    if (
        name.includes("pesticide") ||
        name.includes("keetna") ||
        name.includes("dawai") ||
        name.includes("spray") ||
        name.includes("herbicide") ||
        name.includes("insecticide") ||
        name.includes("fungicide")
    ) return "pesticide";

    if (
        shop === "garden_centre" ||
        name.includes("equipment") ||
        name.includes("tools") ||
        name.includes("tractor") ||
        name.includes("yantra") ||
        name.includes("machine")
    ) return "equipment";

    return "general";
}

/**
 * Convert a raw Overpass element into the shape ShopCard/ShopMap expect.
 */
function osmElementToShop(el) {
    const tags = el.tags || {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;

    if (!lat || !lon) return null;

    return {
        _id: `osm_${el.type}_${el.id}`,
        name:
            tags.name ||
            tags["name:en"] ||
            tags["name:hi"] ||
            "Agriculture Shop",
        ownerName: tags["contact:person"] || tags.operator || "—",
        phone:
            tags.phone ||
            tags["contact:phone"] ||
            tags["contact:mobile"] ||
            tags["mobile"] ||
            "Not listed",
        address:
            [
                tags["addr:housenumber"],
                tags["addr:street"],
                tags["addr:housename"],
            ]
                .filter(Boolean)
                .join(", ") || tags["addr:full"] || "Address not available",
        district:
            tags["addr:city"] ||
            tags["addr:district"] ||
            tags["addr:county"] ||
            "—",
        state: tags["addr:state"] || "—",
        category: mapOSMCategory(tags),
        location: {
            type: "Point",
            coordinates: [lon, lat], // GeoJSON: [lng, lat]
        },
        source: "openstreetmap",
        osmId: el.id,
    };
}

/**
 * Build and execute an Overpass QL query for agri-related shops near a point.
 */
async function queryOverpass(lat, lon, radiusMeters) {
    // We search for multiple tag combinations that indicate agriculture shops in India
    const r = radiusMeters;
    const query = `
[out:json][timeout:30];
(
  node["shop"="agrarian"](around:${r},${lat},${lon});
  node["shop"="agricultural_supplies"](around:${r},${lat},${lon});
  node["shop"="garden_centre"](around:${r},${lat},${lon});
  node["shop"="farm"](around:${r},${lat},${lon});
  node["shop"="seeds"](around:${r},${lat},${lon});
  node["amenity"="marketplace"]["name"~"Krishi|Agro|Kisan|Farm|Agriculture",i](around:${r},${lat},${lon});
  node["name"~"Krishi Kendra|Krishi Seva|Krishi Store|Kisan Seva|Kisan Kendra|Agri Store|Agriculture Store|Agro Store|Agro Center|Seeds Store|Fertilizer Store|Beej Bhandar|Khad Bhandar|Keetna Dawai",i](around:${r},${lat},${lon});
  way["shop"="agrarian"](around:${r},${lat},${lon});
  way["shop"="agricultural_supplies"](around:${r},${lat},${lon});
  way["shop"="garden_centre"](around:${r},${lat},${lon});
  way["name"~"Krishi Kendra|Krishi Seva|Agri Store|Agriculture Store|Agro Store|Agro Center|Seeds Store|Fertilizer Store|Beej Bhandar|Khad Bhandar",i](around:${r},${lat},${lon});
);
out center;
`.trim();

    const response = await axios.post(
        "https://overpass-api.de/api/interpreter",
        `data=${encodeURIComponent(query)}`,
        {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 35000,
        }
    );

    const elements = response.data?.elements || [];
    return elements.map(osmElementToShop).filter(Boolean);
}


// ─── Controllers ───────────────────────────────────────────────────────────────

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


/**
 * GET /api/v1/shops/nearby?latitude=&longitude=&maxDistance=
 *
 * Returns nearby agri shops by:
 *   1. Querying Overpass API for real OSM shop data anywhere in India.
 *   2. Merging with any shops stored in our own DB.
 *
 * Falls back gracefully if Overpass is slow/down.
 */
const getNearbyShops = asyncHandler(async (req, res) => {
    const { longitude, latitude, maxDistance = 15000 } = req.query;

    if (!longitude || !latitude) {
        throw new ApiError(400, "Longitude and latitude are required");
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radius = parseInt(maxDistance); // metres

    // ── 1. Query Overpass API (real shops from OpenStreetMap) ──────────────
    let overpassShops = [];
    try {
        overpassShops = await queryOverpass(lat, lon, radius);
    } catch (err) {
        // Don't fail the whole request if Overpass is down; fall through to DB only.
        console.error("Overpass API error (non-fatal):", err.message);
    }

    // ── 2. Query our own MongoDB for shops seeded by admins ────────────────
    let dbShops = [];
    try {
        dbShops = await Shop.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lon, lat],
                    },
                    $maxDistance: radius,
                },
            },
        });
    } catch (err) {
        // 2dsphere index might not be created yet on a fresh DB — skip quietly.
        console.error("DB geo-query error (non-fatal):", err.message);
    }

    // ── 3. Merge, de-duplicate, return ────────────────────────────────────
    // DB shops take priority; OSM shops fill the gaps.
    const seenIds = new Set(dbShops.map((s) => s._id.toString()));
    const uniqueOSM = overpassShops.filter((s) => !seenIds.has(s._id));

    const allShops = [...dbShops, ...uniqueOSM];

    return res.status(200).json(
        new ApiResponse(200, allShops, "Nearby shops fetched successfully")
    );
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