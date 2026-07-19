import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { CropListing } from "../models/cropListing.model.js";
import { User } from "../models/user.model.js";
import {
    createRazorpayOrder,
    verifyPaymentSignature,
    createRazorpayRefund,
} from "../services/payment.service.js";
import { PLATFORM_COMMISSION_PERCENT } from "../constants.js";
import {
    sendOrderNotificationSms,
    sendPaymentConfirmationSms,
    sendOrderStatusSms,
    sendRefundSms,
} from "../services/sms.service.js";
import {
    sendOrderConfirmationEmail,
    sendRefundEmail,
} from "../services/email.service.js";

//  Create Order 
// POST /api/v1/orders
// Private — buyer only
// Flow: buyer submits → we create Razorpay order → return order id to frontend
//       frontend opens Razorpay UI → buyer pays → calls /verify-payment
const createOrder = asyncHandler(async (req, res) => {
    const {
        listingId,
        quantity,
        state,
        district,
        village,
        pincode,
        phone,
    } = req.body;

    if (!listingId || !quantity || !state || !district || !phone) {
        throw new ApiError(400, "listingId, quantity, state, district and phone are required");
    }

    const listing = await CropListing.findById(listingId);

    if (!listing) {
        throw new ApiError(404, "Listing not found");
    }

    if (listing.status !== "approved") {
        throw new ApiError(400, "This listing is not available for purchase");
    }

    if (quantity > listing.quantity) {
        throw new ApiError(400, `Only ${listing.quantity} ${listing.unit} available`);
    }

    const totalPrice = listing.pricePerUnit * quantity;
    const platformCommission = Math.round(totalPrice * (PLATFORM_COMMISSION_PERCENT / 100));
    const farmerPayoutAmount = totalPrice - platformCommission;

    // create Razorpay order — amount in paise handled in service
    const razorpayOrder = await createRazorpayOrder(totalPrice);

    // save order in DB with pending payment status
    const order = await Order.create({
        buyer: req.user._id,
        farmer: listing.farmer,
        listing: listing._id,
        cropName: listing.cropName,    // snapshot
        quantity,
        unit: listing.unit,            // snapshot
        pricePerUnit: listing.pricePerUnit, // snapshot
        totalPrice,
        platformCommission,
        farmerPayoutAmount,
        razorpayOrderId: razorpayOrder.id,
        deliveryAddress: { state, district, village, pincode, phone },
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                order,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,  // in paise
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID, // frontend needs this to init SDK
            },
            "Order created. Complete payment to confirm."
        )
    );
});

// Verify Payment 
// POST /api/v1/orders/verify-payment
// Private — buyer only
// Called by frontend after Razorpay payment is completed
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
        req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
        throw new ApiError(400, "All payment fields are required");
    }

    const isValid = verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    );

    if (!isValid) {
        // signature mismatch = payment tampered or fake
        await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
        throw new ApiError(400, "Payment verification failed. Invalid signature.");
    }

    // payment is genuine — update order
    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            razorpayPaymentId,
            razorpaySignature,
            paymentStatus: "paid",
            orderStatus: "placed",
        },
        { new: true }
    )
        .populate("farmer", "name phone")
        .populate("buyer", "name phone email");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // reduce available quantity on listing
    await CropListing.findByIdAndUpdate(order.listing, {
        $inc: { quantity: -order.quantity },
    });

    // Fire SMS notifications — never let a Twilio hiccup fail the order.
    // Farmer gets notified a new order came in; buyer gets a payment receipt.
    try {
        if (order.farmer?.phone) {
            await sendOrderNotificationSms(
                order.farmer.phone,
                order.farmer.name,
                order.cropName,
                order.quantity
            );
        }
        if (order.buyer?.phone) {
            await sendPaymentConfirmationSms(
                order.buyer.phone,
                order.buyer.name,
                order.totalPrice
            );
        }

        if (order.buyer?.email) {
            await sendOrderConfirmationEmail(order.buyer.email, order.buyer.name, {
                cropName: order.cropName,
                quantity: order.quantity,
                totalAmount: order.totalPrice,
            });
        }
    } catch (err) {
        console.error("Order/payment SMS notification failed:", err.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Payment verified. Order confirmed."));
});

//  Get Buyer's Orders 
// GET /api/v1/orders/my
// Private — buyer only
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user._id })
        .populate("listing", "cropName images")
        .populate("farmer", "name phone")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Your orders fetched successfully"));
});

