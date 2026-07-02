// src/components/common/Footer.jsx
import { Link } from "react-router-dom";

const LINKS = {
  Platform: [
    { to: "/marketplace",          label: "Marketplace" },
    { to: "/mandi",                label: "Mandi Rates" },
    { to: "/recommendations/crop", label: "Crop Advisor" },
    { to: "/weather",              label: "Weather" },
    { to: "/ai-assistant",         label: "AI Assistant" },
  ],
  Farmers: [
    { to: "/schemes",     label: "Govt Schemes" },
    { to: "/donations",   label: "Donations" },
    { to: "/shops",       label: "Nearby Shops" },
    { to: "/calculators", label: "Calculators" },
    { to: "/calendar",    label: "Crop Calendar" },
  ],
  Resources: [
    { to: "/crop-knowledge", label: "Crop Knowledge" },
    { to: "/pests",          label: "Pest Library" },
    { to: "/news",           label: "Agriculture News" },
    { to: "/community",      label: "Community Forum" },
  ],
  Company: [
  { to: "/about",    label: "About AgriConnect" },
    { to: "/contact",  label: "Contact Us" },
    { to: "/privacy",  label: "Privacy Policy" },
    { to: "/terms",    label: "Terms of Use" },
    { to: "/grievance",label: "Grievance" },
  ],
};

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft-inner">

        {/* Brand col */}
        <div className="ft-brand">
          <div className="ft-logo">
            <div className="ft-logo-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C12 2 6 7 6 14a6 6 0 0 0 12 0c0-7-6-12-6-12Z"/>
                <path d="M12 14v6"/>
              </svg>
            </div>
            <div>
              <div className="ft-logo-name">AgriConnect</div>
              <div className="ft-logo-sub">SMART FARMING PLATFORM</div>
            </div>
          </div>
          <p className="ft-desc">
            Connecting farmers, buyers and agricultural resources across India. Empowering every farmer with technology, knowledge and fair markets.
          </p>
          <div className="ft-helpline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Helpline: 1800-123-4567
          </div>
          <div className="ft-helpline" style={{ marginTop: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
            support@agriconnect.gov.in
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, links]) => (
          <div key={heading} className="ft-col">
            <div className="ft-col-head">{heading}</div>
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="ft-link">{l.label}</Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="ft-bar">
        <span>© 2026 AgriConnect Platform &nbsp;·&nbsp; Ministry of Agriculture &amp; Farmers Welfare, Government of India</span>
        <div className="ft-bar-links">
          <Link to="/privacy" className="ft-bar-link">Privacy</Link>
          <Link to="/terms"   className="ft-bar-link">Terms</Link>
          <Link to="/sitemap" className="ft-bar-link">Sitemap</Link>
        </div>
      </div>

      <style>{`
        .ft {
          background: #0A2E0C;
          color: #fff;
          margin-top: auto;
        }
        .ft-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 48px 24px 36px;
          display: grid;
          grid-template-columns: 260px repeat(4, 1fr);
          gap: 32px;
        }

        /* Brand */
        .ft-logo      { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .ft-logo-box  { width: 34px; height: 34px; background: #1B5E20; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ft-logo-name { font-size: 16px; font-weight: 600; color: #fff; line-height: 1.1; }
        .ft-logo-sub  { font-size: 9px; color: #4CAF50; letter-spacing: 0.07em; }
        .ft-desc      { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 16px; }
        .ft-helpline  { display: flex; align-items: center; gap: 7px; font-size: 12px; color: rgba(255,255,255,0.6); }

        /* Columns */
        .ft-col      { display: flex; flex-direction: column; gap: 8px; }
        .ft-col-head { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 4px; }
        .ft-link     { font-size: 13px; color: rgba(255,255,255,0.65); text-decoration: none; transition: color 0.12s; }
        .ft-link:hover { color: #A5D6A7; }

        /* Bottom bar */
        .ft-bar {
          border-top: 1px solid rgba(255,255,255,0.08);
          max-width: 1280px; margin: 0 auto;
          padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: rgba(255,255,255,0.35);
        }
        .ft-bar-links { display: flex; gap: 16px; }
        .ft-bar-link  { color: rgba(255,255,255,0.35); text-decoration: none; }
        .ft-bar-link:hover { color: rgba(255,255,255,0.7); }

        @media (max-width: 900px) {
          .ft-inner { grid-template-columns: 1fr 1fr; }
          .ft-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .ft-inner { grid-template-columns: 1fr; }
          .ft-bar   { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>
    </footer>
  );
}
