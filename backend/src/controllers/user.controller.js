import jwt from "jsonwebtoken";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { PendingVerification } from "../models/pendingVerification.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Order } from "../models/order.model.js";
import { sendOTPSms } from "../services/sms.service.js";
import { sendWelcomeEmail, sendOtpEmail, sendPasswordResetEmail } from "../services/email.service.js";
import {
    OTP_EXPIRY_MINUTES,
    OTP_MAX_VERIFY_ATTEMPTS,
    OTP_RESEND_COOLDOWN_SECONDS,
    RESET_TOKEN_EXPIRY_MINUTES,
    LOGIN_MAX_PASSWORD_ATTEMPTS,
    LOGIN_LOCKOUT_MINUTES,
} from "../constants.js";

// OTP is 6 digits, e.g. 483920
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// we never store the raw OTP (or reset token) in the DB — only its SHA-256
// hash — so that a DB read (or leak) can't hand out live codes
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const normalizeEmail = (email) => email.trim().toLowerCase();
const normalizePhone = (phone) => phone.trim();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

// ─────────────────────────────────────────────────────────────────────────
// ── Pre-registration verification (email + phone, BEFORE an account exists)
// ─────────────────────────────────────────────────────────────────────────
// Registration used to create the account first, then verify phone
// afterward as a final step. Now both email and phone are verified inline,
// one field at a time, before the "create account" button is even
// reachable — so these four endpoints work against PendingVerification
// records keyed by the raw email/phone, not against a User document.

const sendRegistrationEmailOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "email is required");
    const identifier = normalizeEmail(email);

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(identifier)) {
        throw new ApiError(400, "Invalid email format");
    }

    const existing = await PendingVerification.findOne({ identifier, type: "email" });
    if (existing?.lastSentAt) {
        const secondsSince = (Date.now() - existing.lastSentAt.getTime()) / 1000;
        if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
            throw new ApiError(
                429,
                `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting another code`
            );
        }
    }

    const otp = generateOtp();

    try {
        await sendOtpEmail(identifier, otp);
    } catch (err) {
        console.error("Failed to send registration email OTP:", err.message);
        throw new ApiError(502, "Could not send the verification email right now. Please try again.");
    }

    await PendingVerification.findOneAndUpdate(
        { identifier, type: "email" },
        {
            otpHash: hashOtp(otp),
            otpExpiry: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            attempts: 0,
            verified: false,
            lastSentAt: new Date(),
        },
        { upsert: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, { email: identifier }, "Verification code sent to email"));
});

const verifyRegistrationEmailOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) throw new ApiError(400, "email and otp are required");
    const identifier = normalizeEmail(email);

    const record = await PendingVerification.findOne({ identifier, type: "email" });
    if (!record) throw new ApiError(400, "No verification code was requested for this email");
    if (record.verified) {
        return res.status(200).json(new ApiResponse(200, { verified: true }, "Email already verified"));
    }
    if (record.otpExpiry.getTime() < Date.now()) {
        throw new ApiError(400, "Code has expired. Please request a new one.");
    }
    if (record.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        throw new ApiError(429, "Too many incorrect attempts. Please request a new code.");
    }
    if (hashOtp(otp) !== record.otpHash) {
        record.attempts += 1;
        await record.save();
        throw new ApiError(400, "Incorrect code");
    }

    record.verified = true;
    record.verifiedAt = new Date();
    await record.save();

    return res.status(200).json(new ApiResponse(200, { verified: true }, "Email verified"));
});

const sendRegistrationPhoneOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    if (!phone) throw new ApiError(400, "phone is required");
    const identifier = normalizePhone(phone);

    const existing = await PendingVerification.findOne({ identifier, type: "phone" });
    if (existing?.lastSentAt) {
        const secondsSince = (Date.now() - existing.lastSentAt.getTime()) / 1000;
        if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
            throw new ApiError(
                429,
                `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting another OTP`
            );
        }
    }

    const otp = generateOtp();

    try {
        await sendOTPSms(identifier, otp);
    } catch (err) {
        console.error("Failed to send registration phone OTP:", err.message);
        throw new ApiError(502, "Could not send OTP right now. Please check the number and try again.");
    }

    await PendingVerification.findOneAndUpdate(
        { identifier, type: "phone" },
        {
            otpHash: hashOtp(otp),
            otpExpiry: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            attempts: 0,
            verified: false,
            lastSentAt: new Date(),
        },
        { upsert: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, { phone: identifier }, "OTP sent to phone"));
});

const verifyRegistrationPhoneOtp = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) throw new ApiError(400, "phone and otp are required");
    const identifier = normalizePhone(phone);

    const record = await PendingVerification.findOne({ identifier, type: "phone" });
    if (!record) throw new ApiError(400, "No OTP was requested for this number");
    if (record.verified) {
        return res.status(200).json(new ApiResponse(200, { verified: true }, "Phone already verified"));
    }
    if (record.otpExpiry.getTime() < Date.now()) {
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }
    if (record.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        throw new ApiError(429, "Too many incorrect attempts. Please request a new OTP.");
    }
    if (hashOtp(otp) !== record.otpHash) {
        record.attempts += 1;
        await record.save();
        throw new ApiError(400, "Incorrect OTP");
    }

    record.verified = true;
    record.verifiedAt = new Date();
    await record.save();

    return res.status(200).json(new ApiResponse(200, { verified: true }, "Phone verified"));
});

