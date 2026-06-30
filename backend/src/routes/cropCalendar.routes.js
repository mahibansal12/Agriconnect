// src/routes/cropCalendar.routes.js

import { Router } from "express";
import {
    getAllCalendarEntries,
    getCalendarEntryById,
    createCalendarEntry,
    updateCalendarEntry,
    deleteCalendarEntry,
} from "../controllers/cropCalendar.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes
router.get("/", getAllCalendarEntries);
router.get("/:id", getCalendarEntryById);

// admin only routes
router.post("/", verifyJWT, createCalendarEntry);
router.patch("/:id", verifyJWT, updateCalendarEntry);
router.delete("/:id", verifyJWT, deleteCalendarEntry);

export default router;