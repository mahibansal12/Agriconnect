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
    scientificName: {
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
    image: {
      type: String, // cloudinary URL or direct URL
    },
    description: {
      type: String,
    },
    growingGuide: {
      soilType: { type: String },
      phRange: { type: String },
      temperature: { type: String },
      rainfall: { type: String },
    },
    fertilizerGuide: [
      {
        name: { type: String },
        quantity: { type: String },
        timing: { type: String },
      },
    ],
    irrigationGuide: {
      numberOfIrrigations: { type: Number },
      intervalDays: { type: Number },
      criticalStages: { type: String },
    },
    diseaseManagement: [
      {
        disease: { type: String },
        prevention: { type: String },
        treatment: { type: String },
      },
    ],
    harvestInfo: {
      harvestTime: { type: String },
      yieldEstimate: { type: String },
    },
  },
  { timestamps: true }
);

export const CropKnowledge = mongoose.model("CropKnowledge", cropKnowledgeSchema);