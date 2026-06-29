// src/routes/community.routes.js

import { Router } from "express";
import {
    getAllPosts,
    getPostById,
    createPost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
} from "../controllers/community.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);


router.post("/posts", verifyJWT, upload.single("image"), createPost);
router.delete("/posts/:id", verifyJWT, deletePost);
router.post("/posts/:id/like", verifyJWT, toggleLike);
router.post("/posts/:id/comments", verifyJWT, addComment);
router.delete("/posts/:id/comments/:commentId", verifyJWT, deleteComment);

export default router;