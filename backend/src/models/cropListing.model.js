import mongoose from "mongoose";

const cropListingSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        cropName: {
            type: String,
            required: [true, "Crop name is required"],
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "grains",
                "vegetables",
                "fruits",
                "pulses",
                "oilseeds",
                "spices",
                "cotton",
                "sugarcane",
                "other",
            ],
            required: [true, "Category is required"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [0.1, "Quantity must be greater than 0"],
        },
        unit: {
            type: String,
            enum: ["kg", "quintal", "ton"],
            default: "quintal",
        },
        pricePerUnit: {
            type: Number,
            required: [true, "Price is required"],
            min: [1, "Price must be greater than 0"],
        },
        qualityGrade: {
            type: String,
            enum: ["A", "B", "C"],
            default: "B",
        },
        isOrganic: {
            type: Boolean,
            default: false,
        },

        // store both url and public_id — url for display, public_id for deletion
        images: [
            {
                url: { type: String },
                public_id: { type: String },
            },
        ],
        harvestDate: {
            type: Date,
            required: [true, "Harvest date is required"],
        },
        availableUntil: {
            type: Date,
        },
        location: {
            state: { type: String, required: [true, "State is required"] },
            district: { type: String, required: [true, "District is required"] },
            village: { type: String },
            pincode: { type: String },
        },
        description: {
            type: String,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "sold"],
            default: "pending",
        },
        views: {
            type: Number,
            default: 0,
        },
        wishlistedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

// text index — allows text search on cropName in getAllListings
cropListingSchema.index({ cropName: "text" });

// compound index — speeds up common filter queries
cropListingSchema.index({ status: 1, category: 1, "location.state": 1 });

export const CropListing = mongoose.model("CropListing", cropListingSchema);