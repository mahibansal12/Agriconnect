// src/models/donation.model.js

import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    cause: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String, // Razorpay payment ID
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationRequest", // optional — links to a farmer's campaign
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    payoutDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Donation = mongoose.model("Donation", donationSchema);