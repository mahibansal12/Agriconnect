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


const getAllNews = asyncHandler(async (req, res) => {
    const { category } = req.query;

    
    let liveArticles = [];
    try {
        const response = await axios.get("https://newsapi.org/v2/everything", {
            params: {
                q: "agriculture OR farming OR crops OR mandi OR kisan",
                language: "en",
                sortBy: "publishedAt",
                pageSize: 20,
                apiKey: process.env.NEWS_API_KEY,
            },
        });

        liveArticles = response.data.articles
            .filter(a => a.title && a.description && a.urlToImage)
            .map((a, index) => ({
                _id: `live_${index}_${Date.now()}`,
                title: a.title,
                content: a.description || a.content || "",
                image: a.urlToImage,
                category: detectCategory(a.title, a.description),
                createdAt: a.publishedAt,
                sourceUrl: a.url,
                sourceName: a.source?.name || "News Source",
                isLive: true, // flag so frontend can show "Live" badge
            }));
    } catch (err) {
        console.error("NewsAPI fetch failed:", err.message);
        
    }

    
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