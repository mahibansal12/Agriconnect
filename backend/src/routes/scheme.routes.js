// src/routes/scheme.routes.js

import { Router } from "express";
import {
    getAllSchemes,
    getSchemeById,
    createScheme,
    updateScheme,
    deleteScheme,
} from "../controllers/scheme.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes
router.get("/", getAllSchemes);
router.get("/:id", getSchemeById);

// admin only routes
router.post("/", verifyJWT, createScheme);
router.patch("/:id", verifyJWT, updateScheme);
router.delete("/:id", verifyJWT, deleteScheme);

export default router;