import { Router } from "express";

import {
    syncRates,
    fetchStates,
    fetchDistricts,
    fetchMandis,
    fetchRates,
    fetchCommoditySearch,
    fetchDashboardStats,
    fetchHighlights,
    fetchComparison,
    fetchPriceHistory,
} from "../controllers/mandiRate.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();


// Dashboard


router.get("/stats", fetchDashboardStats);
router.get("/highlights", fetchHighlights);

//Location

router.get("/states", fetchStates);
router.get("/districts/:state", fetchDistricts);
router.get("/mandis", fetchMandis);

//Rates
router.get("/rates", fetchRates);
router.get("/search", fetchCommoditySearch);
router.get("/history", fetchPriceHistory);
router.post("/compare", fetchComparison);

//Admin/Cron

router.post("/sync",verifyJWT,authorizeRoles("admin"), syncRates);

export default router;