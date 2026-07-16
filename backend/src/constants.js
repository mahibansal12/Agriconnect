export const DB_NAME = "agriconnect";
export const PLATFORM_COMMISSION_PERCENT = 5; // 5% commission on each order

// ── OTP config ──
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_VERIFY_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

// ── Password reset ──
export const RESET_TOKEN_EXPIRY_MINUTES = 60;

// ── Login lockout (password attempts only — OTP has its own attempt cap) ──
export const LOGIN_MAX_PASSWORD_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;
