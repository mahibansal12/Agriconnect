// src/pages/auth/ForgotPassword.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { forgotPassword } from "../../redux/slices/authSlice";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);
  const [searchParams] = useSearchParams();
  const roleHint = searchParams.get("role"); // optional, disambiguates farmer/buyer account

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Enter a valid email address");
      return;
    }
    const result = await dispatch(forgotPassword({ email, role: roleHint }));
    // Always show the generic success state — the backend intentionally
    // gives the same response whether or not the account exists, so this
    // page can't be used to check which emails are registered.
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
    } else {
      setError(result.payload || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-brand">
          <span className="fp-leaf">🌿</span>
          <span className="fp-brand-name">AgriConnect</span>
        </div>

        {sent ? (
          <div className="fp-sent">
            <div className="fp-sent-icon">✉️</div>
            <h1 className="fp-heading">Check your email</h1>
            <p className="fp-sub">
              If an account exists for <strong>{email}</strong>, we've sent a link to reset
              your password. The link expires in 1 hour.
            </p>
            <Link to="/login" className="fp-btn fp-btn--link">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="fp-heading">Forgot your password?</h1>
            <p className="fp-sub">Enter your email and we'll send you a reset link.</p>

            {error && <div className="fp-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <label className="fp-label" htmlFor="fp-email">Email address</label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className="fp-input"
                autoComplete="email"
                autoFocus
              />
              <button type="submit" className="fp-btn" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="fp-back">
              <Link to="/login" className="fp-link">← Back to sign in</Link>
            </p>
          </>
        )}

        <style>{`
          .fp-page {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            padding: 24px;
            background:
              radial-gradient(ellipse at 15% 10%, rgba(214,69,39,0.55) 0%, rgba(214,69,39,0) 45%),
              radial-gradient(ellipse at 55% 25%, rgba(240,180,40,0.55) 0%, rgba(240,180,40,0) 50%),
              linear-gradient(160deg, #E4572E 0%, #EDA83A 28%, #E8C547 45%, #8FAE4E 65%, #2E7D32 85%, #1B5E20 100%);
          }
          .fp-card {
            width: 100%; max-width: 420px; background: #fff; border-radius: 16px;
            padding: 40px 36px; box-shadow: 0 20px 60px rgba(0,0,0,0.28);
          }
          .fp-brand { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
          .fp-leaf { font-size: 22px; }
          .fp-brand-name { font-size: 17px; font-weight: 700; color: #1B5E20; }
          .fp-heading { font-size: 22px; font-weight: 700; color: #1A2E14; margin: 0 0 6px; }
          .fp-sub { font-size: 14px; color: #7A8F6E; margin: 0 0 20px; line-height: 1.5; }
          .fp-sub strong { color: #3D5030; }
          .fp-error {
            padding: 10px 14px; background: #FEF2F2; border: 1px solid #FECACA;
            border-radius: 10px; color: #B91C1C; font-size: 13px; margin-bottom: 16px;
          }
          .fp-label { display: block; font-size: 13px; font-weight: 600; color: #3D5030; margin-bottom: 6px; }
          .fp-input {
            width: 100%; padding: 11px 14px; border: 1.5px solid #D8E4CC; border-radius: 10px;
            font-size: 14px; font-family: inherit; background: #F7FAF4; outline: none;
            margin-bottom: 18px; box-sizing: border-box; transition: border-color 0.15s;
          }
          .fp-input:focus { border-color: #3D7A2B; background: #fff; }
          .fp-btn {
            width: 100%; padding: 13px; background: #3D7A2B; color: #fff; border: none;
            border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;
            font-family: inherit; text-align: center; text-decoration: none; display: block;
            transition: background 0.15s;
          }
          .fp-btn:hover:not(:disabled) { background: #2D5C1E; }
          .fp-btn:disabled { opacity: 0.65; cursor: not-allowed; }
          .fp-btn--link { box-sizing: border-box; }
          .fp-back { text-align: center; margin-top: 18px; }
          .fp-link { font-size: 13px; color: #3D7A2B; font-weight: 600; text-decoration: none; }
          .fp-link:hover { text-decoration: underline; }
          .fp-sent { text-align: center; }
          .fp-sent-icon { font-size: 40px; margin-bottom: 8px; }
        `}</style>
      </div>
    </div>
  );
}
