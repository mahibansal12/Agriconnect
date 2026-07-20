// src/controllers/news.controller.js

import { News } from "../models/news.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import axios from "axios";

const detectCategory = (title = "", description = "") => {
    const text = (title + " " + description).toLowerCase();
    if (text.includes("government") || text.includes("scheme") || text.includes("policy") || text.includes("minister") || text.includes("msp")) return "government";
    if (text.includes("price") || text.includes("market") || text.includes("mandi") || text.includes("export") || text.includes("trade")) return "market";
    if (text.includes("rain") || text.includes("weather") || text.includes("monsoon") || text.includes("drought") || text.includes("flood")) return "weather";
    if (text.includes("technology") || text.includes("drone") || text.includes("digital") || text.includes("app") || text.includes("ai")) return "technology";
    return "general";
};


// ── In-memory GNews cache (avoids burning the 100 req/day quota on every page load)
let gnewsCache = null;       // { articles: [], fetchedAt: Date }
const GNEWS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Fire a single GNews request and return normalised article objects (or [])
const fetchGnews = async (query) => {
    try {
        const response = await axios.get("https://gnews.io/api/v4/search", {
            params: {
                q: query,
                lang: "en",
                country: "in",
                max: 10,               // free-tier hard cap per request
                sortby: "publishedAt",
                apikey: process.env.GNEWS_API_KEY,
            },
            timeout: 8000,
        });
        return response.data.articles || [];
    } catch {
        return [];
    }
};

const agricultureKeywords = [
    "agriculture", "agricultural", "farmer", "farmers", "farming",
    "crop", "crops", "cultivation", "harvest", "wheat", "rice",
    "maize", "corn", "cotton", "mustard", "soybean", "sugarcane",
    "millet", "paddy", "fertilizer", "fertilisers", "pesticide",
    "seed", "seeds", "irrigation", "monsoon", "mandi", "msp",
    "horticulture", "livestock", "dairy", "agri", "kisan",
];

const normaliseGnewsArticle = (a, index, prefix) => ({
    _id: `live_${prefix}_${index}_${Date.now()}`,
    title: a.title,
    content: a.description || a.content || "",
    image: a.image,
    category: detectCategory(a.title, a.description),
    createdAt: a.publishedAt,
    sourceUrl: a.url,
    sourceName: a.source?.name || "News Source",
    isLive: true,
});

const getLiveArticles = async () => {
    // Return cached result if still fresh
    if (gnewsCache && (Date.now() - gnewsCache.fetchedAt) < GNEWS_CACHE_TTL_MS) {
        return gnewsCache.articles;
    }

    // Two parallel queries — each returns up to 10 on the free tier → ~20 articles total
    const [generalRaw, marketRaw] = await Promise.all([
        fetchGnews("agriculture OR farmer OR farming OR crop OR kisan OR mandi OR harvest OR irrigation"),
        fetchGnews("MSP OR fertilizer OR government scheme farmer OR agri policy OR crop price India"),
    ]);

    const filterAndMap = (raw, prefix) =>
        raw
            .filter(a => {
                if (!a.title || !a.description || !a.image) return false;
                const text = (a.title + " " + a.description).toLowerCase();
                return agricultureKeywords.some(kw => text.includes(kw));
            })
            .map((a, i) => normaliseGnewsArticle(a, i, prefix));

    const fromGeneral = filterAndMap(generalRaw, "g");
    const fromMarket  = filterAndMap(marketRaw,  "m");

    // Deduplicate by title (in case both queries return the same headline)
    const seen = new Set();
    const merged = [...fromGeneral, ...fromMarket].filter(a => {
        const key = a.title.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Sort by date descending
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    gnewsCache = { articles: merged, fetchedAt: Date.now() };
    return merged;
};

const getAllNews = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const liveArticles = await getLiveArticles();

    const filter = {};
    if (category) filter.category = category;

    const dbNews = await News.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    let allNews = [...dbNews, ...liveArticles];

    // apply category filter to live articles too
    if (category) {
        allNews = allNews.filter(a => a.category === category);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, allNews, "News fetched successfully"));
});



const getNewsById = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id)
        .populate("createdBy", "name email");

    if (!news) {
        throw new ApiError(404, "News not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, news, "News fetched successfully"));
});


const createNews = asyncHandler(async (req, res) => {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
        throw new ApiError(400, "Title, content and category are required");
    }

    let imageUrl = "";
    const imageLocalPath = req.file?.path;
    if (imageLocalPath) {
        const uploaded = await uploadOnCloudinary(imageLocalPath);
        imageUrl = uploaded?.url || "";
    }

    const news = await News.create({
        title,
        content,
        category,
        image: imageUrl,
        createdBy: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, news, "News created successfully"));
});


const updateNews = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);

    if (!news) {
        throw new ApiError(404, "News not found");
    }

    const updated = await News.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "News updated successfully"));
});


const deleteNews = asyncHandler(async (req, res) => {
    const news = await News.findById(req.params.id);

    if (!news) {
        throw new ApiError(404, "News not found");
    }

    await News.findByIdAndDelete(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "News deleted successfully"));
});

export {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
};