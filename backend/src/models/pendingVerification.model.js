// backend/src/models/pendingVerification.model.js
//
// Holds OTP verification state for an email or phone number BEFORE a user
// account exists — needed because registration now verifies both fields
// inline, one at a time, as the person fills the form, and there's no
// user _id yet to attach that state to.
//
// Once registerUser succeeds, the matching records for that email/phone
// are deleted (see registerUser in user.controller.js). The TTL index
// below is a safety net that cleans up anything abandoned mid-registration.

import mongoose from "mongoose";

const pendingVerificationSchema = new mongoose.Schema(
    {
        identifier: {
            type: String, // email address OR E.164 phone number
            required: true,
            lowercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["email", "phone"],
            required: true,
        },
        otpHash: { type: String, required: true },
        otpExpiry: { type: Date, required: true },
        attempts: { type: Number, default: 0 },
        verified: { type: Boolean, default: false },
        verifiedAt: { type: Date },
        lastSentAt: { type: Date },
    },
    { timestamps: true }
);

// One in-progress verification per (identifier, type) — sending a new OTP
// overwrites the previous attempt rather than creating duplicates.
pendingVerificationSchema.index({ identifier: 1, type: 1 }, { unique: true });

// Auto-delete abandoned verification attempts after 1 hour, so this
// collection doesn't accumulate junk from people who never finish signing up.
pendingVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const PendingVerification = mongoose.model(
    "PendingVerification",
    pendingVerificationSchema
);
