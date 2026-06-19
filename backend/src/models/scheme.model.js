// src/models/scheme.model.js

import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eligibility: {
      type: String,
      required: true,
    },
    benefits: {
      type: String,
      required: true,
    },
    applicationLink: {
      type: String,
    },
    lastDate: {
      type: Date,
    },
    category: {
      type: String,
      enum: ["subsidy", "loan", "insurance", "training", "other"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Scheme = mongoose.model("Scheme", schemeSchema);