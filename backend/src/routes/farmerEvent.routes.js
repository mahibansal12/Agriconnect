// src/routes/farmerEvent.routes.js

import { Router } from "express";
import {
    createFarmerEvent,
    getFarmerEvents,
    updateFarmerEvent,
    deleteFarmerEvent,
} from "../controllers/farmerEvent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All farmer event routes require authentication
router.use(verifyJWT);

router.post("/", createFarmerEvent);
router.get("/", getFarmerEvents);
router.patch("/:id", updateFarmerEvent);
router.delete("/:id", deleteFarmerEvent);

export default router;
