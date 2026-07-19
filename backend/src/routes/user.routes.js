import { Router } from "express";
import {
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
    sendRegistrationEmailOtp,
    verifyRegistrationEmailOtp,
    sendRegistrationPhoneOtp,
    verifyRegistrationPhoneOtp,
    sendLoginOtp,
    loginWithOtp,
    forgotPassword,
    resetPassword,
    verifyUpiId,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { otpLimiter } from "../middlewares/rateLimiter.middleware.js";
const router = Router();

// public routes
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// ── Pre-registration verification (no account exists yet) ──
router.route("/register/send-email-otp").post(otpLimiter, sendRegistrationEmailOtp);
router.route("/register/verify-email-otp").post(otpLimiter, verifyRegistrationEmailOtp);
router.route("/register/send-phone-otp").post(otpLimiter, sendRegistrationPhoneOtp);
router.route("/register/verify-phone-otp").post(otpLimiter, verifyRegistrationPhoneOtp);

// ── OTP-based login (email or phone, no password) ──
router.route("/send-login-otp").post(otpLimiter, sendLoginOtp);
router.route("/login-otp").post(otpLimiter, loginWithOtp);

// ── Forgot / reset password ──
router.route("/forgot-password").post(otpLimiter, forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/payout-details").patch(verifyJWT, authorizeRoles("farmer"), updatePayoutDetails);
// Post-account phone OTP — kept as a safety net; registration verifies
// phone before the account exists now, so this should rarely be hit.
router.route("/send-otp").post(verifyJWT, otpLimiter, sendPhoneOtp);
router.route("/verify-otp").post(verifyJWT, otpLimiter, verifyPhoneOtp);
router.route("/pending-farmer-orders").get(verifyJWT, getPendingFarmerOrderCount);
router.route("/verify-upi").post(verifyJWT, verifyUpiId);
export default router;
