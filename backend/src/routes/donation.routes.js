// src/routes/donation.routes.js

import { Router } from "express";
import {
    getAllDonations,
    getDonationById,
    createDonation,
    updateDonationStatus,
    getMyDonations,
} from "../controllers/donation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes
router.get("/", getAllDonations);
router.get("/:id", getDonationById);

// logged in user routes
router.post("/", verifyJWT, createDonation);
router.get("/my/donations", verifyJWT, getMyDonations);

// admin only route
router.patch("/:id/status", verifyJWT, updateDonationStatus);

export default router;