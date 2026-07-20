// src/models/payout.model.js
// A permanent record created every time an admin marks a farmer's
// dues as paid. Unlike Order/Donation payoutStatus flags (which just
// say "settled" on the source document), this is the actual payout
// history / ledger the admin can look back on.

import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    // ── Payment method chosen by admin ──
    paymentMethod: {
      type: String,
      enum: ["upi", "bank_transfer", "cash"],
      default: "upi",
    },
    // UPI details (used when paymentMethod === "upi")
    upiId: {
      type: String,
      default: "",
    },
    // Bank details (used when paymentMethod === "bank_transfer")
    bankAccountNumber: { type: String, default: "" },
    ifscCode:          { type: String, default: "" },
    accountHolderName: { type: String, default: "" },

    orderCount: { type: Number, default: 0 },
    ordersAmount: { type: Number, default: 0 },
    donationCount: { type: Number, default: 0 },
    donationsAmount: { type: Number, default: 0 },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Payout = mongoose.model("Payout", payoutSchema);