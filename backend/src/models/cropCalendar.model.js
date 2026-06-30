// src/models/cropCalendar.model.js

import mongoose from "mongoose";

const cropCalendarSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    activity: {
      type: String,
      enum: ["sowing", "irrigation", "fertilizing", "harvesting", "spraying"],
      required: true,
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const CropCalendar = mongoose.model("CropCalendar", cropCalendarSchema);