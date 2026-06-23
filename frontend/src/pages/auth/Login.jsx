// src/pages/auth/Login.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
 
export default function Login() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
 
  // If already logged in redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate(
        user.role === "farmer" ? "/farmer/dashboard" :
        user.role === "buyer"  ? "/buyer/dashboard"  : "/admin/dashboard",
        { replace: true }
      );
    }
  }, [user, navigate]);
 
  return (
    <div className="login-pg">
 
      {/* Top bar */}
      <div className="login-topbar">
        <Link to="/" className="login-home-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Back to home
        </Link>
        <span className="login-topbar-help">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Help: 1800-123-4567
        </span>
      </div>
 
      {/* Split layout */}
      <div className="login-body">
 
        {/* Left: form */}
        <div className="login-left">
          <LoginForm />
        </div>
 
        {/* Right: brand panel */}
        <div className="login-right">
          <div className="login-right-inner">
            <div className="login-right-tag">Government recognised platform</div>
            <h2 className="login-right-h">India's most trusted agriculture platform</h2>
            <p className="login-right-p">Join thousands of farmers, buyers and agri-experts who use Krishi every day to grow smarter and earn better.</p>
 
            <div className="login-feats">
              {[
                ["Verified farmer profiles and crop listings"],
                ["Real-time mandi rates from 500+ markets"],
                ["AI-powered crop and seed recommendations"],
                ["Direct access to all government schemes"],
                ["Nearby shop finder with maps & ratings"],
              ].map(([t]) => (
                <div className="login-feat" key={t}>
                  <span className="login-feat-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
 
            <div className="login-stats">
              {[["12,400+","Farmers registered"],["3,200+","Active buyers"],["₹2.8Cr+","Crops traded"]].map(([v,l]) => (
                <div className="login-stat" key={l}>
                  <div className="login-stat-val">{v}</div>
                  <div className="login-stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      {/* Footer */}
      <div className="login-footer">
        © 2026 Krishi Platform &nbsp;·&nbsp; Ministry of Agriculture &amp; Farmers Welfare &nbsp;·&nbsp;
        <Link to="/privacy" className="login-fl">Privacy Policy</Link> &nbsp;·&nbsp;
        <Link to="/terms" className="login-fl">Terms of Use</Link>
      </div>
 
      <style>{`
        .login-pg {
          min-height: 100vh; display: flex; flex-direction: column;
          background: #F4F7F2;
        }
 
        .login-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 32px;
          background: #fff; border-bottom: 1px solid #E0EAD8;
        }
        .login-home-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #5C6B5A; text-decoration: none;
        }
        .login-home-link:hover { color: #1B5E20; }
        .login-topbar-help {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: #7A8F76;
        }
 
        .login-body {
          flex: 1; display: grid; grid-template-columns: 460px 1fr;
          max-width: 1100px; margin: 0 auto; width: 100%;
          padding: 40px 24px; gap: 40px; align-items: center;
        }
 
        .login-left {}
 
        .login-right {
          background: linear-gradient(150deg, #0A3D0C 0%, #1B5E20 55%, #2E7D32 100%);
          border-radius: 16px; padding: 40px 36px; color: #fff;
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
 
        .login-feats { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .login-feat  { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.85); }
        .login-feat-check {
          width: 22px; height: 22px; min-width: 22px;
          background: rgba(255,255,255,0.15); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
 
        .login-stats {
          display: flex; gap: 0;
          border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px;
        }
        .login-stat { flex: 1; }
        .login-stat + .login-stat { border-left: 1px solid rgba(255,255,255,0.15); padding-left: 20px; }
        .login-stat-val { font-size: 20px; font-weight: 600; color: #A5D6A7; }
        .login-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
 
        .login-footer {
          text-align: center; font-size: 12px; color: #9AAF94;
          padding: 14px 24px; border-top: 1px solid #E0EAD8;
          background: #fff;
        }
        .login-fl { color: #1B5E20; text-decoration: none; }
        .login-fl:hover { text-decoration: underline; }
 
        @media (max-width: 900px) {
          .login-body { grid-template-columns: 1fr; }
          .login-right { display: none; }
        }
      `}</style>
    </div>
  );
}