// src/controllers/donationRequest.controller.js

import { DonationRequest } from "../models/donationRequest.model.js";
import { Donation } from "../models/donation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── POST /v1/donation-requests  (farmer only) ────────────────────────────────
const createRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== "farmer") {
    throw new ApiError(403, "Only farmers can raise donation requests");
  }

  const { title, cause, targetAmount, description } = req.body;

  if (!title || !cause || !targetAmount) {
    throw new ApiError(400, "Title, cause and target amount are required");
  }

  if (Number(targetAmount) <= 0) {
    throw new ApiError(400, "Target amount must be greater than 0");
  }

  const request = await DonationRequest.create({
    farmer: req.user._id,
    farmerName: req.user.name,
    title,
    cause,
    targetAmount: Number(targetAmount),
    description: description || "",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Donation request submitted successfully"));
});

// ── GET /v1/donation-requests/mine  (farmer only) ────────────────────────────
const getMyRequests = asyncHandler(async (req, res) => {
  if (req.user.role !== "farmer") {
    throw new ApiError(403, "Only farmers can view their donation requests");
  }

  const requests = await DonationRequest.find({ farmer: req.user._id })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "Your donation requests fetched"));
});

// ── GET /v1/donation-requests  (public — approved only) ─────────────────────
const getApprovedCampaigns = asyncHandler(async (req, res) => {
  const { cause } = req.query;
  const query = { status: "approved" };
  if (cause && cause !== "all") query.cause = cause;

  const campaigns = await DonationRequest.find(query)
    .populate("farmer", "name")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, campaigns, "Approved campaigns fetched"));
});

// ── GET /v1/donation-requests/:id  (public) ──────────────────────────────────
const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await DonationRequest.findById(req.params.id)
    .populate("farmer", "name");

  if (!campaign) {
    throw new ApiError(404, "Campaign not found");
  }

  if (campaign.status !== "approved") {
    throw new ApiError(403, "This campaign is not publicly available");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, campaign, "Campaign fetched"));
});

// ── Admin: GET /v1/admin/donation-requests ───────────────────────────────────
const getAllRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const requests = await DonationRequest.find(query)
    .populate("farmer", "name email phone")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, requests, "All donation requests fetched"));
});

// ── Admin: PATCH /v1/admin/donation-requests/:id/approve ─────────────────────
const approveRequest = asyncHandler(async (req, res) => {
  const request = await DonationRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Donation request not found");

  request.status = "approved";
  request.adminNote = "";
  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Donation request approved"));
});

// ── Admin: PATCH /v1/admin/donation-requests/:id/reject ──────────────────────
const rejectRequest = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;
  const request = await DonationRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Donation request not found");

  request.status = "rejected";
  request.adminNote = adminNote || "";
  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Donation request rejected"));
});

export {
  createRequest,
  getMyRequests,
  getApprovedCampaigns,
  getCampaignById,
  getAllRequests,
  approveRequest,
  rejectRequest,
};
