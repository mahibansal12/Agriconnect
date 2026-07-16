import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, sendPhoneOtp, sendLoginOtp, loginWithOtp } from "../../redux/slices/authSlice";
import OtpVerification from "./OtpVerification";

export default function LoginForm({ roleHint = null }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, otpLoading, otpError } = useSelector((state) => state.auth);

  // "password" | "otp" — which login method is active
  const [method, setMethod] = useState("password");
  const [identifier, setIdentifier] = useState(""); // email OR phone, either works
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // OTP-method state
  const [otpStage, setOtpStage] = useState("enter-identifier"); // "enter-identifier" | "enter-code"
  const [otpCode, setOtpCode] = useState("");
  const [otpChannel, setOtpChannel] = useState(""); // "email" | "phone" — echoed back once sent
  const [cooldown, setCooldown] = useState(0);
  const [localError, setLocalError] = useState("");

  // Legacy safety-net: an old/grandfathered account that's somehow still
  // phone-unverified gets routed through the original OTP screen.
  const [pendingVerification, setPendingVerification] = useState(null);
  const [otpSendError, setOtpSendError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const goToDashboard = (role) => {
    if (role === "farmer") navigate("/farmer/dashboard");
    else if (role === "buyer") navigate("/buyer/dashboard");
    else navigate("/admin/dashboard");
  };

  // ── Password login ──
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    const payload = { identifier, password, ...(roleHint && { role: roleHint }) };
    const result = await dispatch(loginUser(payload));
    if (loginUser.fulfilled.match(result)) {
      const user = result.payload.user;
      if (user.isPhoneVerified) {
        goToDashboard(user.role);
        return;
      }
      // Safety net for old/grandfathered accounts that are somehow still
      // unverified — new accounts are always already verified at creation.
      const otpResult = await dispatch(sendPhoneOtp());
      if (sendPhoneOtp.rejected.match(otpResult)) {
        setOtpSendError(otpResult.payload || "Could not send verification code. Please try again.");
        return;
      }
      setPendingVerification({ phone: user.phone, role: user.role });
    }
  };

  // ── OTP login ──
  const handleSendOtp = async () => {
    setLocalError("");
    if (!identifier) {
      setLocalError("Enter your email or mobile number");
      return;
    }
    const result = await dispatch(sendLoginOtp({ identifier, role: roleHint }));
    if (sendLoginOtp.fulfilled.match(result)) {
      setOtpChannel(result.payload?.data?.channel || (identifier.includes("@") ? "email" : "phone"));
      setOtpStage("enter-code");
      setCooldown(30);
      setOtpCode("");
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (otpCode.length !== 6) {
      setLocalError("Enter the complete 6-digit code");
      return;
    }
    const result = await dispatch(loginWithOtp({ identifier, otp: otpCode, role: roleHint }));
    if (loginWithOtp.fulfilled.match(result)) {
      goToDashboard(result.payload.user.role);
    }
  };

  const switchMethod = (m) => {
    setMethod(m);
    setLocalError("");
    setOtpStage("enter-identifier");
    setOtpCode("");
  };

  if (pendingVerification) {
    return (
      <div className="lf-wrap">
        <div className="lf-brand">
          <span className="lf-leaf">🌿</span>
          <span className="lf-brand-name">AgriConnect</span>
        </div>
        <OtpVerification
          phone={pendingVerification.phone}
          onVerified={() => goToDashboard(pendingVerification.role)}
          onCancel={() => setPendingVerification(null)}
        />
      </div>
    );
  }

  const shownError = error || otpError || otpSendError || localError;

  return (
    <div className="lf-wrap">
      <div className="lf-brand">
        <span className="lf-leaf">🌿</span>
        <span className="lf-brand-name">AgriConnect</span>
      </div>

      <h1 className="lf-heading">Welcome back</h1>
      <p className="lf-sub">Sign in to your account</p>

      <div className="lf-method-toggle">
        <button
          type="button"
          className={`lf-method-btn ${method === "password" ? "lf-method-btn--active" : ""}`}
          onClick={() => switchMethod("password")}
        >
          Password
        </button>
        <button
          type="button"
          className={`lf-method-btn ${method === "otp" ? "lf-method-btn--active" : ""}`}
          onClick={() => switchMethod("otp")}
        >
          OTP
        </button>
      </div>

      {shownError && (
        <div className="lf-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5"/>
            <path d="M8 5v3M8 11h.01" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {shownError}
        </div>
      )}

      {method === "password" ? (
        <form onSubmit={handlePasswordSubmit} className="lf-form" noValidate>
          <div className="lf-field">
            <label className="lf-label" htmlFor="login-identifier">Email or mobile number</label>
            <div className="lf-input-wrap">
              <svg className="lf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                id="login-identifier"
                type="text"
                placeholder="you@example.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="lf-input"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="lf-field">
            <div className="lf-label-row">
              <label className="lf-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" className="lf-forgot">Forgot password?</Link>
            </div>
            <div className="lf-input-wrap">
              <svg className="lf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="lf-input"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="lf-eye"
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5Z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5Z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="lf-btn" disabled={loading}>
            {loading && <span className="lf-spinner" aria-hidden="true" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <div className="lf-form">
          {otpStage === "enter-identifier" ? (
            <>
              <div className="lf-field">
                <label className="lf-label" htmlFor="login-otp-identifier">Email or mobile number</label>
                <div className="lf-input-wrap">
                  <svg className="lf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input
                    id="login-otp-identifier"
                    type="text"
                    placeholder="you@example.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="lf-input"
                  />
                </div>
              </div>
              <button type="button" className="lf-btn" onClick={handleSendOtp} disabled={otpLoading}>
                {otpLoading && <span className="lf-spinner" aria-hidden="true" />}
                {otpLoading ? "Sending…" : "Send code"}
              </button>
            </>
          ) : (
            <form onSubmit={handleVerifyLoginOtp}>
              <p className="lf-otp-sent-to">
                Code sent to your {otpChannel === "email" ? "email" : "phone"} — enter it below
              </p>
              <div className="lf-field">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="lf-input lf-otp-code-input"
                  autoFocus
                />
              </div>
              <button type="submit" className="lf-btn" disabled={loading}>
                {loading && <span className="lf-spinner" aria-hidden="true" />}
                {loading ? "Verifying…" : "Verify & sign in"}
              </button>
              <div className="lf-otp-actions">
                <button
                  type="button"
                  className="lf-resend"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || otpLoading}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
                <button type="button" className="lf-resend" onClick={() => setOtpStage("enter-identifier")}>
                  ← Change email/phone
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <p className="lf-switch">
        Don't have an account?{" "}
        <Link to="/register" className="lf-link">Create one</Link>
      </p>

      <style>{`
        .lf-wrap {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          padding: 40px 36px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.08);
        }

        .lf-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }
        .lf-leaf { font-size: 24px; }
        .lf-brand-name {
          font-size: 22px;
          font-weight: 700;
          color: #2D5C1E;
          letter-spacing: -0.5px;
        }

        .lf-heading {
          font-size: 26px;
          font-weight: 700;
          color: #1A2E14;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }
        .lf-sub {
          font-size: 14px;
          color: #7A8F6E;
          margin: 0 0 18px;
        }

        .lf-method-toggle {
          display: flex;
          background: #F0F5EC;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 20px;
        }
        .lf-method-btn {
          flex: 1;
          padding: 9px;
          background: none;
          border: none;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          color: #7A8F6E;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s, color 0.15s;
        }
        .lf-method-btn--active {
          background: #fff;
          color: #2D5C1E;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        .lf-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          color: #B91C1C;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .lf-form { display: flex; flex-direction: column; gap: 18px; }

        .lf-field { display: flex; flex-direction: column; gap: 6px; }

        .lf-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lf-label {
          font-size: 13px;
          font-weight: 500;
          color: #3D5030;
        }
        .lf-forgot {
          font-size: 12px;
          color: #3D7A2B;
          text-decoration: none;
        }
        .lf-forgot:hover { text-decoration: underline; }

        .lf-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lf-input-icon {
          position: absolute;
          left: 12px;
          color: #8FA87E;
          pointer-events: none;
        }
        .lf-input {
          width: 100%;
          padding: 11px 40px 11px 36px;
          border: 1.5px solid #D8E4CC;
          border-radius: 10px;
          font-size: 14px;
          color: #1A2E14;
          background: #F7FAF4;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .lf-input::placeholder { color: #B0C4A0; }
        .lf-input:focus {
          border-color: #3D7A2B;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(61,122,43,0.12);
        }
        .lf-otp-code-input { padding-left: 12px; letter-spacing: 3px; }

        .lf-eye {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #8FA87E;
          display: flex;
          padding: 4px;
        }
        .lf-eye:hover { color: #3D7A2B; }

        .lf-otp-sent-to {
          font-size: 13px;
          color: #7A8F6E;
          margin: 0 0 14px;
        }
        .lf-otp-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
        }
        .lf-resend {
          background: none;
          border: none;
          font-size: 12px;
          color: #3D7A2B;
          font-weight: 600;
          cursor: pointer;
          padding: 4px;
          font-family: inherit;
        }
        .lf-resend:disabled { color: #9AB088; cursor: not-allowed; }

        .lf-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
          padding: 13px;
          background: #3D7A2B;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
          width: 100%;
        }
        .lf-btn:hover:not(:disabled) { background: #2D5C1E; }
        .lf-btn:active:not(:disabled) { transform: scale(0.98); }
        .lf-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .lf-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lf-spin 0.7s linear infinite;
        }
        @keyframes lf-spin { to { transform: rotate(360deg); } }

        .lf-switch {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: #7A8F6E;
        }
        .lf-link {
          color: #3D7A2B;
          font-weight: 600;
          text-decoration: none;
        }
        .lf-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