// ─────────────────────────────────────────────────────────────────────────
// ── Register / Login / Logout / Refresh
// ─────────────────────────────────────────────────────────────────────────

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

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    // Both fields must already be verified via the inline registration-time
    // OTP flow — this replaces the old "verify phone after account
    // creation" step entirely. If either is missing/unverified, the person
    // skipped a step (or is calling the API directly) — refuse instead of
    // creating an unverified account.
    const emailVerification = await PendingVerification.findOne({
        identifier: normalizedEmail,
        type: "email",
        verified: true,
    });
    if (!emailVerification) {
        throw new ApiError(400, "Please verify your email before creating an account");
    }

    const phoneVerification = await PendingVerification.findOne({
        identifier: normalizedPhone,
        type: "phone",
        verified: true,
    });
    if (!phoneVerification) {
        throw new ApiError(400, "Please verify your phone number before creating an account");
    }

    // A person can hold one account per role (e.g. a farmer account AND a
    // buyer account under the same email) — so the duplicate check must be
    // scoped to (email, role), not email alone.
    const existedUser = await User.findOne({ email: normalizedEmail, role });

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
        email: normalizedEmail,
        password,
        phone: normalizedPhone,
        role,
        avatar: avatarUrl,
        isEmailVerified: true,
        isPhoneVerified: true,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Consume the verification records so they can't be reused for another
    // account (e.g. registering a second role with the same email/phone
    // still needs its own fresh verification).
    await PendingVerification.deleteMany({
        $or: [
            { identifier: normalizedEmail, type: "email" },
            { identifier: normalizedPhone, type: "phone" },
        ],
    });

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
    // Accept either `identifier` (email or phone) or the legacy `email`
    // field — keeps registerUser's auto-login and any existing callers
    // working without changes, while letting the login form support
    // password login via phone number too.
    const { identifier, email, password, role } = req.body;
    const rawIdentifier = identifier || email;

    if (!rawIdentifier || !password) {
        throw new ApiError(400, "Email/phone and password are required");
    }

    const isEmail = rawIdentifier.includes("@");
    const cleanIdentifier = isEmail ? normalizeEmail(rawIdentifier) : normalizePhone(rawIdentifier);
    const query = isEmail
        ? { email: cleanIdentifier, ...(role && { role }) }
        : { phone: cleanIdentifier, ...(role && { role }) };

    const matches = await User.find(query)
        .select("+failedLoginAttempts +lockedUntil")
        .limit(role ? 1 : 2);

    if (matches.length === 0) {
        throw new ApiError(
            404,
            role ? `No ${role} account exists with this ${isEmail ? "email" : "phone number"}` : "User does not exist"
        );
    }

    if (matches.length > 1) {
        throw new ApiError(
            409,
            "Multiple accounts exist for this. Please specify which role you're signing in as."
        );
    }

    const user = matches[0];

    // Account lockout after repeated failed password attempts
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
        const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        throw new ApiError(423, `Too many failed attempts. Try again in ${minutesLeft} minute(s).`);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= LOGIN_MAX_PASSWORD_ATTEMPTS) {
            user.lockedUntil = new Date(Date.now() + LOGIN_LOCKOUT_MINUTES * 60 * 1000);
            user.failedLoginAttempts = 0;
            await user.save({ validateBeforeSave: false });
            throw new ApiError(423, `Too many failed attempts. Account locked for ${LOGIN_LOCKOUT_MINUTES} minutes.`);
        }
        await user.save({ validateBeforeSave: false });
        throw new ApiError(401, "Invalid credentials");
    }

    // successful login — clear any lockout state
    if (user.failedLoginAttempts || user.lockedUntil) {
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        await user.save({ validateBeforeSave: false });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "Logged in successfully"
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────
// ── Login via OTP (email OR phone — no password) ──
// ─────────────────────────────────────────────────────────────────────────
// The person picks "log in with OTP" and gives either their email or
// phone number. We detect which one it is (an "@" means email), find the
// matching account, and text/email a code to THAT SAME channel — an OTP
// is only ever sent to the channel the person is proving they control.

const sendLoginOtp = asyncHandler(async (req, res) => {
    const { identifier, role } = req.body;
    if (!identifier) throw new ApiError(400, "identifier is required");

    const isEmail = identifier.includes("@");
    const cleanIdentifier = isEmail ? normalizeEmail(identifier) : normalizePhone(identifier);
    const query = isEmail
        ? { email: cleanIdentifier, ...(role && { role }) }
        : { phone: cleanIdentifier, ...(role && { role }) };

    const matches = await User.find(query)
        .select("+loginOtpLastSentAt")
        .limit(role ? 1 : 2);

    if (matches.length === 0) throw new ApiError(404, "No account found with this " + (isEmail ? "email" : "phone number"));
    if (matches.length > 1) {
        throw new ApiError(409, "Multiple accounts exist. Please specify which role you're signing in as.");
    }

    const user = matches[0];

    if (user.loginOtpLastSentAt) {
        const secondsSince = (Date.now() - user.loginOtpLastSentAt.getTime()) / 1000;
        if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
            throw new ApiError(
                429,
                `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting another code`
            );
        }
    }

    const otp = generateOtp();

    try {
        if (isEmail) await sendOtpEmail(user.email, otp);
        else await sendOTPSms(user.phone, otp);
    } catch (err) {
        console.error("Failed to send login OTP:", err.message);
        throw new ApiError(502, "Could not send the code right now. Please try again.");
    }

    user.loginOtp = hashOtp(otp);
    user.loginOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.loginOtpAttempts = 0;
    user.loginOtpLastSentAt = new Date();
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { channel: isEmail ? "email" : "phone" }, "OTP sent"));
});

const loginWithOtp = asyncHandler(async (req, res) => {
    const { identifier, otp, role } = req.body;
    if (!identifier || !otp) throw new ApiError(400, "identifier and otp are required");

    const isEmail = identifier.includes("@");
    const cleanIdentifier = isEmail ? normalizeEmail(identifier) : normalizePhone(identifier);
    const query = isEmail
        ? { email: cleanIdentifier, ...(role && { role }) }
        : { phone: cleanIdentifier, ...(role && { role }) };

    const user = await User.findOne(query).select("+loginOtp +loginOtpExpiry +loginOtpAttempts");
    if (!user) throw new ApiError(404, "No account found");

    if (!user.loginOtp || !user.loginOtpExpiry) {
        throw new ApiError(400, "No OTP was requested for this account. Please request one.");
    }
    if (user.loginOtpExpiry.getTime() < Date.now()) {
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }
    if (user.loginOtpAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
        throw new ApiError(429, "Too many incorrect attempts. Please request a new OTP.");
    }
    if (hashOtp(otp) !== user.loginOtp) {
        user.loginOtpAttempts += 1;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(400, "Incorrect OTP");
    }

    user.loginOtp = undefined;
    user.loginOtpExpiry = undefined;
    user.loginOtpAttempts = 0;
    // a successful OTP login is as good as a password one — clear lockout too
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "Logged in successfully"
            )
        );
});

