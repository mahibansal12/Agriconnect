// src/components/auth/OtpVerification.jsx
//
// Reusable 6-digit OTP screen. The backend has already sent the first OTP
// (registerUser fires one automatically on signup) — this component's job
// is to collect the code, verify it, and let the caller resend if needed.
// Requires the user to already be authenticated (registerUser/loginUser
// both hand back a valid access token before this ever renders) — the
// backend identifies which account to verify from that token, not from
// anything passed in here.
//
// Props:
//   phone    - phone number to display (masked) (required)
//   onVerified() - called once the OTP is confirmed
//   onCancel()   - optional "back" handler

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { sendPhoneOtp, verifyPhoneOtp } from "../../redux/slices/authSlice";

const RESEND_COOLDOWN = 30; // seconds

function maskPhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `${"•".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

export default function OtpVerification({ phone, onVerified, onCancel }) {
  const dispatch = useDispatch();
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const focusInput = (i) => inputsRef.current[i]?.focus();

  const handleChange = (i, value) => {
    const val = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
    setError("");
    if (val && i < 5) focusInput(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      focusInput(i - 1);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      pasted.split("").forEach((d, idx) => { next[idx] = d; });
      return next;
    });
    focusInput(Math.min(pasted.length, 5));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Enter the complete 6-digit code");
      return;
    }
    setVerifying(true);
    setError("");
    const result = await dispatch(verifyPhoneOtp(otp));
    setVerifying(false);
    if (verifyPhoneOtp.fulfilled.match(result)) {
      onVerified?.();
    } else {
      setError(result.payload || "Incorrect OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    const result = await dispatch(sendPhoneOtp());
    setResending(false);
    if (sendPhoneOtp.fulfilled.match(result)) {
      setDigits(Array(6).fill(""));
      setCooldown(RESEND_COOLDOWN);
      focusInput(0);
    } else {
      setError(result.payload || "Could not resend OTP. Try again shortly.");
    }
  };

  return (
    <div className="otp-fields">
      <h1 className="otp-heading">Verify your phone</h1>
      <p className="otp-sub">
        We sent a 6-digit code to <strong>{maskPhone(phone)}</strong> via SMS
      </p>

      {error && (
        <div className="otp-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5" />
            <path d="M8 5v3M8 11h.01" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleVerify}>
        <div className="otp-boxes" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="otp-box"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button type="submit" className="otp-btn" disabled={verifying}>
          {verifying && <span className="otp-spinner" aria-hidden="true" />}
          {verifying ? "Verifying…" : "Verify & continue"}
        </button>
      </form>

      <p className="otp-resend">
        Didn't get the code?{" "}
        <button
          type="button"
          className="otp-resend-btn"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
        >
          {resending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
        </button>
      </p>

      {onCancel && (
        <button type="button" className="otp-back" onClick={onCancel}>
          ← Back
        </button>
      )}

      <style>{`
        .otp-fields { display: flex; flex-direction: column; gap: 14px; }
        .otp-heading { font-size: 24px; font-weight: 700; color: #1A2E14; margin: 0 0 4px; letter-spacing: -0.5px; }
        .otp-sub { font-size: 14px; color: #7A8F6E; margin: 0 0 8px; }
        .otp-sub strong { color: #3D5030; }

        .otp-error {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; background: #FEF2F2; border: 1px solid #FECACA;
          border-radius: 10px; color: #B91C1C; font-size: 13px;
        }

        .otp-boxes { display: flex; gap: 10px; justify-content: center; margin: 8px 0 4px; }
        .otp-box {
          width: 44px; height: 52px; text-align: center; font-size: 20px; font-weight: 700;
          color: #1A2E14; border: 1.5px solid #D8E4CC; border-radius: 10px;
          background: #F7FAF4; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .otp-box:focus { border-color: #3D7A2B; background: #fff; box-shadow: 0 0 0 3px rgba(61,122,43,0.12); }

        .otp-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px; background: #3D7A2B; color: #fff; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit;
          transition: background 0.15s, transform 0.1s; margin-top: 4px; width: 100%;
        }
        .otp-btn:hover:not(:disabled) { background: #2D5C1E; }
        .otp-btn:active:not(:disabled) { transform: scale(0.98); }
        .otp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .otp-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%; animation: otp-spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes otp-spin { to { transform: rotate(360deg); } }

        .otp-resend { text-align: center; font-size: 13px; color: #7A8F6E; margin: 4px 0 0; }
        .otp-resend-btn {
          background: none; border: none; padding: 0; font: inherit; font-weight: 600;
          color: #3D7A2B; cursor: pointer;
        }
        .otp-resend-btn:disabled { color: #9AB088; cursor: not-allowed; }

        .otp-back {
          background: none; border: none; padding: 0; font-size: 13px; color: #7A8F6E;
          cursor: pointer; text-align: left; font-family: inherit;
        }
        .otp-back:hover { color: #3D7A2B; }
      `}</style>
    </div>
  );
}
