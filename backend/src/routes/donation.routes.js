// src/routes/donation.routes.js

import { Router } from "express";
import {
    getAllDonations,
    getDonationById,
    createDonation,
    verifyDonation,
    updateDonationStatus,
    getMyDonations,
    getReceivedDonations,
} from "../controllers/donation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes
router.get("/", getAllDonations);

// logged in user routes
router.post("/", verifyJWT, createDonation);
router.post("/verify-payment", verifyJWT, verifyDonation);
router.get("/my/donations", verifyJWT, getMyDonations);
router.get("/farmer/received", verifyJWT, getReceivedDonations);

router.get("/:id", getDonationById);

// admin only route
router.patch("/:id/status", verifyJWT, updateDonationStatus);

export default router;