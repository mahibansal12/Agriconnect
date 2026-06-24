// src/controllers/news.controller.js

import { News } from "../models/news.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllNews = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const filter = {};
    if (category) filter.category = category;

    const news = await News.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, news, "News fetched successfully"));
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
        createdBy: req.user._id,  // from verifyJWT
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