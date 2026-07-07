import { Donation } from "../models/donation.model.js";
import { DonationRequest } from "../models/donationRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createRazorpayOrder, verifyPaymentSignature } from "../services/payment.service.js";


const getAllDonations = asyncHandler(async (req, res) => {
    const donations = await Donation.find({ status: "completed" })
        .populate("donorId", "name email")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, donations, "Donations fetched successfully"));
});


const getDonationById = asyncHandler(async (req, res) => {
    const donation = await Donation.findById(req.params.id)
        .populate("donorId", "name email");

    if (!donation) {
        throw new ApiError(404, "Donation not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, donation, "Donation fetched successfully"));
});


const createDonation = asyncHandler(async (req, res) => {
    const { amount, cause, campaignId } = req.body;

    if (!amount || !cause) {
        throw new ApiError(400, "Amount and cause are required");
    }

    if (Number(amount) <= 0) {
        throw new ApiError(400, "Amount must be greater than 0");
    }

    // If donating to a specific campaign, validate it
    if (campaignId) {
        const campaign = await DonationRequest.findById(campaignId);

        if (!campaign) {
            throw new ApiError(404, "Campaign not found");
        }

        if (campaign.status !== "approved") {
            throw new ApiError(400, "You can only donate to approved campaigns");
        }

        // Block farmer from donating to their own campaign
        if (campaign.farmer.toString() === req.user._id.toString()) {
            throw new ApiError(403, "You cannot donate to your own campaign");
        }

        // Prevent donating if target achieved or exceeds target
        const remaining = campaign.targetAmount - (campaign.amountRaised || 0);
        if (remaining <= 0) {
            throw new ApiError(400, "This campaign has already achieved its target goal");
        }
        if (Number(amount) > remaining) {
            throw new ApiError(400, `The donation amount exceeds the remaining campaign target. Maximum donation allowed is ₹${remaining}`);
        }
    }

    // 1. Create a pending donation in database
    const donation = await Donation.create({
        donorName: req.user.name,   // from verifyJWT
        donorId: req.user._id,      // from verifyJWT
        amount: Number(amount),
        cause,
        campaignId: campaignId || undefined,
        status: "pending",
    });

    try {
        // 2. Create order in Razorpay
        const razorpayOrder = await createRazorpayOrder(Number(amount));

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    donation,
                    razorpayOrderId: razorpayOrder.id,
                    amount: razorpayOrder.amount, // in paise
                    currency: razorpayOrder.currency,
                    key: process.env.RAZORPAY_KEY_ID,
                },
                "Donation order created. Proceed to payment."
            )
        );
    } catch (err) {
        console.error("Razorpay order creation failed:", err);
        // Clean up the created donation if Razorpay order fails
        await Donation.findByIdAndDelete(donation._id);
        throw new ApiError(500, "Failed to initialize payment gateway. Please try again.");
    }
});


// Verify payment signature
const verifyDonation = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, donationId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !donationId) {
        throw new ApiError(400, "All payment fields are required");
    }

    const isValid = verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    );

    if (!isValid) {
        await Donation.findByIdAndUpdate(donationId, { status: "failed" });
        throw new ApiError(400, "Payment verification failed. Invalid signature.");
    }

    // update donation status
    const donation = await Donation.findByIdAndUpdate(
        donationId,
        {
            paymentId: razorpayPaymentId,
            status: "completed",
        },
        { new: true }
    );

    if (!donation) {
        throw new ApiError(404, "Donation not found");
    }

    // increment campaign progress
    if (donation.campaignId) {
        await DonationRequest.findByIdAndUpdate(donation.campaignId, {
            $inc: { amountRaised: donation.amount },
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, donation, "Payment verified. Donation completed successfully."));
});


const updateDonationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
        throw new ApiError(404, "Donation not found");
    }

    donation.status = status;
    await donation.save();

    return res
        .status(200)
        .json(new ApiResponse(200, donation, "Donation status updated successfully"));
});


const getMyDonations = asyncHandler(async (req, res) => {
    const donations = await Donation.find({
        donorId: req.user._id,
        status: "completed",
    })
        .populate("campaignId", "title cause")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, donations, "Your donations fetched successfully"));
});

const getReceivedDonations = asyncHandler(async (req, res) => {
    const campaigns = await DonationRequest.find({ farmer: req.user._id });
    const campaignIds = campaigns.map(c => c._id);

    const donations = await Donation.find({
        campaignId: { $in: campaignIds },
        status: "completed"
    }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, donations, "Received donations fetched successfully"));
});

export {
    getAllDonations,
    getDonationById,
    createDonation,
    verifyDonation,
    updateDonationStatus,
    getMyDonations,
    getReceivedDonations,
};      