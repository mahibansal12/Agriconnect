import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../redux/slices/authSlice";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      if (role === "farmer") navigate("/farmer/dashboard");
      else if (role === "buyer") navigate("/buyer/dashboard");
      else navigate("/admin/dashboard");
    }
  };

  return (
    <div className="lf-wrap">
      <div className="lf-brand">
        <span className="lf-leaf">🌿</span>
        <span className="lf-brand-name">Krishi</span>
      </div>

      <h1 className="lf-heading">Welcome back</h1>
      <p className="lf-sub">Sign in to your account</p>

      {error && (
        <div className="lf-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#B91C1C" strokeWidth="1.5"/>
            <path d="M8 5v3M8 11h.01" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="lf-form" noValidate>
        <div className="lf-field">
          <label className="lf-label" htmlFor="login-email">Email</label>
          <div className="lf-input-wrap">
            <svg className="lf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="lf-input"
              required
              autoComplete="email"
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
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
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
          {loading ? (
            <span className="lf-spinner" aria-hidden="true" />
          ) : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

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
          margin: 0 0 24px;
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
        }
        .lf-input::placeholder { color: #B0C4A0; }
        .lf-input:focus {
          border-color: #3D7A2B;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(61,122,43,0.12);
        }

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
