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

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/payout-details").patch(verifyJWT, authorizeRoles("farmer"), updatePayoutDetails);
// OTP routes need auth too — req.user._id is used to look up the account,
// never a body-supplied id (that would let anyone spam-SMS any phone
// number in the DB). registerUser's auto-login and loginUser both already
// hand back a valid access token before the OTP screen ever renders.
router.route("/send-otp").post(verifyJWT, otpLimiter, sendPhoneOtp);
router.route("/verify-otp").post(verifyJWT, otpLimiter, verifyPhoneOtp);
router.route("/pending-farmer-orders").get(verifyJWT, getPendingFarmerOrderCount);
export default router;