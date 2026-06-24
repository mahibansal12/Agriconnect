// src/routes/news.routes.js

import { Router } from "express";
import {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
} from "../controllers/news.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// public routes
router.get("/", getAllNews);
router.get("/:id", getNewsById);

// admin only routes
router.post("/", verifyJWT, upload.single("image"), createNews);
router.patch("/:id", verifyJWT, updateNews);
router.delete("/:id", verifyJWT, deleteNews);

export default router;