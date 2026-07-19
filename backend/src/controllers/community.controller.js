// src/controllers/community.controller.js

import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getIO } from "../config/socket.js";


const getAllPosts = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const filter = {};
    if (category) filter.category = category;

    const posts = await Post.find(filter)
        .populate("author", "name avatar")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "Posts fetched successfully"));
});


const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate("author", "name avatar");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    
    const comments = await Comment.find({ post: req.params.id })
        .populate("author", "name avatar")
        .sort({ createdAt: 1 }); // oldest first for comments

    return res
        .status(200)
        .json(
            new ApiResponse(200, { post, comments }, "Post fetched successfully")
        );
});


const createPost = asyncHandler(async (req, res) => {
    const { title, content, category } = req.body;

    if (!title) {
    throw new ApiError(400, "Title is required");
}

    let imageUrl = "";
    const imageLocalPath = req.file?.path;
    if (imageLocalPath) {
        const uploaded = await uploadOnCloudinary(imageLocalPath);
        imageUrl = uploaded?.url || "";
    }

    const post = await Post.create({
        title,
        content,
        category,
        image: imageUrl,
        author: req.user._id, 
    });

    
    const newPost = await Post.findById(post._id)
        .populate("author", "name avatar");

    
    getIO().emit("new-post", newPost);

    return res
        .status(201)
        .json(new ApiResponse(201, newPost, "Post created successfully"));
});


const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // check if logged in user is the author
    if (post.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own posts");
    }

    await Post.findByIdAndDelete(req.params.id);

    // also delete all comments on this post
    await Comment.deleteMany({ post: req.params.id });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post deleted successfully"));
});


const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
        // unlike — remove user from likes array
        post.likes = post.likes.filter(
            (id) => id.toString() !== userId.toString()
        );
    } else {
        // like — add user to likes array
        post.likes.push(userId);
    }

    await post.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { likes: post.likes.length, alreadyLiked: !alreadyLiked },
                alreadyLiked ? "Post unliked" : "Post liked"
            )
        );
});


const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.create({
        content,
        post: req.params.id,
        author: req.user._id,
    });

    const newComment = await Comment.findById(comment._id)
        .populate("author", "name avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, newComment, "Comment added successfully"));
});


const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own comments");
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
    getAllPosts,
    getPostById,
    createPost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
};