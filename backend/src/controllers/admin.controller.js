import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { CropListing } from "../models/cropListing.model.js";
import { Order } from "../models/order.model.js";
import { Donation } from "../models/donation.model.js";
import { DonationRequest } from "../models/donationRequest.model.js";
import { Payout } from "../models/payout.model.js";
import { News } from "../models/news.model.js";
import { Scheme } from "../models/scheme.model.js";

// Dashboard Stats 
// GET /api/v1/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {

    // run all counts in parallel for performance
    const [
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalListings,
        pendingListings,
        approvedListings,
        totalOrders,
        paidOrders,
        totalDonations,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "farmer" }),
        User.countDocuments({ role: "buyer" }),
        CropListing.countDocuments(),
        CropListing.countDocuments({ status: "pending" }),
        CropListing.countDocuments({ status: "approved" }),
        Order.countDocuments(),
        Order.countDocuments({ paymentStatus: "paid" }),
        Donation.countDocuments({ status: "completed" }),
    ])

    // recent 5 of each for quick overview
    const [recentUsers, recentListings, recentOrders] = await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
        CropListing.find().sort({ createdAt: -1 }).limit(5)
            .populate("farmer", "name").select("cropName status createdAt farmer"),
        Order.find().sort({ createdAt: -1 }).limit(5)
            .populate("buyer", "name").select("cropName totalPrice paymentStatus createdAt buyer"),
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            stats: {
                users: { total: totalUsers, farmers: totalFarmers, buyers: totalBuyers },
                listings: { total: totalListings, pending: pendingListings, approved: approvedListings },
                orders: { total: totalOrders, paid: paidOrders },
                donations: { total: totalDonations },
            },
            recent: { recentUsers, recentListings, recentOrders },
        }, "Dashboard stats fetched")
    )
})

//  Users 
// GET /api/v1/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query

    const query = {}
    if (role) query.role = role
    if (search) query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
    ]

    const skip = (Number(page) - 1) * Number(limit)

    const [users, total] = await Promise.all([
        User.find(query)
            .select("-password -refreshToken")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        User.countDocuments(query),
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
        }, "Users fetched")
    )
})

// GET /api/v1/admin/users/:id
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -refreshToken")

    if (!user) throw new ApiError(404, "User not found")

    // also get their listings and orders
    const [listings, orders] = await Promise.all([
        CropListing.find({ farmer: user._id }).select("cropName status createdAt"),
        Order.find({ $or: [{ buyer: user._id }, { farmer: user._id }] })
            .select("cropName totalPrice paymentStatus createdAt"),
    ])

    return res.status(200).json(
        new ApiResponse(200, { user, listings, orders }, "User fetched")
    )
})

// PATCH /api/v1/admin/users/:id/ban
const toggleBanUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) throw new ApiError(404, "User not found")

    if (user.role === "admin") {
        throw new ApiError(403, "Cannot ban another admin")
    }

    user.isActive = !user.isActive
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, { isActive: user.isActive },
            user.isActive ? "User unbanned successfully" : "User banned successfully"
        )
    )
})

// DELETE /api/v1/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) throw new ApiError(404, "User not found")

    if (user.role === "admin") {
        throw new ApiError(403, "Cannot delete another admin")
    }

    await User.findByIdAndDelete(req.params.id)

    return res.status(200).json(
        new ApiResponse(200, {}, "User deleted successfully")
    )
})

//  Listings 
// GET /api/v1/admin/listings
const getAllListings = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query

    const query = {}
    if (status) query.status = status

    const skip = (Number(page) - 1) * Number(limit)

    const [listings, total] = await Promise.all([
        CropListing.find(query)
            .populate("farmer", "name email phone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        CropListing.countDocuments(query),
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            listings,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
        }, "Listings fetched")
    )
})

// PATCH /api/v1/admin/listings/:id/approve
const approveListing = asyncHandler(async (req, res) => {
    const listing = await CropListing.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true }
    )

    if (!listing) throw new ApiError(404, "Listing not found")

    return res.status(200).json(
        new ApiResponse(200, listing, "Listing approved successfully")
    )
})

