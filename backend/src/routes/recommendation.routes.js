import { Router } from "express";
import {
    recommendCrop,
    recommendByWater,
    recommendSeed,
} from "../controllers/recommendation.controller.js";

const router = Router();

// all 3 are public — no login needed
// farmers should be able to use recommendations without an account

router.route("/crop").post(recommendCrop);
router.route("/water").post(recommendByWater);
router.route("/seed").post(recommendSeed);

export default router;