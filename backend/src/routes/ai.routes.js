import { Router } from "express";
import { chat } from "../controllers/ai.controller.js";
import {
    getSessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession,
} from "../controllers/chatSession.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/chat").post(chat);

// Chat history — every route requires login, and every query is scoped to
// req.user._id inside the controller, so each farmer/buyer only ever sees
// their own past conversations.
router.get("/sessions", verifyJWT, getSessions);
router.post("/sessions", verifyJWT, createSession);
router.get("/sessions/:id", verifyJWT, getSessionById);
router.put("/sessions/:id", verifyJWT, updateSession);
router.delete("/sessions/:id", verifyJWT, deleteSession);

export default router;