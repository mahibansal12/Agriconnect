import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import {
    syncMandiRates,
    getStates,
    getDistricts,
    getMandis,
    getRates,
    searchCommodity,
    getDashboardStats,
    getTodayHighlights,
    compareMandis,
    getPriceHistory,
} from "../services/mandi.service.js";

const syncRates = asyncHandler(async (req, res) => {

    await syncMandiRates();

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Mandi rates synchronized successfully."
        )
    );

});

const fetchStates = asyncHandler(async (req, res) => {

    const states = await getStates();

    return res.status(200).json(
        new ApiResponse(
            200,
            states,
            "States fetched successfully."
        )
    );

});

const fetchDistricts = asyncHandler(async (req, res) => {

    const { state } = req.params;

    if (!state) {
        throw new ApiError(400, "State is required.");
    }

    const districts = await getDistricts(state);

    return res.status(200).json(
        new ApiResponse(
            200,
            districts,
            "Districts fetched successfully."
        )
    );

});

const fetchMandis = asyncHandler(async (req, res) => {

    const { state, district } = req.query;

    if (!state || !district) {
        throw new ApiError(
            400,
            "State and district are required."
        );
    }

    const mandis = await getMandis(state, district);

    return res.status(200).json(
        new ApiResponse(
            200,
            mandis,
            "Mandis fetched successfully."
        )
    );

});

const fetchRates = asyncHandler(async (req, res) => {

    const data = await getRates(req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Rates fetched successfully."
        )
    );

});

const fetchCommoditySearch = asyncHandler(async (req, res) => {

    const { q, page, limit } = req.query;

    if (!q) {
        throw new ApiError(400, "Search query is required.");
    }

    const data = await searchCommodity(
        q,
        Number(page) || 1,
        Number(limit) || 20
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Commodity search successful."
        )
    );

});

const fetchDashboardStats = asyncHandler(async (req, res) => {

    const stats = await getDashboardStats();

    return res.status(200).json(
        new ApiResponse(
            200,
            stats,
            "Dashboard statistics fetched."
        )
    );

});

const fetchHighlights = asyncHandler(async (req, res) => {

    const highlights = await getTodayHighlights(req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            highlights,
            "Highlights fetched successfully."
        )
    );

});

const fetchComparison = asyncHandler(async (req, res) => {

    const { commodity, mandis } = req.body;

    if (!commodity || !mandis?.length) {
        throw new ApiError(
            400,
            "Commodity and mandis are required."
        );
    }

    const comparison = await compareMandis(
        commodity,
        mandis
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            comparison,
            "Comparison fetched successfully."
        )
    );

});

const fetchPriceHistory = asyncHandler(async (req, res) => {

    const { mandi, commodity, days } = req.query;

    if (!mandi || !commodity) {
        throw new ApiError(
            400,
            "Mandi and commodity are required."
        );
    }

    const history = await getPriceHistory(
        mandi,
        commodity,
        Number(days) || 30
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            history,
            "Price history fetched successfully."
        )
    );

});

export {
    syncRates,
    fetchStates,
    fetchDistricts,
    fetchMandis,
    fetchRates,
    fetchCommoditySearch,
    fetchDashboardStats,
    fetchHighlights,
    fetchComparison,
    fetchPriceHistory,
};