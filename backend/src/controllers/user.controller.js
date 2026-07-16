import jwt from "jsonwebtoken";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Order } from "../models/order.model.js";
import { sendOTPSms } from "../services/sms.service.js";
import { sendWelcomeEmail } from "../services/email.service.js";
import { OTP_EXPIRY_MINUTES, OTP_MAX_VERIFY_ATTEMPTS, OTP_RESEND_COOLDOWN_SECONDS } from "../constants.js";

// OTP is 6 digits, e.g. 483920
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// we never store the raw OTP in the DB — only its SHA-256 hash — so that a
// DB read (or leak) can't hand out live OTPs
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        // console.log("ACCESS_TOKEN_SECRET →", process.env.ACCESS_TOKEN_SECRET)  // 
        // console.log("REFRESH_TOKEN_SECRET →", process.env.REFRESH_TOKEN_SECRET)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        //console.error("Actual error →", error)
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if ([name, email, password, phone].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    const allowedRoles = ["farmer", "buyer"];
    if (!allowedRoles.includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    // A person can hold one account per role (e.g. a farmer account AND a
    // buyer account under the same email) — so the duplicate check must be
    // scoped to (email, role), not email alone.
    const existedUser = await User.findOne({ email, role });

    if (existedUser) {
        throw new ApiError(
            409,
            `You already have a ${role} account with this email. Please log in instead.`
        );
    }

    let avatarUrl = "";
    const avatarLocalPath = req.file?.path;

    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        avatarUrl = avatar?.url || "";
    }
    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: allowedRoles.includes(role) ? role : "farmer",
        avatar: avatarUrl,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // fire off the first OTP right away so the frontend can move straight
    // into the "verify your phone" step. Don't fail registration if the
    // SMS provider hiccups — the user can always hit "resend OTP".
    try {
        const otp = generateOtp();
        user.phoneOtp = hashOtp(otp);
        user.phoneOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        user.phoneOtpAttempts = 0;
        user.phoneOtpLastSentAt = new Date();
        await user.save({ validateBeforeSave: false });
        await sendOTPSms(user.phone, otp);
    } catch (err) {
        console.error("Failed to send registration OTP:", err.message);
    }

    // Welcome email — purely a nice-to-have, never block registration on it
    try {
        await sendWelcomeEmail(user.email, user.name);
    } catch (err) {
        console.error("Failed to send welcome email:", err.message);
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Since one email can now back multiple accounts (one per role), we
    // need `role` to know which account to log into whenever more than one
    // exists. If the caller didn't send a role (e.g. plain email/password
    // login from a bookmark), fall back to email-only lookup — but if that
    // turns out to be ambiguous, ask the client to specify a role instead
    // of silently picking one.
    const query = role ? { email, role } : { email };
    const matches = await User.find(query).limit(role ? 1 : 2);

    if (matches.length === 0) {
        throw new ApiError(
            404,
            role ? `No ${role} account exists with this email` : "User does not exist"
        );
    }

    if (matches.length > 1) {
        throw new ApiError(
            409,
            "Multiple accounts exist for this email. Please specify which role you're signing in as."
        );
    }

    const user = matches[0];

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "Logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or already used");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    if (!name && !email) {
        throw new ApiError(400, "Name or email is required to update");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { name, email } },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updatePayoutDetails = asyncHandler(async (req, res) => {
    const { upiId, bankAccountNumber, ifscCode, accountHolderName } = req.body;

    if (!upiId && !bankAccountNumber) {
        throw new ApiError(400, "Provide at least a UPI ID or bank account number");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                "payoutDetails.upiId": upiId,
                "payoutDetails.bankAccountNumber": bankAccountNumber,
                "payoutDetails.ifscCode": ifscCode,
                "payoutDetails.accountHolderName": accountHolderName,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Payout details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar?.url) {
        throw new ApiError(500, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// Farmer/buyer are separate accounts now (one per role, same email allowed),
// so "switching" happens by logging into/restoring the other account rather
// than mutating this account's role in place. Kept here only so a farmer
// can check whether they're safe to log out of/away from their farmer
// account (pending orders waiting on them).
const getPendingFarmerOrderCount = asyncHandler(async (req, res) => {
    if (req.user.role !== "farmer") {
        return res
            .status(200)
            .json(new ApiResponse(200, { pendingCount: 0 }, "Not a farmer account"));
    }

    const pendingCount = await Order.countDocuments({
        farmer: req.user._id,
        orderStatus: { $in: ["placed", "confirmed", "shipped"] },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { pendingCount }, "Pending order count fetched"));
});

// ── Send Phone OTP ──
// POST /api/v1/user/send-otp
// Private — requires a valid access token (issued at register/login).
// Uses req.user._id, NOT a body-supplied userId — accepting an arbitrary
// id here would let anyone spam OTP SMS to any phone number in the DB.
const sendPhoneOtp = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select(
        "+phoneOtpLastSentAt +phoneOtpAttempts"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isPhoneVerified) {
        return res
            .status(200)
            .json(new ApiResponse(200, { alreadyVerified: true }, "Phone is already verified"));
    }

    // Server-side cooldown — the frontend's 30s timer is just UX, this is
    // the real enforcement so hammering the endpoint directly doesn't work.
    if (user.phoneOtpLastSentAt) {
        const secondsSinceLastSend = (Date.now() - user.phoneOtpLastSentAt.getTime()) / 1000;
        if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
            const wait = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
            throw new ApiError(429, `Please wait ${wait}s before requesting another OTP`);
        }
    }

    const otp = generateOtp();

    user.phoneOtp = hashOtp(otp);
    user.phoneOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.phoneOtpAttempts = 0;
    user.phoneOtpLastSentAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Twilio call — SMS actually leaves the building here. A trial-mode
    // Twilio number, an unverified destination number, or any provider
    // hiccup throws here — surface it as a clear, actionable error instead
    // of a raw 500, since this endpoint's whole job is sending the SMS.
    try {
        await sendOTPSms(user.phone, otp);
    } catch (err) {
        console.error("Twilio send failed:", err.message);
        throw new ApiError(
            502,
            "Could not send OTP right now. Please check your number and try again in a moment."
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { phone: user.phone, expiresInMinutes: OTP_EXPIRY_MINUTES },
            "OTP sent successfully"
        )
    );
});

// ── Verify Phone OTP ──
// POST /api/v1/user/verify-otp
// Private — requires a valid access token. Body: { otp }
const verifyPhoneOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    if (!otp) {
        throw new ApiError(400, "otp is required");
    }

    const user = await User.findById(req.user._id).select(
        "+phoneOtp +phoneOtpExpiry +phoneOtpAttempts"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isPhoneVerified) {
        return res
            .status(200)
            .json(new ApiResponse(200, { alreadyVerified: true }, "Phone is already verified"));
    }

    if (!user.phoneOtp || !user.phoneOtpExpiry) {
        throw new ApiError(400, "No OTP was requested for this account. Please request a new OTP.");
    }

    if (user.phoneOtpExpiry.getTime() < Date.now()) {
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    if (user.phoneOtpAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        throw new ApiError(429, "Too many incorrect attempts. Please request a new OTP.");
    }

    if (hashOtp(otp) !== user.phoneOtp) {
        user.phoneOtpAttempts += 1;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(400, "Incorrect OTP");
    }

    // success — mark verified and clear OTP fields
    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpiry = undefined;
    user.phoneOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { isPhoneVerified: true }, "Phone number verified successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updatePayoutDetails,
    getPendingFarmerOrderCount,
    sendPhoneOtp,
    verifyPhoneOtp,
};