// ─────────────────────────────────────────────────────────────────────────
// ── Forgot / Reset password ──
// ─────────────────────────────────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    if (!email) throw new ApiError(400, "email is required");

    const normalizedEmail = normalizeEmail(email);
    const query = role ? { email: normalizedEmail, role } : { email: normalizedEmail };
    const matches = await User.find(query).limit(5);

    // Always respond the same way whether or not the account exists —
    // otherwise this endpoint becomes a way to check which emails are
    // registered on the platform.
    const genericResponse = () =>
        res.status(200).json(
            new ApiResponse(200, {}, "If an account exists, a password reset link has been sent")
        );

    if (matches.length === 0) return genericResponse();

    // Trim CORS_ORIGIN to avoid leading/trailing whitespace in .env values
    const baseUrl = (process.env.CORS_ORIGIN || "http://localhost:5173").trim().replace(/\/$/, "");

    // Send a reset email to every matched account (handles same email across
    // multiple roles — e.g. a user who has both a farmer and a buyer account).
    for (const user of matches) {
        const rawToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = hashOtp(rawToken);
        user.resetPasswordExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        const resetLink = `${baseUrl}/reset-password/${rawToken}?role=${user.role}`;

        try {
            await sendPasswordResetEmail(user.email, user.name, resetLink);
        } catch (err) {
            console.error(`Failed to send password reset email to ${user.email} (${user.role}):`, err.message);
        }
    }

    return genericResponse();
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) throw new ApiError(400, "New password is required");
    if (password.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

    const tokenHash = hashOtp(token);
    const user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpiry: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpiry");

    if (!user) {
        throw new ApiError(400, "This reset link is invalid or has expired. Please request a new one.");
    }

    user.password = password; // pre-save hook hashes it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    // a password reset is a good moment to also clear any lockout
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password has been reset. Please log in with your new password."));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
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

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
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

// ── Send OTP to a new email before allowing an email-address change ──
// POST /v1/user/send-email-change-otp  (private)
const sendEmailChangeOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "email is required");

    const newEmail = normalizeEmail(email);

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newEmail)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Don't allow changing to the same email
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) throw new ApiError(404, "User not found");
    if (currentUser.email === newEmail) {
        throw new ApiError(400, "This is already your current email address");
    }

    // Check if another account already uses that email + same role
    const conflict = await User.findOne({ email: newEmail, role: currentUser.role, _id: { $ne: currentUser._id } });
    if (conflict) {
        throw new ApiError(409, "An account with this email already exists for your role");
    }

    // Rate-limit: reuse the emailOtpLastSentAt field
    const userWithOtp = await User.findById(req.user._id).select("+emailOtpLastSentAt +pendingEmail");
    if (userWithOtp.emailOtpLastSentAt) {
        const secondsSince = (Date.now() - userWithOtp.emailOtpLastSentAt.getTime()) / 1000;
        if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
            throw new ApiError(
                429,
                `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting another code`
            );
        }
    }

    const otp = generateOtp();

    try {
        await sendOtpEmail(newEmail, otp);
    } catch (err) {
        console.error("Failed to send email-change OTP:", err.message);
        throw new ApiError(502, "Could not send verification email. Please try again.");
    }

    // Store hash + pending new email on the user document
    userWithOtp.emailOtp = hashOtp(otp);
    userWithOtp.emailOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    userWithOtp.emailOtpAttempts = 0;
    userWithOtp.emailOtpLastSentAt = new Date();
    userWithOtp.pendingEmail = newEmail;
    await userWithOtp.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { sentTo: newEmail }, "Verification code sent to new email address"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email, otp } = req.body;

    if (!name && !email) {
        throw new ApiError(400, "Name or email is required to update");
    }

    const currentUser = await User.findById(req.user?._id)
        .select("+emailOtp +emailOtpExpiry +emailOtpAttempts +pendingEmail");
    if (!currentUser) throw new ApiError(404, "User not found");

    const isChangingEmail = email && normalizeEmail(email) !== currentUser.email;

    if (isChangingEmail) {
        // Require OTP to confirm the new email
        if (!otp) throw new ApiError(400, "A verification code is required to change your email address");

        const targetEmail = normalizeEmail(email);
        if (currentUser.pendingEmail !== targetEmail) {
            throw new ApiError(400, "This email does not match the address you requested a code for. Please request a new code.");
        }
        if (!currentUser.emailOtp || !currentUser.emailOtpExpiry) {
            throw new ApiError(400, "No verification code found. Please request one first.");
        }
        if (currentUser.emailOtpExpiry.getTime() < Date.now()) {
            throw new ApiError(400, "Verification code has expired. Please request a new one.");
        }
        if (currentUser.emailOtpAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
            throw new ApiError(429, "Too many incorrect attempts. Please request a new code.");
        }
        if (hashOtp(otp) !== currentUser.emailOtp) {
            currentUser.emailOtpAttempts += 1;
            await currentUser.save({ validateBeforeSave: false });
            throw new ApiError(400, "Incorrect verification code");
        }

        // OTP valid — clear it and apply the change
        currentUser.email = targetEmail;
        currentUser.isEmailVerified = true;
        currentUser.emailOtp = undefined;
        currentUser.emailOtpExpiry = undefined;
        currentUser.emailOtpAttempts = 0;
        currentUser.pendingEmail = undefined;
    }

    if (name) currentUser.name = name.trim();
    await currentUser.save({ validateBeforeSave: false });

    const updated = await User.findById(currentUser._id).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Account details updated successfully"));
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

