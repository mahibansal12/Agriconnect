// src/models/cropKnowledge.model.js

import mongoose from "mongoose";

const cropKnowledgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    localName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["vegetable", "fruit", "grain", "pulse", "spice", "cash crop"],
      required: true,
    },
    season: {
      type: String,
      enum: ["kharif", "rabi", "zaid"],
      required: true,
    },
    soilType: {
      type: String,
    },
    waterRequirement: {
      type: String,
    },
    growingDuration: {
      type: String, // e.g. "90-120 days"
    },
    description: {
      type: String,
    },
    image: {
      type: String, // cloudinary URL
    },
  },
  { timestamps: true }
);

export const CropKnowledge = mongoose.model("CropKnowledge", cropKnowledgeSchema);