// Get Farmer's Incoming Orders 
// GET /api/v1/orders/farmer
// Private — farmer only
const getFarmerOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ farmer: req.user._id })
        .populate("listing", "cropName images")
        .populate("buyer", "name phone")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(200, orders, "Incoming orders fetched successfully")
        );
});

// Get Single Order 
// GET /api/v1/orders/:id
// Private — buyer or farmer of that order only
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("listing", "cropName images location")
        .populate("buyer", "name phone email")
        .populate("farmer", "name phone email");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // only the buyer or the farmer of this order can view it
    const isOwner =
        order.buyer._id.toString() === req.user._id.toString() ||
        order.farmer._id.toString() === req.user._id.toString();

    if (!isOwner) {
        throw new ApiError(403, "You are not authorized to view this order");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order fetched successfully"));
});

//  Update Order Status 
// PATCH /api/v1/orders/:id/status
// Private — farmer only
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus } = req.body;

    const allowedStatuses = ["confirmed", "shipped", "delivered"];

    if (!orderStatus || !allowedStatuses.includes(orderStatus)) {
        throw new ApiError(
            400,
            `orderStatus must be one of: ${allowedStatuses.join(", ")}`
        );
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.farmer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this order");
    }

    if (order.paymentStatus !== "paid") {
        throw new ApiError(400, "Cannot update status of an unpaid order");
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "confirmed") order.confirmedAt = new Date();
    if (orderStatus === "shipped")   order.shippedAt   = new Date();
    if (orderStatus === "delivered") order.deliveredAt = new Date();
    await order.save({ validateBeforeSave: false });

    // Notify the buyer of the status change — never let a Twilio hiccup
    // fail the status update itself.
    try {
        const buyer = await User.findById(order.buyer).select("name phone");
        if (buyer?.phone) {
            await sendOrderStatusSms(buyer.phone, buyer.name, order.cropName, orderStatus);
        }
    } catch (err) {
        console.error("Order status SMS notification failed:", err.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// Cancel Order
// PATCH /api/v1/orders/:id/cancel
// Private — buyer only (only if order is still "placed" or "confirmed")
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("buyer", "name phone email")
        .populate("farmer", "name phone");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.buyer._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to cancel this order");
    }

    if (!["placed", "confirmed"].includes(order.orderStatus)) {
        throw new ApiError(
            400,
            "Order cannot be cancelled once it has been shipped"
        );
    }

    // ── Restore listing quantity ──────────────────────────────────────────
    await CropListing.findByIdAndUpdate(order.listing, {
        $inc: { quantity: order.quantity },
    });

    // ── Razorpay Refund (only if the buyer actually paid) ─────────────────
    let refundInitiated = false;
    if (order.paymentStatus === "paid" && order.razorpayPaymentId) {
        try {
            const refund = await createRazorpayRefund(
                order.razorpayPaymentId,
                order.totalPrice
            );

            order.razorpayRefundId = refund.id;
            order.refundStatus    = "initiated";
            order.refundAmount    = order.totalPrice;
            order.refundedAt      = new Date();
            order.paymentStatus   = "refunded";
            refundInitiated       = true;
        } catch (refundErr) {
            // Refund API call failed — log it and mark as failed so admin
            // can manually process it via Razorpay dashboard.
            console.error("Razorpay refund failed:", refundErr.message);
            order.refundStatus = "failed";
            // Do NOT throw — the cancellation itself should still go through.
        }
    }

    order.orderStatus = "cancelled";
    await order.save({ validateBeforeSave: false });

    // ── Notifications ─────────────────────────────────────────────────────
    // Never let a notification failure block the cancel response.
    try {
        if (refundInitiated) {
            if (order.buyer?.phone) {
                await sendRefundSms(
                    order.buyer.phone,
                    order.buyer.name,
                    order.totalPrice,
                    order.cropName
                );
            }
            if (order.buyer?.email) {
                await sendRefundEmail(order.buyer.email, order.buyer.name, {
                    cropName:     order.cropName,
                    quantity:     order.quantity,
                    unit:         order.unit,
                    refundAmount: order.totalPrice,
                    refundId:     order.razorpayRefundId,
                });
            }
        }
    } catch (notifyErr) {
        console.error("Refund notification failed:", notifyErr.message);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            order,
            refundInitiated
                ? `Order cancelled. Refund of ₹${order.totalPrice} initiated — it will reach your payment source in 5-7 business days.`
                : order.paymentStatus === "pending"
                ? "Order cancelled successfully (no payment was made)."
                : "Order cancelled. Refund initiation failed — please contact support."
        )
    );
});

export {
    createOrder,
    verifyPayment,
    getMyOrders,
    getFarmerOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
};