// ── Post-account phone OTP (kept as a safety net) ──
// Registration now verifies phone before the account ever exists, so this
// should rarely be needed — but it stays here for any grandfathered/edge
// case account that's somehow still unverified.
// POST /api/v1/user/send-otp — Private, requires a valid access token.
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

    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpiry = undefined;
    user.phoneOtpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { isPhoneVerified: true }, "Phone number verified successfully"));
});

// ── Mock UPI Verification ──
const verifyUpiId = asyncHandler(async (req, res) => {
    const { upiId } = req.body;
    if (!upiId) {
        throw new ApiError(400, "UPI ID is required");
    }

    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId)) {
        throw new ApiError(400, "Invalid UPI ID format");
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    if (upiId.endsWith("@invalid")) {
        throw new ApiError(400, "UPI ID could not be verified. It may be inactive or incorrect.");
    }

    const prefix = upiId.split('@')[0];
    const mockName = prefix.replace(/[.\-_0-9]/g, ' ').trim().toUpperCase() || 'VERIFIED USER';

    return res.status(200).json(
        new ApiResponse(200, {
            vpa: upiId,
            name: mockName,
            status: "VALID"
        }, "UPI ID verified successfully")
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    sendEmailChangeOtp,
    updateAccountDetails,
    updateUserAvatar,
    updatePayoutDetails,
    getPendingFarmerOrderCount,
    sendPhoneOtp,
    verifyPhoneOtp,
    sendRegistrationEmailOtp,
    verifyRegistrationEmailOtp,
    sendRegistrationPhoneOtp,
    verifyRegistrationPhoneOtp,
    sendLoginOtp,
    loginWithOtp,
    forgotPassword,
    resetPassword,
    verifyUpiId,
};
