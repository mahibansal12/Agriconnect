import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getChatResponse } from "../services/ai.service.js";

// POST /api/v1/ai/chat
// Public — no login needed
const chat = asyncHandler(async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
        throw new ApiError(400, "message is required");
    }

    // history format expected from frontend:
    // [{ role: "user", content: "..." }, { role: "assistant", content: "..." }]
    const validHistory = history
        .filter((h) => h.role && h.content && ["user", "assistant"].includes(h.role))
        .slice(-10); // keep last 10 messages to avoid token limit

    const reply = await getChatResponse(message.trim(), validHistory);

    return res
        .status(200)
        .json(new ApiResponse(200, { reply }, "Response generated"));
});

export { chat };