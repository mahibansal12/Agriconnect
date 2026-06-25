// src/routes/mandiRate.routes.js

import { Router } from "express";
import {
    getLiveMandiRates,
    saveMandiRates,
    getSavedMandiRates,
    getAvailableStates,
} from "../controllers/mandiRate.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.get("/live", getLiveMandiRates);
router.get("/saved", getSavedMandiRates);
router.get("/states", getAvailableStates);


router.post("/save", verifyJWT, saveMandiRates);

export default router;