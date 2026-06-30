import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { CropListing } from "../models/cropListing.model.js";
import { Order } from "../models/order.model.js";
import { Donation } from "../models/donation.model.js";
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
        Donation.countDocuments(),
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
                users:    { total: totalUsers, farmers: totalFarmers, buyers: totalBuyers },
                listings: { total: totalListings, pending: pendingListings, approved: approvedListings },
                orders:   { total: totalOrders, paid: paidOrders },
                donations:{ total: totalDonations },
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
    if (role)   query.role = role
    if (search) query.$or = [
        { name:  { $regex: search, $options: "i" } },
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
    if (orderStatus)   query.orderStatus   = orderStatus

    const skip = (Number(page) - 1) * Number(limit)

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate("buyer",  "name email phone")
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
    const donations = await Donation.find()
        .populate("donorId", "name email")
        .sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, donations, "Donations fetched")
    )
})

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
}