// src/routes/pest.routes.js

import { Router } from "express";
import {
    getAllPests,
    getPestById,
    getPestsByCrop,
    createPest,
    updatePest,
    deletePest,
} from "../controllers/pest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// public routes
router.get("/", getAllPests);
router.get("/crop/:cropName", getPestsByCrop);
router.get("/:id", getPestById);

// admin only routes
router.post("/", verifyJWT, upload.single("image"), createPest);
router.patch("/:id", verifyJWT, updatePest);
router.delete("/:id", verifyJWT, deletePest);

export default router;