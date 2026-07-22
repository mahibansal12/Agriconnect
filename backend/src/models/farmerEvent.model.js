// src/models/farmerEvent.model.js

import mongoose from "mongoose";

const farmerEventSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    cropName: {
      type: String,
      trim: true,
    },
    activityType: {
      type: String,
      enum: ["sowing", "irrigation", "fertilizing", "harvesting", "spraying", "other"],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped", "overdue"],
      default: "pending",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient querying by farmer and date
farmerEventSchema.index({ farmerId: 1, scheduledDate: 1 });

export const FarmerEvent = mongoose.model("FarmerEvent", farmerEventSchema);
