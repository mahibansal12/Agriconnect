import axios from "axios";
import { Commodity } from "../models/commodity.model.js";
import { MandiRate } from "../models/mandiRate.model.js";
import { ApiError } from "../utils/ApiError.js";

const BASE_URL = "https://api.data.gov.in/resource";

const API_KEY = process.env.DATA_GOV_API_KEY;
const RESOURCE_ID = process.env.DATA_GOV_RESOURCE_ID;

const fetchGovernmentData = async (offset = 0, limit = 100) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/${RESOURCE_ID}`,
            {
                params: {
                    "api-key": API_KEY,
                    format: "json",
                    limit,
                    offset,
                },
            }
        );

        return response.data.records || [];
    } catch (error) {
        console.error("Mandi API fetch error:", error.message);
        throw new ApiError(500, "Unable to fetch mandi data.");
    }
};

const parseMandiDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsedDate = new Date(Date.UTC(year, month, day));
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }
    return null;
};

const syncMandiRates = async () => {
    let offset = 0;
    const limit = 100;

    while (true) {
        console.log(`Syncing Mandi Rates: offset=${offset}, limit=${limit}`);
        const records = await fetchGovernmentData(offset, limit);

        if (!records.length) break;

        for (const item of records) {
            const parsedArrivalDate = parseMandiDate(item.arrival_date);
            if (!parsedArrivalDate) continue;

            let commodity = await Commodity.findOne({
                name: item.commodity,
            });

            if (!commodity) {
                commodity = await Commodity.create({
                    name: item.commodity,
                });
            }

            await MandiRate.findOneAndUpdate(
                {
                    state: item.state,
                    district: item.district,
                    mandi: item.market,
                    commodityName: item.commodity,
                    arrivalDate: parsedArrivalDate,
                },
                {
                    state: item.state,
                    district: item.district,
                    mandi: item.market,

                    commodity: commodity._id,
                    commodityName: item.commodity,

                    variety: item.variety,
                    grade: item.grade,

                    minPrice: Number(item.min_price),
                    maxPrice: Number(item.max_price),
                    modalPrice: Number(item.modal_price),

                    arrivalDate: parsedArrivalDate,

                    lastSyncedAt: new Date(),
                },
                {
                    upsert: true,
                    new: true,
                }
            );
        }

        offset += limit;
    }

    return true;
};

const getStates = async () => {

    return await MandiRate.aggregate([
        {
            $group: {
                _id: "$state",
                districtCount: {
                    $addToSet: "$district",
                },
                mandiCount: {
                    $addToSet: "$mandi",
                },
            },
        },
        {
            $project: {
                _id: 0,
                name: "$_id",
                districtCount: {
                    $size: "$districtCount",
                },
                mandiCount: {
                    $size: "$mandiCount",
                },
            },
        },
        {
            $sort: {
                name: 1,
            },
        },
    ]);

};

const getDistricts = async (state) => {

    return await MandiRate.aggregate([
        {
            $match: {
                state,
            },
        },
        {
            $group: {
                _id: "$district",
                mandiCount: {
                    $addToSet: "$mandi",
                },
            },
        },
        {
            $project: {
                _id: 0,
                name: "$_id",
                mandiCount: {
                    $size: "$mandiCount",
                },
            },
        },
        {
            $sort: {
                name: 1,
            },
        },
    ]);

};

const getMandis = async (state, district) => {

    return await MandiRate.aggregate([
        {
            $match: {
                state,
                district,
            },
        },
        {
            $group: {
                _id: "$mandi",
            },
        },
        {
            $project: {
                _id: 0,
                name: "$_id",
            },
        },
        {
            $sort: {
                name: 1,
            },
        },
    ]);

};

const getRates = async ({
    state,
    district,
    mandi,
    commodity,
    page = 1,
    limit = 20,
    sortBy = "arrivalDate",
    order = "desc",
    date,
}) => {

    const filter = {};

    if (state) filter.state = state;

    if (district) filter.district = district;

    if (mandi) filter.mandi = mandi;

    if (commodity) {
        filter.commodityName = {
            $regex: commodity,
            $options: "i",
        };
    }
    if (date) {
        filter.arrivalDate = new Date(date);
    }

    const skip = (page - 1) * limit;

    const rates = await MandiRate.find(filter)
        .populate("commodity")
        .sort({
            [sortBy]: order === "asc" ? 1 : -1,
        })
        .skip(skip)
        .limit(limit);

    const total = await MandiRate.countDocuments(filter);

    return {
        rates,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    };
};

const searchCommodity = async (query, page = 1, limit = 20) => {
    const filter = {
        $or: [
            {
                commodityName: {
                    $regex: query,
                    $options: "i",
                },
            },
            {
                mandi: {
                    $regex: query,
                    $options: "i",
                },
            },
            {
                district: {
                    $regex: query,
                    $options: "i",
                },
            },
            {
                state: {
                    $regex: query,
                    $options: "i",
                },
            },
        ],
    };

    const skip = (page - 1) * limit;

    const commodities = await MandiRate.find(filter)
        .sort({
            arrivalDate: -1,
            commodityName: 1,
        })
        .skip(skip)
        .limit(limit);

    const total = await MandiRate.countDocuments(filter);

    return {
        commodities,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    };
};

const getDashboardStats = async () => {

    const [
        totalStates,
        totalDistricts,
        totalMandis,
        totalCommodities,
        totalRates,
    ] = await Promise.all([
        MandiRate.distinct("state"),
        MandiRate.distinct("district"),
        MandiRate.distinct("mandi"),
        Commodity.countDocuments(),
        MandiRate.countDocuments(),
    ]);

    return {
        totalStates: totalStates.length,
        totalDistricts: totalDistricts.length,
        totalMandis: totalMandis.length,
        totalCommodities,
        totalRates,
        lastUpdated: new Date(),
    };
};

const getTodayHighlights = async () => {

    const latest = await MandiRate.aggregate([
        {
            $sort: {
                arrivalDate: -1,
            },
        },
        {
            $group: {
                _id: "$commodityName",
                document: {
                    $first: "$$ROOT",
                },
            },
        },
        {
            $replaceRoot: {
                newRoot: "$document",
            },
        },
    ]);

    if (!latest.length) {
        return {
            highestPrice: null,
            lowestPrice: null,
            averagePrice: 0,
        };
    }

    const highestPrice = [...latest].sort(
        (a, b) => b.maxPrice - a.maxPrice
    )[0];

    const lowestPrice = [...latest].sort(
        (a, b) => a.minPrice - b.minPrice
    )[0];

    const averagePrice =
        latest.reduce(
            (sum, item) => sum + item.modalPrice,
            0
        ) / latest.length;

    return {
        highestPrice,
        lowestPrice,
        averagePrice,
    };
};

const compareMandis = async (
    commodity,
    mandis = []
) => {

    return await MandiRate.find({
        commodityName: commodity,
        mandi: {
            $in: mandis,
        },
    })
        .sort({
            arrivalDate: -1,
        })
        .select(
            "state district mandi commodityName minPrice maxPrice modalPrice arrivalDate"
        );

};

const getPriceHistory = async (
    mandi,
    commodity,
    days = 30
) => {

    const fromDate = new Date();

    fromDate.setDate(fromDate.getDate() - days);

    return await MandiRate.find({
        mandi,
        commodityName: commodity,
        arrivalDate: {
            $gte: fromDate,
        },
    })
        .sort({
            arrivalDate: 1,
        })
        .select(
            "arrivalDate minPrice maxPrice modalPrice"
        );
};

export {
    fetchGovernmentData,
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
};
