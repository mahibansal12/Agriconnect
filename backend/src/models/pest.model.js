// src/models/pest.model.js

import mongoose from "mongoose";

const pestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["insect", "fungus", "bacteria", "virus", "weed"],
      required: true,
    },
    affectedCrops: [
      {
        type: String, // crop names
      },
    ],
    symptoms: {
      type: String,
      required: true,
    },
    treatment: {
      type: String,
      required: true,
    },
    prevention: {
      type: String,
    },
    image: {
      type: String, // cloudinary URL
    },
  },
  { timestamps: true }
);

export const Pest = mongoose.model("Pest", pestSchema);