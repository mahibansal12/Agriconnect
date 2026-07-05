import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CropListing",
            required: true,
        },
        // snapshot fields — store at order time so data is preserved
        // even if listing is edited or deleted later
        cropName: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            required: true,
        },
        pricePerUnit: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        platformCommission: { type: Number, default: 0 },
        farmerPayoutAmount: { type: Number, default: 0 },
        payoutStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
        payoutDate:   { type: Date },
        // Razorpay fields
        razorpayOrderId: {
            type: String,    // created by Razorpay, used to open payment UI
        },
        razorpayPaymentId: {
            type: String,    // returned after successful payment
        },
        razorpaySignature: {
            type: String,    // used to verify payment authenticity
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        orderStatus: {
            type: String,
            enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
            default: "placed",
        },
        deliveryAddress: {
            state:    { type: String, required: true },
            district: { type: String, required: true },
            village:  { type: String },
            pincode:  { type: String },
            phone:    { type: String, required: true },
        },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);