    // src/controllers/donation.controller.js

    import { Donation } from "../models/donation.model.js";
    import { ApiError } from "../utils/ApiError.js";
    import { ApiResponse } from "../utils/ApiResponse.js";
    import { asyncHandler } from "../utils/asyncHandler.js";


    const getAllDonations = asyncHandler(async (req, res) => {
        const donations = await Donation.find()
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
        const { amount, cause, paymentId } = req.body;

        if (!amount || !cause) {
            throw new ApiError(400, "Amount and cause are required");
        }

        const donation = await Donation.create({
            donorName: req.user.name,   // from verifyJWT
            donorId: req.user._id,      // from verifyJWT
            amount,
            cause,
            paymentId,                  // comes from Razorpay after payment
            status: paymentId ? "completed" : "pending",
        });

        return res
            .status(201)
            .json(new ApiResponse(201, donation, "Donation created successfully"));
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
        const donations = await Donation.find({ donorId: req.user._id })
            .sort({ createdAt: -1 });

        return res
            .status(200)
            .json(new ApiResponse(200, donations, "Your donations fetched successfully"));
    });

    export {
        getAllDonations,
        getDonationById,
        createDonation,
        updateDonationStatus,
        getMyDonations,
    };      