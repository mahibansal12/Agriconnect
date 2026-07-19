import mongoose from "mongoose";
 
const chatMessageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);
 
const chatSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        // Short label shown in the sidebar — derived from the first user
        // message, editable later if needed.
        title: {
            type: String,
            default: "New chat",
            trim: true,
        },
        messages: {
            type: [chatMessageSchema],
            default: [],
        },
    },
    { timestamps: true }
);
 
// Most-recently-updated sessions first, per user.
chatSessionSchema.index({ user: 1, updatedAt: -1 });
 
export const ChatSession = mongoose.model("ChatSession", chatSessionSchema);