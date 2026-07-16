import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      // NOTE: not globally unique anymore. The same person can hold a
      // farmer account and a buyer account under the same email — those
      // are two separate documents. Uniqueness is enforced per (email, role)
      // via the compound index below instead.
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["farmer", "buyer", "admin"],
      default: "farmer",
    },
    avatar: {
      type: String, // cloudinary URL
    },

    payoutDetails: {
    upiId:             { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    ifscCode:          { type: String, trim: true },
    accountHolderName: { type: String, trim: true },
    },
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Phone (OTP) verification ──
    // Kept flat (rather than nested) so `.select("+phoneOtp +phoneOtpExpiry
    // +phoneOtpAttempts")` in the controller can pull exactly what it needs.
    // All three are excluded by default so a normal user fetch/`/me` call
    // never leaks OTP state, hashed or not.
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phoneOtp: {
      type: String, // SHA-256 hash of the OTP — never stored in plain text
      select: false,
    },
    phoneOtpExpiry: {
      type: Date,
      select: false,
    },
    phoneOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    // Server-side resend cooldown — the frontend timer is just UX, this is
    // what actually stops someone hitting /send-otp in a loop.
    phoneOtpLastSentAt: {
      type: Date,
      select: false,
    },

    // ── Email OTP ──
    // Reused for two purposes: (a) re-verifying an email post-account in
    // case that's ever needed, and (b) login-via-email-OTP. Registration
    // itself verifies email through PendingVerification, before the
    // account exists, so these start empty for every new account.
    emailOtp: {
      type: String,
      select: false,
    },
    emailOtpExpiry: {
      type: Date,
      select: false,
    },
    emailOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    emailOtpLastSentAt: {
      type: Date,
      select: false,
    },

    // ── Login-via-OTP (email or phone, no password) ──
    // Separate from phoneOtp/emailOtp above (those are for *verifying
    // ownership* of a channel during registration) — this is a distinct
    // short-lived code issued specifically to authenticate an existing,
    // already-verified account.
    loginOtp: {
      type: String,
      select: false,
    },
    loginOtpExpiry: {
      type: Date,
      select: false,
    },
    loginOtpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    loginOtpLastSentAt: {
      type: Date,
      select: false,
    },

    // ── Password reset ──
    resetPasswordToken: {
      type: String, // SHA-256 hash of the reset token — never store it raw
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },

    // ── Login lockout ──
    // Failed *password* attempts (OTP already has its own attempt cap).
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockedUntil: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// One account per (email, role) — lets the same person hold both a
// farmer account and a buyer account under the same email address.
userSchema.index({ email: 1, role: 1 }, { unique: true });

// hash password before saving, only if it was modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
  //next();
});

// instance method to check password on login
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// instance method to generate short-lived access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// instance method to generate long-lived refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
