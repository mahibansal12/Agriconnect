// src/models/donationRequest.model.js

import mongoose from "mongoose";

const donationRequestSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    cause: {
      type: String,
      required: true,
      enum: ["education", "healthcare", "disaster relief", "equipment", "general"],
      default: "general",
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    amountRaised: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const DonationRequest = mongoose.model("DonationRequest", donationRequestSchema);
