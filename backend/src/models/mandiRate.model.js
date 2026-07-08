// src/models/mandiRate.model.js

import mongoose from "mongoose";

const mandiRateSchema = new mongoose.Schema(
  {
    commodity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commodity",
    },
    commodityName: {
      type: String,
      required: true,
      trim: true,
    },
    mandi: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    variety: {
      type: String,
      default: "",
    },
    grade: {
      type: String,
      default: "",
    },
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    modalPrice: {
      type: Number,
      required: true,
    },
    arrivalDate: {
      type: Date,
      required: true,
    },
    lastSyncedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

mandiRateSchema.index({ commodityName: 1, mandi: 1, arrivalDate: 1 }, { unique: true });

export const MandiRate = mongoose.model("MandiRate", mandiRateSchema);