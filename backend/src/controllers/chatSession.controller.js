import { ChatSession } from "../models/chatSession.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
 
const deriveTitle = (messages = []) => {
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (!firstUserMsg?.text) return "New chat";
    const text = firstUserMsg.text.trim();
    return text.length > 48 ? text.slice(0, 48) + "…" : text;
};
 
// GET /api/v1/ai/sessions — list the logged-in user's chat sessions
// (title + updatedAt only, for a lightweight sidebar list)
const getSessions = asyncHandler(async (req, res) => {
    const sessions = await ChatSession.find({ user: req.user._id })
        .select("title createdAt updatedAt")
        .sort({ updatedAt: -1 });
 
    return res
        .status(200)
        .json(new ApiResponse(200, sessions, "Chat sessions fetched successfully"));
});
 
// GET /api/v1/ai/sessions/:id — full message history for one session
const getSessionById = asyncHandler(async (req, res) => {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
 
    if (!session) {
        throw new ApiError(404, "Chat session not found");
    }
 
    return res
        .status(200)
        .json(new ApiResponse(200, session, "Chat session fetched successfully"));
});
 
// POST /api/v1/ai/sessions — create a new (empty or pre-seeded) session
const createSession = asyncHandler(async (req, res) => {
    const { messages = [] } = req.body;
 
    const session = await ChatSession.create({
        user: req.user._id,
        title: deriveTitle(messages),
        messages,
    });
 
    return res
        .status(201)
        .json(new ApiResponse(201, session, "Chat session created successfully"));
});
 
// PUT /api/v1/ai/sessions/:id — replace a session's message list (called
// after every exchange so the sidebar/title stay in sync with the live chat)
const updateSession = asyncHandler(async (req, res) => {
    const { messages } = req.body;
 
    if (!Array.isArray(messages)) {
        throw new ApiError(400, "messages array is required");
    }
 
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
 
    if (!session) {
        throw new ApiError(404, "Chat session not found");
    }
 
    session.messages = messages;
    session.title = deriveTitle(messages);
    await session.save();
 
    return res
        .status(200)
        .json(new ApiResponse(200, session, "Chat session updated successfully"));
});
 
// DELETE /api/v1/ai/sessions/:id — only the owning user can delete their session
const deleteSession = asyncHandler(async (req, res) => {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
 
    if (!session) {
        throw new ApiError(404, "Chat session not found");
    }
 
    await ChatSession.findByIdAndDelete(req.params.id);
 
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Chat session deleted successfully"));
});
 
export { getSessions, getSessionById, createSession, updateSession, deleteSession };