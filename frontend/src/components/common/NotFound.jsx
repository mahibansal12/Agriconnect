// src/components/common/NotFound.jsx
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf">
      <div className="nf-box">
        <div className="nf-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C12 2 6 7 6 14a6 6 0 0 0 12 0c0-7-6-12-6-12Z"/>
            <path d="M12 14v6"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </div>
        <div className="nf-code">404</div>
        <h1 className="nf-heading">Page not found</h1>
        <p className="nf-desc">The page you're looking for doesn't exist or has been moved. Check the URL or go back to the homepage.</p>
        <div className="nf-actions">
          <button className="nf-btn-back" onClick={() => navigate(-1)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Go back
          </button>
          <Link to="/" className="nf-btn-home">Go to homepage</Link>
        </div>
        <div className="nf-links">
          <span className="nf-links-label">Quick links:</span>
          {[
            ["/marketplace",  "Marketplace"],
            ["/mandi",        "Mandi rates"],
            ["/schemes",      "Schemes"],
            ["/community",    "Community"],
          ].map(([to, label]) => (
            <Link key={to} to={to} className="nf-quick-link">{label}</Link>
          ))}
        </div>
      </div>

      <style>{`
        .nf {
          min-height: 100vh; display: flex;
          align-items: center; justify-content: center;
          background: #F4F7F2; padding: 24px;
        }
        .nf-box {
          background: #fff; border: 1px solid #E0EAD8;
          border-radius: 16px; padding: 48px 40px;
          max-width: 480px; width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
        }
        .nf-icon { margin-bottom: 16px; display: flex; justify-content: center; }
        .nf-code {
          font-size: 72px; font-weight: 700; color: #E0EAD8;
          line-height: 1; margin-bottom: 12px; letter-spacing: -4px;
        }
        .nf-heading { font-size: 22px; font-weight: 600; color: #0A2E0C; margin: 0 0 10px; }
        .nf-desc    { font-size: 14px; color: #7A8F76; line-height: 1.7; margin: 0 0 28px; }

        .nf-actions { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
        .nf-btn-back {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 18px; background: #F0F5EE;
          border: 1px solid #D6E4D0; border-radius: 8px;
          font-size: 13px; font-weight: 500; color: #3A4D38;
          cursor: pointer; font-family: inherit;
          transition: background 0.15s;
        }
        .nf-btn-back:hover { background: #E4EDDF; }
        .nf-btn-home {
          padding: 10px 18px; background: #1B5E20; color: #fff;
          border-radius: 8px; font-size: 13px; font-weight: 500;
          text-decoration: none; transition: background 0.15s;
        }
        .nf-btn-home:hover { background: #145218; }

        .nf-links       { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .nf-links-label { font-size: 12px; color: #9AAF94; }
        .nf-quick-link  { font-size: 12px; color: #1B5E20; text-decoration: none; }
        .nf-quick-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
