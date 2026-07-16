// src/pages/auth/ResetPassword.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../redux/slices/authSlice";

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const roleHint = searchParams.get("role"); // carried through so /login shows the right context

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const result = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(result)) {
      setDone(true);
      setTimeout(() => {
        navigate(roleHint ? `/login?role=${roleHint}` : "/login", { replace: true });
      }, 2000);
    } else {
      setError(result.payload || "This link is invalid or has expired.");
    }
  };

  return (
    <div className="rp-page">
      <div className="rp-card">
        <div className="rp-brand">
          <span className="rp-leaf">🌿</span>
          <span className="rp-brand-name">AgriConnect</span>
        </div>

        {done ? (
          <div className="rp-done">
            <div className="rp-done-icon">✅</div>
            <h1 className="rp-heading">Password reset</h1>
            <p className="rp-sub">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="rp-heading">Set a new password</h1>
            <p className="rp-sub">Choose a new password for your account.</p>

            {error && <div className="rp-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <label className="rp-label" htmlFor="rp-password">New password</label>
              <div className="rp-pass-row">
                <input
                  id="rp-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="At least 8 characters"
                  className="rp-input"
                  autoComplete="new-password"
                  autoFocus
                />
                <button type="button" className="rp-eye" onClick={() => setShowPass((s) => !s)}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>

              <label className="rp-label" htmlFor="rp-confirm">Confirm new password</label>
              <input
                id="rp-confirm"
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="Re-enter password"
                className="rp-input"
                autoComplete="new-password"
              />

              <button type="submit" className="rp-btn" disabled={loading}>
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>

            <p className="rp-back">
              <Link to="/login" className="rp-link">← Back to sign in</Link>
            </p>
          </>
        )}

        <style>{`
          .rp-page {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            padding: 24px;
            background:
              radial-gradient(ellipse at 15% 10%, rgba(214,69,39,0.55) 0%, rgba(214,69,39,0) 45%),
              radial-gradient(ellipse at 55% 25%, rgba(240,180,40,0.55) 0%, rgba(240,180,40,0) 50%),
              linear-gradient(160deg, #E4572E 0%, #EDA83A 28%, #E8C547 45%, #8FAE4E 65%, #2E7D32 85%, #1B5E20 100%);
          }
          .rp-card {
            width: 100%; max-width: 420px; background: #fff; border-radius: 16px;
            padding: 40px 36px; box-shadow: 0 20px 60px rgba(0,0,0,0.28);
          }
          .rp-brand { display: flex; align-items: center; gap: 8px; margin-bottom: 28px; }
          .rp-leaf { font-size: 22px; }
          .rp-brand-name { font-size: 17px; font-weight: 700; color: #1B5E20; }
          .rp-heading { font-size: 22px; font-weight: 700; color: #1A2E14; margin: 0 0 6px; }
          .rp-sub { font-size: 14px; color: #7A8F6E; margin: 0 0 20px; line-height: 1.5; }
          .rp-error {
            padding: 10px 14px; background: #FEF2F2; border: 1px solid #FECACA;
            border-radius: 10px; color: #B91C1C; font-size: 13px; margin-bottom: 16px;
          }
          .rp-label { display: block; font-size: 13px; font-weight: 600; color: #3D5030; margin-bottom: 6px; }
          .rp-input {
            width: 100%; padding: 11px 14px; border: 1.5px solid #D8E4CC; border-radius: 10px;
            font-size: 14px; font-family: inherit; background: #F7FAF4; outline: none;
            margin-bottom: 18px; box-sizing: border-box; transition: border-color 0.15s;
          }
          .rp-input:focus { border-color: #3D7A2B; background: #fff; }
          .rp-pass-row { position: relative; }
          .rp-pass-row .rp-input { padding-right: 60px; }
          .rp-eye {
            position: absolute; right: 12px; top: 11px;
            background: none; border: none; font-size: 12px; font-weight: 600; color: #3D7A2B;
            cursor: pointer; font-family: inherit;
          }
          .rp-btn {
            width: 100%; padding: 13px; background: #3D7A2B; color: #fff; border: none;
            border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer;
            font-family: inherit; transition: background 0.15s;
          }
          .rp-btn:hover:not(:disabled) { background: #2D5C1E; }
          .rp-btn:disabled { opacity: 0.65; cursor: not-allowed; }
          .rp-back { text-align: center; margin-top: 18px; }
          .rp-link { font-size: 13px; color: #3D7A2B; font-weight: 600; text-decoration: none; }
          .rp-link:hover { text-decoration: underline; }
          .rp-done { text-align: center; }
          .rp-done-icon { font-size: 40px; margin-bottom: 8px; }
        `}</style>
      </div>
    </div>
  );
}
