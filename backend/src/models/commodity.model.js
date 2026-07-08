import mongoose from "mongoose";

const commoditySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Commodity name is required"],
      trim: true,
      unique: true,
      index: true,
    },

    hindiName: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "Cereals",
        "Pulses",
        "Oil Seeds",
        "Vegetables",
        "Fruits",
        "Spices",
        "Fibres",
        "Others",
      ],
      default: "Others",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Commodity = mongoose.model("Commodity", commoditySchema);