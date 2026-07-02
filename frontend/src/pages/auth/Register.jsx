// src/pages/auth/Register.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
 
export default function Register() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
 
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
    <div className="reg-pg">
 
      <div className="reg-topbar">
        <Link to="/" className="reg-home-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Back to home
        </Link>
        <span className="reg-topbar-help">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Help: 1800-123-4567
        </span>
      </div>
 
      <div className="reg-body">
        <div className="reg-left">
          <RegisterForm />
        </div>
        <div className="reg-right">
          <div className="reg-right-tag">Free forever for farmers</div>
          <h2 className="reg-right-h">Start your smart farming journey today</h2>
          <p className="reg-right-p">Set up your account in under 2 minutes and get instant access to mandi rates, crop advice, and government schemes.</p>
 
          <div className="reg-steps-guide">
            {[
              ["01", "Create account", "Enter your name, email and mobile number"],
              ["02", "Set your location", "We personalise content for your region"],
              ["03", "Start using AgriConnect", "Marketplace, mandi rates, AI advisor and more"],
            ].map(([num, title, desc]) => (
              <div className="reg-step-item" key={num}>
                <div className="reg-step-num">{num}</div>
                <div>
                  <div className="reg-step-title">{title}</div>
                  <div className="reg-step-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
 
          <div className="reg-trust">
            <div className="reg-trust-label">Trusted by farmers across India</div>
            <div className="reg-trust-row">
              {[["12,400+","Farmers"],["18","States"],["500+","Mandis"]].map(([v,l]) => (
                <div className="reg-trust-stat" key={l}>
                  <div className="reg-trust-val">{v}</div>
                  <div className="reg-trust-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      <div className="reg-footer">
        © 2026 AgriConnect Platform &nbsp;·&nbsp; Ministry of Agriculture &amp; Farmers Welfare
      </div>
 
      <style>{`
        .reg-pg {
          min-height: 100vh; display: flex; flex-direction: column;
          background: #F4F7F2;
        }
        .reg-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 32px; background: #fff; border-bottom: 1px solid #E0EAD8;
        }
        .reg-home-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #5C6B5A; text-decoration: none;
        }
        .reg-home-link:hover { color: #1B5E20; }
        .reg-topbar-help { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #7A8F76; }
 
        .reg-body {
          flex: 1; display: grid; grid-template-columns: 460px 1fr;
          max-width: 1100px; margin: 0 auto; width: 100%;
          padding: 40px 24px; gap: 40px; align-items: center;
        }
 
        .reg-right {
          background: linear-gradient(150deg, #0A3D0C 0%, #1B5E20 55%, #2E7D32 100%);
          border-radius: 16px; padding: 40px 36px; color: #fff;
        }
        .reg-right-tag {
          display: inline-block;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
          border-radius: 4px; padding: 4px 12px;
          font-size: 11px; color: #A5D6A7; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 16px;
        }
        .reg-right-h { font-size: 22px; font-weight: 600; line-height: 1.3; margin-bottom: 12px; }
        .reg-right-p { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.8; margin-bottom: 28px; }
 
        .reg-steps-guide { display: flex; flex-direction: column; gap: 18px; margin-bottom: 32px; }
        .reg-step-item   { display: flex; align-items: flex-start; gap: 14px; }
        .reg-step-num {
          width: 32px; height: 32px; min-width: 32px;
          background: rgba(255,255,255,0.12); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #A5D6A7; letter-spacing: 0.05em;
        }
        .reg-step-title { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .reg-step-desc  { font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.5; }
 
        .reg-trust { border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px; }
        .reg-trust-label { font-size: 11px; color: rgba(255,255,255,0.45); margin-bottom: 12px; }
        .reg-trust-row   { display: flex; gap: 0; }
        .reg-trust-stat  { flex: 1; }
        .reg-trust-stat + .reg-trust-stat { border-left: 1px solid rgba(255,255,255,0.15); padding-left: 18px; }
        .reg-trust-val   { font-size: 20px; font-weight: 600; color: #A5D6A7; }
        .reg-trust-lbl   { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }
 
        .reg-footer {
          text-align: center; font-size: 12px; color: #9AAF94;
          padding: 14px 24px; border-top: 1px solid #E0EAD8; background: #fff;
        }
 
        @media (max-width: 900px) {
          .reg-body { grid-template-columns: 1fr; }
          .reg-right { display: none; }
        }
      `}</style>
    </div>
  );
}