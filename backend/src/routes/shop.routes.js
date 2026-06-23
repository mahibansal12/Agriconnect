// src/routes/shop.routes.js

import { Router } from "express";
import {
    getAllShops,
    getNearbyShops,
    getShopById,
    createShop,
    updateShop,
    deleteShop,
} from "../controllers/shop.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes
router.get("/", getAllShops);
router.get("/nearby", getNearbyShops);
router.get("/:id", getShopById);

// admin only routes
router.post("/", verifyJWT, createShop);
router.patch("/:id", verifyJWT, updateShop);
router.delete("/:id", verifyJWT, deleteShop);

export default router;