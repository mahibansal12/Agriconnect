import crypto from "crypto";
import { razorpayInstance } from "../config/razorpay.js";

// creates a Razorpay order — frontend uses this to open the payment UI
const createRazorpayOrder = async (amount) => {
    const options = {
        amount: amount * 100,       
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    return order;
};

// verifies payment signature after frontend completes payment
// Razorpay signs the payment using HMAC-SHA256
// we recompute it and compare — if they match, payment is genuine
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, signature) => {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    return expectedSignature === signature;
};

// issues a full refund for a captured Razorpay payment
// amount must be in paise (multiply rupees by 100)
const createRazorpayRefund = async (paymentId, amountInRupees) => {
    const refund = await razorpayInstance.payments.refund(paymentId, {
        amount: amountInRupees * 100,   // paise
        speed: "optimum",               // "normal" (T+5) or "instant" (T+0, higher fee)
        notes: { reason: "Buyer cancelled order via AgriConnect" },
    });
    return refund;
};

export { createRazorpayOrder, verifyPaymentSignature, createRazorpayRefund };