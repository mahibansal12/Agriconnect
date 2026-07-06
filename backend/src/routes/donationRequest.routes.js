// src/routes/donationRequest.routes.js

import { Router } from "express";
import {
  createRequest,
  getMyRequests,
  getApprovedCampaigns,
  getCampaignById,
} from "../controllers/donationRequest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ── Specific named routes MUST come before /:id ──────────────────────────────

// Farmer-only: GET own requests  (must be before /:id)
router.get("/farmer/mine", verifyJWT, getMyRequests);

// Public: all approved campaigns
router.get("/", getApprovedCampaigns);

// Public: single campaign by ID
router.get("/:id", getCampaignById);

// Farmer-only: create new request
router.post("/", verifyJWT, createRequest);

export default router;
