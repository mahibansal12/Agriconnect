import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,                 // limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many requests, please try again later.",
    },
});

// OTP endpoints hit Twilio (real money per SMS) and are a classic abuse
// target (spam-bombing someone else's phone, or brute-forcing a 6-digit
// code), so they get a much tighter limit than general API traffic.
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 8,                    // 8 send/verify attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many OTP requests. Please wait a bit before trying again.",
    },
});

export { apiLimiter, otpLimiter };