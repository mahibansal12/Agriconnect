import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../redux/slices/authSlice";
import RoleSelector from "./RoleSelector";
import InlineOtpField from "./InlineOtpField";

const STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

export default function RegisterForm({ initialRole = "farmer", onRoleChange = () => {} }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
    state: "",
    district: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  // Email and phone are now verified inline, one field at a time, before
  // the account is ever created — no more separate "verify phone" step
  // at the end. Continuing past step 1 requires both to be true.
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Enter a valid email";
    if (!form.phone.match(/^[6-9]\d{9}$/)) errs.phone = "Enter a valid 10-digit mobile number";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!form.state) errs.state = "Select your state";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep1()) return;
    if (!emailVerified || !phoneVerified) {
      setVerifyError("Please verify both your email and phone number before continuing");
      return;
    }
    setVerifyError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    const { confirmPassword, ...payload } = form;
    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      // Email and phone were already verified before this account was
      // created, so there's no post-registration OTP step anymore —
      // go straight to the dashboard.
      goToDashboard(result.payload.user.role);
    }
  };

  const goToDashboard = (role) => {
    if (role === "farmer") navigate("/farmer/dashboard");
    else if (role === "buyer") navigate("/buyer/dashboard");
    else navigate("/admin/dashboard");
  };

  return (
    <div className="rf-wrap">
      <div className="rf-brand">
        <span className="rf-leaf">🌿</span>
        <span className="rf-brand-name">AgriConnect</span>
      </div>

      <div className="rf-steps">
        <div className={`rf-step ${step >= 1 ? "rf-step--done" : ""}`}>
          <span className="rf-step-num">{step > 1 ? "✓" : "1"}</span>
          <span className="rf-step-label">Your details</span>
        </div>
        <div className="rf-step-line" />
        <div className={`rf-step ${step >= 2 ? "rf-step--done" : ""}`}>
          <span className="rf-step-num">2</span>
          <span className="rf-step-label">Account setup</span>
        </div>
      </div>

      {(error || verifyError) && (
        <div className="rf-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5"/>
            <path d="M8 5v3M8 11h.01" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error || verifyError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="rf-fields">
            <h1 className="rf-heading">Create your account</h1>
            <p className="rf-sub">Join thousands of farmers on AgriConnect</p>

            <RoleSelector
              value={form.role}
              onChange={(role) => {
                setForm((p) => ({ ...p, role }));
                onRoleChange(role);
              }}
            />

            <Field
              label="Full name"
              id="rf-name"
              error={fieldErrors.name}
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              }
            >
              <input
                id="rf-name"
                name="name"
                type="text"
                placeholder="Ramesh Yadav"
                value={form.name}
                onChange={handleChange}
                className={`rf-input ${fieldErrors.name ? "rf-input--err" : ""}`}
                autoComplete="name"
              />
            </Field>

            <InlineOtpField
              type="email"
              label="Email address"
              value={form.email}
              onChange={(v) => {
                setForm((p) => ({ ...p, email: v }));
                setFieldErrors((p) => ({ ...p, email: "" }));
              }}
              verified={emailVerified}
              onVerifiedChange={setEmailVerified}
              placeholder="you@example.com"
            />
            {fieldErrors.email && <span className="rf-field-err">{fieldErrors.email}</span>}

            <InlineOtpField
              type="phone"
              label="Mobile number"
              value={form.phone}
              onChange={(v) => {
                setForm((p) => ({ ...p, phone: v.replace(/\D/g, "").slice(0, 10) }));
                setFieldErrors((p) => ({ ...p, phone: "" }));
              }}
              verified={phoneVerified}
              onVerifiedChange={setPhoneVerified}
              placeholder="9876543210"
            />
            {fieldErrors.phone && <span className="rf-field-err">{fieldErrors.phone}</span>}

            <button type="button" className="rf-btn" onClick={goNext} disabled={!emailVerified || !phoneVerified}>
              Continue
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="rf-fields">
            <h1 className="rf-heading">Almost there</h1>
            <p className="rf-sub">Set your password and location</p>

            <Field
              label="Password"
              id="rf-password"
              error={fieldErrors.password}
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              }
              suffix={
                <button type="button" className="rf-eye" onClick={() => setShowPass((p) => !p)} aria-label="Toggle password">
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
              }
            >
              <input
                id="rf-password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                className={`rf-input ${fieldErrors.password ? "rf-input--err" : ""}`}
                autoComplete="new-password"
              />
            </Field>

            <Field
              label="Confirm password"
              id="rf-confirm"
              error={fieldErrors.confirmPassword}
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
              }
            >
              <input
                id="rf-confirm"
                name="confirmPassword"
                type={showPass ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`rf-input ${fieldErrors.confirmPassword ? "rf-input--err" : ""}`}
                autoComplete="new-password"
              />
            </Field>

            <div className="rf-field">
              <label className="rf-label" htmlFor="rf-state">State</label>
              <div className="rf-input-wrap">
                <svg className="rf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2a5 5 0 0 0-5 5c0 4 5 8 5 8s5-4 5-8a5 5 0 0 0-5-5Z" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="8" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <select
                  id="rf-state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className={`rf-input rf-select ${fieldErrors.state ? "rf-input--err" : ""}`}
                >
                  <option value="">Select your state</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {fieldErrors.state && <span className="rf-field-err">{fieldErrors.state}</span>}
            </div>

            <div className="rf-field">
              <label className="rf-label" htmlFor="rf-district">District <span className="rf-optional">(optional)</span></label>
              <div className="rf-input-wrap">
                <svg className="rf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="6" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="rf-district"
                  name="district"
                  type="text"
                  placeholder="e.g. Jaipur"
                  value={form.district}
                  onChange={handleChange}
                  className="rf-input"
                />
              </div>
            </div>

            <div className="rf-btn-row">
              <button type="button" className="rf-btn-back" onClick={() => setStep(1)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <button type="submit" className="rf-btn" disabled={loading}>
                {loading && <span className="rf-spinner" aria-hidden="true" />}
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>
          </div>
        )}
      </form>

      {step === 1 && (
        <p className="rf-switch">
          Already have an account?{" "}
          <Link to="/login" className="rf-link">Sign in</Link>
        </p>
      )}

      <style>{`
        .rf-wrap {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          padding: 36px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.08);
        }

        .rf-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .rf-leaf { font-size: 22px; }
        .rf-brand-name {
          font-size: 20px;
          font-weight: 700;
          color: #2D5C1E;
          letter-spacing: -0.5px;
        }

        /* Steps */
        .rf-steps {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 24px;
        }
        .rf-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rf-step-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #D8E4CC;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #8FA87E;
          transition: all 0.2s;
        }
        .rf-step--done .rf-step-num {
          background: #3D7A2B;
          border-color: #3D7A2B;
          color: #fff;
        }
        .rf-step-label {
          font-size: 12px;
          color: #8FA87E;
          font-weight: 500;
        }
        .rf-step--done .rf-step-label { color: #3D7A2B; }
        .rf-step-line {
          flex: 1;
          height: 1.5px;
          background: #D8E4CC;
          margin: 0 10px;
        }

        .rf-heading {
          font-size: 24px;
          font-weight: 700;
          color: #1A2E14;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }
        .rf-sub {
          font-size: 14px;
          color: #7A8F6E;
          margin: 0 0 22px;
        }

        .rf-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          color: #B91C1C;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .rf-fields { display: flex; flex-direction: column; gap: 14px; }

        .rf-field { display: flex; flex-direction: column; gap: 5px; }
        .rf-label {
          font-size: 13px;
          font-weight: 500;
          color: #3D5030;
        }
        .rf-optional { font-weight: 400; color: #9AB088; }

        .rf-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .rf-input-icon {
          position: absolute;
          left: 12px;
          color: #8FA87E;
          pointer-events: none;
        }
        .rf-input {
          width: 100%;
          padding: 10px 12px 10px 36px;
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
        .rf-input::placeholder { color: #B0C4A0; }
        .rf-input:focus {
          border-color: #3D7A2B;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(61,122,43,0.12);
        }
        .rf-input--err { border-color: #EF4444 !important; }
        .rf-select { appearance: none; cursor: pointer; padding-right: 32px; }
        .rf-field-err {
          font-size: 12px;
          color: #EF4444;
          margin-top: 2px;
        }

        .rf-eye {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #8FA87E;
          display: flex;
          padding: 4px;
        }
        .rf-eye:hover { color: #3D7A2B; }

        .rf-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
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
          margin-top: 4px;
        }
        .rf-btn:hover:not(:disabled) { background: #2D5C1E; }
        .rf-btn:active:not(:disabled) { transform: scale(0.98); }
        .rf-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .rf-btn-row {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }
        .rf-btn-back {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 13px 18px;
          background: #F0F5EC;
          color: #3D5030;
          border: 1.5px solid #D8E4CC;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .rf-btn-back:hover { background: #E4EEE0; }

        .rf-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rf-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes rf-spin { to { transform: rotate(360deg); } }

        .rf-switch {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: #7A8F6E;
        }
        .rf-link {
          color: #3D7A2B;
          font-weight: 600;
          text-decoration: none;
        }
        .rf-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

function Field({ label, id, error, icon, suffix, children }) {
  return (
    <div className="rf-field">
      <label className="rf-label" htmlFor={id}>{label}</label>
      <div className="rf-input-wrap">
        {icon && <span className="rf-input-icon">{icon}</span>}
        {children}
        {suffix}
      </div>
      {error && <span className="rf-field-err">{error}</span>}
    </div>
  );
}
