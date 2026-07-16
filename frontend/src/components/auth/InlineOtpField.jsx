// src/components/auth/InlineOtpField.jsx
//
// A text field (email or phone) with inline OTP verification built in.
// Sits directly under the field in the registration form — type the value,
// hit "Verify", enter the code that arrives, done. No separate screen.
//
// If the value is edited after being verified, it automatically drops
// back to unverified (a changed email/phone needs re-proving).
//
// Props:
//   type          - "email" | "phone"
//   label         - field label text
//   value         - current field value (controlled)
//   onChange(val) - fired as the person types
//   verified      - boolean, whether this value is currently verified
//   onVerifiedChange(bool) - fired when verification status changes
//   placeholder
//   disabled

import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const RESEND_COOLDOWN = 30;

export default function InlineOtpField({
  type,
  label,
  value,
  onChange,
  verified,
  onVerifiedChange,
  placeholder = "",
  disabled = false,
}) {
  const [stage, setStage] = useState("input"); // "input" | "sent"
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const verifiedValueRef = useRef(null);

  const fieldKey = type === "email" ? "email" : "phone";
  const sendUrl = `/v1/user/register/send-${type}-otp`;
  const verifyUrl = `/v1/user/register/verify-${type}-otp`;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // If the value changes after being verified, un-verify — editing a
  // verified field means it needs to be proven again.
  useEffect(() => {
    if (verified && verifiedValueRef.current !== null && verifiedValueRef.current !== value) {
      onVerifiedChange(false);
      setStage("input");
      setCode("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const isValidEmail = (v) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
  const isValidPhone = (v) => /^\d{10}$/.test(v.replace(/\D/g, ""));

  const handleSend = async () => {
    setError("");
    if (!value) {
      setError(`Enter your ${type === "email" ? "email" : "phone number"} first`);
      return;
    }
    if (type === "email" && !isValidEmail(value)) {
      setError("Enter a valid email address");
      return;
    }
    if (type === "phone" && !isValidPhone(value)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setSending(true);
    try {
      await axiosInstance.post(sendUrl, { [fieldKey]: value });
      setStage("sent");
      setCooldown(RESEND_COOLDOWN);
      setCode("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send code. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    if (code.length !== 6) {
      setError("Enter the complete 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      await axiosInstance.post(verifyUrl, { [fieldKey]: value, otp: code });
      verifiedValueRef.current = value;
      onVerifiedChange(true);
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="iof-wrap">
      <label className="iof-label">{label}</label>
      <div className="iof-row">
        <input
          type={type === "email" ? "email" : "tel"}
          value={value}
          placeholder={placeholder}
          disabled={disabled || verified}
          onChange={(e) => onChange(e.target.value)}
          className={`iof-input ${verified ? "iof-input--verified" : ""}`}
        />
        {verified ? (
          <span className="iof-check" title="Verified">✓ Verified</span>
        ) : stage === "input" ? (
          <button type="button" className="iof-btn" onClick={handleSend} disabled={sending || disabled}>
            {sending ? "Sending…" : "Verify"}
          </button>
        ) : null}
      </div>

      {!verified && stage === "sent" && (
        <div className="iof-otp-row">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="iof-code-input"
          />
          <button type="button" className="iof-btn iof-btn--small" onClick={handleVerify} disabled={verifying}>
            {verifying ? "Checking…" : "Confirm"}
          </button>
          <button
            type="button"
            className="iof-resend"
            onClick={handleSend}
            disabled={cooldown > 0 || sending}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
          </button>
        </div>
      )}

      {error && <p className="iof-error">{error}</p>}

      <style>{`
        .iof-wrap { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
        .iof-label { font-size: 13px; font-weight: 600; color: #3D5030; }
        .iof-row { display: flex; gap: 8px; align-items: center; }
        .iof-input {
          flex: 1; padding: 10px 12px; border: 1.5px solid #D8E4CC; border-radius: 10px;
          font-size: 14px; font-family: inherit; background: #F7FAF4; outline: none;
          transition: border-color 0.15s;
        }
        .iof-input:focus { border-color: #3D7A2B; background: #fff; }
        .iof-input--verified { background: #EFFBEF; border-color: #86C97F; color: #2D5C1E; }
        .iof-btn {
          padding: 10px 16px; background: #3D7A2B; color: #fff; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit;
        }
        .iof-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .iof-btn--small { padding: 8px 12px; }
        .iof-check { font-size: 13px; font-weight: 600; color: #2D5C1E; white-space: nowrap; padding: 0 4px; }
        .iof-otp-row { display: flex; gap: 8px; align-items: center; margin-top: 2px; }
        .iof-code-input {
          width: 120px; padding: 9px 10px; border: 1.5px solid #D8E4CC; border-radius: 10px;
          font-size: 14px; letter-spacing: 2px; font-family: inherit; outline: none;
        }
        .iof-code-input:focus { border-color: #3D7A2B; }
        .iof-resend {
          background: none; border: none; font-size: 12px; color: #3D7A2B; font-weight: 600;
          cursor: pointer; padding: 4px;
        }
        .iof-resend:disabled { color: #9AB088; cursor: not-allowed; }
        .iof-error { font-size: 12px; color: #B91C1C; margin: 0; }
      `}</style>
    </div>
  );
}
