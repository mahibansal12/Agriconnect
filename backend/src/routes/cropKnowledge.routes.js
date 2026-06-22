// src/routes/cropKnowledge.routes.js

import { Router } from "express";
import {
    getAllCrops,
    getCropById,
    createCrop,
    updateCrop,
    deleteCrop,
} from "../controllers/cropKnowledge.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.get("/", getAllCrops);
router.get("/:id", getCropById);


router.post("/", verifyJWT, upload.single("image"), createCrop);
router.patch("/:id", verifyJWT, updateCrop);
router.delete("/:id", verifyJWT, deleteCrop);

export default router;