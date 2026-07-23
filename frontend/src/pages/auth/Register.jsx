// src/pages/auth/Register.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
 
export default function Register() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [searchParams] = useSearchParams();
  // Pre-select role from URL param (?role=buyer or ?role=farmer)
  const roleParam = searchParams.get('role');
  const [accountType, setAccountType] = useState(
    roleParam === 'buyer' || roleParam === 'farmer' ? roleParam : 'farmer'
  );
 
  // Only auto-redirect if we're NOT here to create an account for a
  // different role than the one currently logged in. Without this check,
  // a logged-in farmer clicking "create a buyer account" gets bounced
  // straight back to their farmer dashboard before they can fill the form.
  useEffect(() => {
    if (user && user.isPhoneVerified && (!roleParam || roleParam === user.role)) {
      navigate(
        user.role === "farmer" ? "/farmer/dashboard" :
        user.role === "buyer"  ? "/buyer/dashboard"  : "/admin/dashboard",
        { replace: true }
      );
    }
  }, [user, roleParam, navigate]);
 
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

      </div>
 
      <div className="reg-body">
        <div className="reg-left">
          <RegisterForm
            initialRole={accountType}
            onRoleChange={setAccountType}
          />
        </div>
        <div className="reg-right">
          <div className="reg-right-tag">
            {accountType === "buyer" ? "Free forever for buyers" : "Free forever for farmers"}
          </div>
          <h2 className="reg-right-h">
            {accountType === "buyer"
              ? "Start your smart buying journey today"
              : "Start your smart farming journey today"
            }
          </h2>
          <p className="reg-right-p">
            {accountType === "buyer"
              ? "Join buyers, farmers and agri-experts who use AgriConnect every day to source quality crops and connect directly."
              : "Join thousands of farmers, buyers and agri-experts who use AgriConnect every day to grow smarter and earn better."
            }
          </p>

          <div className="reg-right-inner">
            <div className="reg-panel-title">Core AgriConnect capabilities</div>
            <div className="reg-feats">
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
                <div className="reg-feat" key={text}>
                  <span className="reg-feat-icon">✓</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      <div className="reg-footer">
        © 2026 AgriConnect Platform
      </div>
 
      <style>{`
            .reg-pg {
      min-height: 100vh; display: flex; flex-direction: column;
      background:
        radial-gradient(ellipse at 85% 10%, rgba(214,69,39,0.5) 0%, rgba(214,69,39,0) 45%),
        radial-gradient(ellipse at 45% 25%, rgba(240,180,40,0.5) 0%, rgba(240,180,40,0) 50%),
        linear-gradient(200deg, #E4572E 0%, #EDA83A 28%, #E8C547 45%, #8FAE4E 65%, #2E7D32 85%, #1B5E20 100%);
    }

    .reg-topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 32px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255,255,255,0.5);
    }
    .reg-home-link {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: #3E4A3C; text-decoration: none;
      font-weight: 500;
    }
    .reg-home-link:hover { color: #1B5E20; }
    .reg-topbar-help {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; color: #4A5A47; font-weight: 500;
    }

    .reg-body {
      flex: 1; display: grid; grid-template-columns: 460px 1fr;
      max-width: 1100px; margin: 0 auto; width: 100%;
      padding: 48px 24px; gap: 40px; align-items: center;
    }

    .reg-left {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.28);
    }

    .reg-right {
      background: linear-gradient(150deg, #0A3D0C 0%, #1B5E20 55%, #2E7D32 100%);
      border-radius: 16px; padding: 40px 36px; color: #fff;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }
    .reg-right-tag {
      display: inline-block;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
      border-radius: 4px; padding: 4px 12px;
      font-size: 11px; color: #F2C879; letter-spacing: 0.06em;
      text-transform: uppercase; margin-bottom: 16px;
    }
    .reg-right-h { font-size: 22px; font-weight: 600; line-height: 1.3; margin-bottom: 12px; }
    .reg-right-p { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.8; margin-bottom: 28px; }

    .reg-panel-title {
      font-size: 14px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.75);
      margin-bottom: 18px;
    }
    .reg-feats {
      display: grid;
      gap: 12px;
      margin-bottom: 0;
    }
    .reg-feat {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13px;
      color: rgba(255,255,255,0.92);
      line-height: 1.6;
    }
    .reg-feat-icon {
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

    .reg-footer {
      text-align: center; font-size: 12px; color: #3E4A3C;
      padding: 14px 24px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255,255,255,0.5);
    }

    @media (max-width: 900px) {
      .reg-body { grid-template-columns: 1fr; }
      .reg-right { display: none; }
    }
  `}</style>
    </div>
  );
}