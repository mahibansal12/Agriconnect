// src/pages/auth/Login.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [searchParams] = useSearchParams();
  const roleHint = searchParams.get('role'); // 'buyer' | 'farmer' | null

  // Auto-redirect if already logged in — BUT only when no role-switch is happening.
  // If ?role=buyer is in the URL and the user is currently a farmer, show the
  // login form so they can sign into their buyer account.
  // Navigating away (e.g. Home) while here keeps them logged in as their current role.
  useEffect(() => {
    if (user && user.isPhoneVerified && (!roleHint || roleHint === user.role)) {
      navigate(
        user.role === "farmer" ? "/farmer/dashboard" :
          user.role === "buyer" ? "/buyer/dashboard" : "/admin/dashboard",
        { replace: true }
      );
    }
  }, [user, roleHint, navigate]);

  return (
    <div className="login-pg">

      {/* Top bar */}
      <div className="login-topbar">
        <Link to="/" className="login-home-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to home
        </Link>
        <span className="login-topbar-help">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Help: 1800-123-4567
        </span>
      </div>

      {/* Role-switch context banner */}
      {roleHint && (
        <div className="login-role-banner">
          <span className="login-role-banner-icon">
            {roleHint === 'buyer' ? '🛒' : '🌾'}
          </span>
          <div>
            <strong>Signing in as {roleHint === 'buyer' ? 'Buyer' : 'Farmer'}</strong>
            <span> — use your {roleHint} account credentials, or{' '}
              <Link to={`/register?role=${roleHint}`} className="login-role-banner-link">
                create a {roleHint} account
              </Link>
            </span>
          </div>
        </div>
      )}

      {/* Split layout */}
      <div className="login-body">

        {/* Left: form */}
        <div className="login-left">
          <LoginForm roleHint={roleHint} />
        </div>

        {/* Right: brand panel */}
        <div className="login-right">
          <div className="login-right-inner">
            <div className="login-right-tag">Government recognised platform</div>
            <h2 className="login-right-h">India's most trusted agriculture platform</h2>
            <p className="login-right-p">Join thousands of farmers, buyers and agri-experts who use AgriConnect every day to grow smarter and earn better.</p>

            <div className="login-panel-title">Core AgriConnect capabilities</div>
            <div className="login-feats">
              {[
                "Crop marketplace for direct buying and selling",
                "Crop knowledge center with growing guides and care tips",
                "Live mandi prices to inform selling decisions",
                "Smart crop calendar for planning farm activities",
                "AI assistant for crop and seed recommendations",
                "Nearby shop finder for seeds, fertiliser, and equipment",
                "Farmer community for questions, tips, and local support",
                "Government schemes, subsidies, and eligibility guidance",
              ].map((text) => (
                <div className="login-feat" key={text}>
                  <span className="login-feat-icon">✓</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        © 2026 AgriConnect Platform &nbsp;·&nbsp; Ministry of Agriculture &amp; Farmers Welfare &nbsp;·&nbsp;
        <Link to="/privacy" className="login-fl">Privacy Policy</Link> &nbsp;·&nbsp;
        <Link to="/terms" className="login-fl">Terms of Use</Link>
      </div>

      <style>{`
        .login-pg {
  min-height: 100vh; display: flex; flex-direction: column;
  background:
    radial-gradient(ellipse at 15% 10%, rgba(214,69,39,0.55) 0%, rgba(214,69,39,0) 45%),
    radial-gradient(ellipse at 55% 25%, rgba(240,180,40,0.55) 0%, rgba(240,180,40,0) 50%),
    linear-gradient(160deg, #E4572E 0%, #EDA83A 28%, #E8C547 45%, #8FAE4E 65%, #2E7D32 85%, #1B5E20 100%);
}

.login-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 32px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.5);
}

.login-home-link {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #3E4A3C; text-decoration: none;
  font-weight: 500;
}
.login-home-link:hover { color: #1B5E20; }
.login-topbar-help {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #4A5A47; font-weight: 500;
}

.login-body {
  flex: 1; display: grid; grid-template-columns: 460px 1fr;
  max-width: 1100px; margin: 0 auto; width: 100%;
  padding: 48px 24px; gap: 40px; align-items: center;
}

.login-left {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.28);
}

.login-right {
  background: linear-gradient(150deg, #0A3D0C 0%, #1B5E20 55%, #2E7D32 100%);
  border-radius: 16px; padding: 40px 36px; color: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}

.login-right-tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 4px; padding: 4px 12px;
  font-size: 11px; color: #A5D6A7;
  letter-spacing: 0.06em; text-transform: uppercase;
  margin-bottom: 16px;
}
.login-right-h {
  font-size: 24px; font-weight: 600; line-height: 1.3;
  margin-bottom: 12px; letter-spacing: -0.3px;
}
.login-right-p {
  font-size: 13px; color: rgba(255,255,255,0.65);
  line-height: 1.8; margin-bottom: 28px;
}

.login-panel-title {
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.75);
  margin-bottom: 18px;
}
.login-feats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 0;
}
.login-feat {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  color: rgba(255,255,255,0.92);
  line-height: 1.6;
}
.login-feat-icon {
  width: 26px;
  min-width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: #fff;
  background: rgba(255,255,255,0.16);
  border-radius: 50%;
  margin-top: 2px;
}

.login-footer {
  text-align: center; font-size: 12px; color: #3E4A3C;
  padding: 14px 24px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255,255,255,0.5);
}
.login-fl { color: #1B5E20; text-decoration: none; }
.login-fl:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .login-body { grid-template-columns: 1fr; }
  .login-right { display: none; }
}

.login-role-banner {
  display: flex; align-items: center; gap: 12px;
  max-width: 1100px; margin: 16px auto 0; width: calc(100% - 48px);
  padding: 12px 18px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  border-left: 4px solid #1B5E20;
  font-size: 13.5px; color: #2E3A2E;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.login-role-banner-icon { font-size: 22px; line-height: 1; }
.login-role-banner-link {
  color: #1B5E20; font-weight: 600; text-decoration: none;
}
.login-role-banner-link:hover { text-decoration: underline; }
        }
      `}</style>
    </div>
  );
}