// PATCH /api/v1/admin/listings/:id/reject
const rejectListing = asyncHandler(async (req, res) => {
    const { reason } = req.body

    const listing = await CropListing.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
    )

    if (!listing) throw new ApiError(404, "Listing not found")

    return res.status(200).json(
        new ApiResponse(200, listing, "Listing rejected successfully")
    )
})

// DELETE /api/v1/admin/listings/:id
const deleteListing = asyncHandler(async (req, res) => {
    const listing = await CropListing.findByIdAndDelete(req.params.id)

    if (!listing) throw new ApiError(404, "Listing not found")

    return res.status(200).json(
        new ApiResponse(200, {}, "Listing deleted successfully")
    )
})

//  Orders 
// GET /api/v1/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, paymentStatus, orderStatus } = req.query

    const query = {}
    if (paymentStatus) query.paymentStatus = paymentStatus
    if (orderStatus) query.orderStatus = orderStatus

    const skip = (Number(page) - 1) * Number(limit)

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate("buyer", "name email phone")
            .populate("farmer", "name email phone")
            .populate("listing", "cropName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments(query),
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
        }, "Orders fetched")
    )
})

//  Donations 
// GET /api/v1/admin/donations
const getAllDonations = asyncHandler(async (req, res) => {
    const donations = await Donation.find({ status: { $in: ["completed", "pending", "failed"] } })
        .populate("donorId", "name email")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, donations, "Donations fetched")
    )
})

// GET /admin/payouts — how much you owe each farmer right now
const getPendingPayouts = asyncHandler(async (req, res) => {
    // 1. Aggregate pending order payouts per farmer
    const orderPayouts = await Order.aggregate([
        { $match: { paymentStatus: "paid", orderStatus: "delivered", payoutStatus: "pending" } },
        {
            $group: {
                _id: "$farmer",
                totalOwedOrders: { $sum: "$farmerPayoutAmount" },
                orderCount: { $sum: 1 },
            }
        }
    ]);

    // 2. Fetch all completed campaign donations that are pending payout
    const pendingDonations = await Donation.find({
        status: "completed",
        payoutStatus: { $ne: "paid" },
        campaignId: { $ne: null }
    }).populate("campaignId");

    // Group donations by farmer ID
    const donationMap = {};
    for (const d of pendingDonations) {
        if (d.campaignId && d.campaignId.farmer) {
            const fId = d.campaignId.farmer.toString();
            if (!donationMap[fId]) {
                donationMap[fId] = { amount: 0, count: 0 };
            }
            donationMap[fId].amount += d.amount;
            donationMap[fId].count += 1;
        }
    }

    // Find all unique farmers
    const farmerIds = new Set([
        ...orderPayouts.map(op => op._id.toString()),
        ...Object.keys(donationMap)
    ]);

    const payouts = [];
    for (const fId of farmerIds) {
        const farmerUser = await User.findById(fId);
        if (!farmerUser) continue;

        const orderInfo = orderPayouts.find(op => op._id.toString() === fId) || { totalOwedOrders: 0, orderCount: 0 };
        const donInfo = donationMap[fId] || { amount: 0, count: 0 };

        payouts.push({
            farmerId: fId,
            farmerName: farmerUser.name,
            payoutDetails: farmerUser.payoutDetails,
            orderCount: orderInfo.orderCount,
            ordersOwed: orderInfo.totalOwedOrders,
            donationCount: donInfo.count,
            donationsOwed: donInfo.amount,
            totalOwed: orderInfo.totalOwedOrders + donInfo.amount,
        });
    }

    return res.status(200).json(new ApiResponse(200, payouts, "Pending payouts fetched"));
});

// PATCH /admin/payouts/:farmerId/mark-paid — you paid them manually, record it
const markPayoutPaid = asyncHandler(async (req, res) => {
    const { farmerId } = req.params;

    const farmerUser = await User.findById(farmerId);
    if (!farmerUser) throw new ApiError(404, "Farmer not found");

    // 1. Find the orders that are about to be settled (need the amounts
    //    BEFORE we flip payoutStatus, otherwise the total is lost)
    const duePayoutOrders = await Order.find({
        farmer: farmerId,
        paymentStatus: "paid",
        orderStatus: "delivered",
        payoutStatus: "pending",
    });
    const ordersAmount = duePayoutOrders.reduce((sum, o) => sum + (o.farmerPayoutAmount || 0), 0);

    // 2. Find the completed donations for this farmer's campaigns that are due
    const myCampaigns = await DonationRequest.find({ farmer: farmerId });
    const myCampaignIds = myCampaigns.map(c => c._id);

    const dueDonations = await Donation.find({
        campaignId: { $in: myCampaignIds },
        status: "completed",
        payoutStatus: { $ne: "paid" },
    });
    const donationsAmount = dueDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

    const totalAmount = ordersAmount + donationsAmount;

    if (duePayoutOrders.length === 0 && dueDonations.length === 0) {
        throw new ApiError(400, "Nothing pending to pay out for this farmer");
    }

    const paidAt = new Date();

    // 3. Mark orders as paid
    const orderResult = await Order.updateMany(
        { _id: { $in: duePayoutOrders.map(o => o._id) } },
        { payoutStatus: "paid", payoutDate: paidAt }
    );

    // 4. Mark donations as paid
    const donationResult = await Donation.updateMany(
        { _id: { $in: dueDonations.map(d => d._id) } },
        { payoutStatus: "paid", payoutDate: paidAt }
    );

    // 5. Write a permanent payout history record
    const payoutRecord = await Payout.create({
        farmer: farmerId,
        farmerName: farmerUser.name,
        upiId: farmerUser.payoutDetails?.upiId || "",
        orderCount: duePayoutOrders.length,
        ordersAmount,
        donationCount: dueDonations.length,
        donationsAmount,
        totalAmount,
        paidAt,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ordersModified: orderResult.modifiedCount,
                donationsModified: donationResult.modifiedCount,
                payout: payoutRecord,
            },
            "Payout marked as paid"
        )
    );
});

// GET /admin/payouts/history — full record of every payout ever made
const getPayoutHistory = asyncHandler(async (req, res) => {
    const history = await Payout.find().sort({ paidAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, history, "Payout history fetched")
    );
});

// ── Donation Requests (Admin) ─────────────────────────────────────────────
// GET /api/v1/admin/donation-requests
const getAllDonationRequests = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const requests = await DonationRequest.find(query)
        .populate("farmer", "name email phone")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, requests, "Donation requests fetched")
    );
});

// PATCH /api/v1/admin/donation-requests/:id/approve
const approveDonationRequest = asyncHandler(async (req, res) => {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) throw new ApiError(404, "Donation request not found");

    request.status = "approved";
    request.adminNote = "";
    await request.save();

    return res.status(200).json(
        new ApiResponse(200, request, "Donation request approved")
    );
});

// PATCH /api/v1/admin/donation-requests/:id/reject
const rejectDonationRequest = asyncHandler(async (req, res) => {
    const { adminNote } = req.body;
    const request = await DonationRequest.findById(req.params.id);
    if (!request) throw new ApiError(404, "Donation request not found");

    request.status = "rejected";
    request.adminNote = adminNote || "";
    await request.save();

    return res.status(200).json(
        new ApiResponse(200, request, "Donation request rejected")
    );
});

// DELETE /api/v1/admin/donation-requests/:id
const deleteDonationRequest = asyncHandler(async (req, res) => {
    const request = await DonationRequest.findById(req.params.id);
    if (!request) throw new ApiError(404, "Donation request not found");

    await DonationRequest.findByIdAndDelete(req.params.id);

    return res.status(200).json(
        new ApiResponse(200, null, "Donation request deleted successfully")
    );
});

export {
    getDashboardStats,
    getAllUsers,
    getUserById,
    toggleBanUser,
    deleteUser,
    getAllListings,
    approveListing,
    rejectListing,
    deleteListing,
    getAllOrders,
    getAllDonations,
    getAllDonationRequests,
    approveDonationRequest,
    rejectDonationRequest,
    deleteDonationRequest,
    getPendingPayouts,
    markPayoutPaid,
    getPayoutHistory,
}