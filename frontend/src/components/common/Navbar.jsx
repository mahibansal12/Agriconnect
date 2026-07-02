// src/components/common/Navbar.jsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useAuth from "../../hooks/useAuth";
import { logoutUser } from "../../redux/slices/authSlice";

// ── Nav links visible to everyone ──────────────────────────────
const PUBLIC_LINKS = [
  { to: "/marketplace",         label: "Marketplace" },
  { to: "/crop-knowledge",      label: "Crop Knowledge" },
  { to: "/mandi",               label: "Mandi Rates" },
  { to: "/recommendations/crop",label: "Crop Advisor" },
  { to: "/schemes",             label: "Schemes" },
  { to: "/news",                label: "News" },
  { to: "/shops",               label: "Shops" },
  { to: "/community",           label: "Community" },
];

// ── Extra links shown only when logged in (by role) ────────────
const ROLE_LINKS = {
  farmer: { to: "/farmer/dashboard", label: "My Dashboard" },
  buyer:  { to: "/buyer/dashboard",  label: "My Dashboard" },
  admin:  { to: "/admin/dashboard",  label: "Admin Panel"  },
};

export default function Navbar() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { isLoggedIn, user, role } = useAuth();
  const [menuOpen, setMenuOpen]    = useState(false);
  const [dropOpen, setDropOpen]    = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <>
      {/* ── Announcement bar ─────────────────────────────────── */}
      <div className="nb-announce">
        <span>
          PM-KISAN 17th instalment released — ₹6,000/year for eligible farmers
          &nbsp;|&nbsp; Helpline: 1800-123-4567
        </span>
        <div className="nb-lang">
          <span>हिन्दी</span>
          <span>English</span>
        </div>
      </div>

      {/* ── Main navbar ──────────────────────────────────────── */}
      <nav className="nb">
        <div className="nb-inner">

          {/* Logo */}
          <Link to="/" className="nb-logo">
            <div className="nb-logo-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C12 2 6 7 6 14a6 6 0 0 0 12 0c0-7-6-12-6-12Z"/>
                <path d="M12 14v6"/>
              </svg>
            </div>
            <div>
              <div className="nb-logo-name">AgriConnect</div>
              <div className="nb-logo-sub">SMART FARMING PLATFORM</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="nb-links">
            {PUBLIC_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `nb-link${isActive ? " nb-link--active" : ""}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="nb-right">
            {isLoggedIn ? (
              <>
                {/* Dashboard quick link */}
                {role && ROLE_LINKS[role] && (
                  <Link to={ROLE_LINKS[role].to} className="nb-dash-link">
                    {ROLE_LINKS[role].label}
                  </Link>
                )}

                {/* Avatar dropdown */}
                <div className="nb-avatar-wrap">
                  <button
                    className="nb-avatar"
                    onClick={() => setDropOpen((p) => !p)}
                    aria-label="Account menu"
                    aria-expanded={dropOpen}
                  >
                    {initials}
                  </button>

                  {dropOpen && (
                    <>
                      <div className="nb-drop-overlay" onClick={() => setDropOpen(false)}/>
                      <div className="nb-drop">
                        <div className="nb-drop-header">
                          <div className="nb-drop-name">{user?.name}</div>
                          <div className="nb-drop-role">{role} · {user?.state || "India"}</div>
                        </div>
                        <div className="nb-drop-divider"/>
                        <Link to={ROLE_LINKS[role]?.to} className="nb-drop-item" onClick={() => setDropOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                          Dashboard
                        </Link>
                        <Link to="/ai-assistant" className="nb-drop-item" onClick={() => setDropOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                          AI Assistant
                        </Link>
                        <Link to="/calculators" className="nb-drop-item" onClick={() => setDropOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
                          Calculators
                        </Link>
                        <div className="nb-drop-divider"/>
                        <button className="nb-drop-item nb-drop-logout" onClick={handleLogout}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="nb-login-btn">
                Login / Register
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="nb-hamburger"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="nb-mobile">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="nb-mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="nb-mobile-divider"/>
            {isLoggedIn ? (
              <>
                <Link to={ROLE_LINKS[role]?.to} className="nb-mobile-link" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button className="nb-mobile-logout" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="nb-mobile-btn" onClick={() => setMenuOpen(false)}>
                Login / Register
              </Link>
            )}
          </div>
        )}
      </nav>

      <style>{`
        /* ── Announce bar ── */
        .nb-announce {
          background: linear-gradient(90deg, #0F766E, #16A34A 54%, #F59E0B); color: #fff;
          font-size: 14px; padding: 6px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nb-lang { display: flex; gap: 14px; opacity: 0.8; }
        .nb-lang span { cursor: pointer; }
        .nb-lang span:hover { opacity: 1; text-decoration: underline; }

        /* ── Navbar ── */
        .nb {
          background: rgba(255,255,255,0.94);
          border-bottom: 1px solid #D8E8C8;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .nb-inner {
          width: 100%; margin: 0;
          padding: 0 clamp(24px, 6vw, 96px);
          display: flex; align-items: center; gap: 24px; height: 56px;
        }

        /* Logo */
        .nb-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
        }
        .nb-logo-box {
          width: 34px; height: 34px; background: linear-gradient(135deg, #16A34A, #0EA5E9);
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
        }
        .nb-logo-name { font-size: 18px; font-weight: 600; color: #14532D; line-height: 1.1; }
        .nb-logo-sub  { font-size: 11px; color: #0EA5E9; letter-spacing: 0.07em; }

        /* Desktop links */
        .nb-links {
          display: flex; align-items: center; gap: 6px;
          flex: 1; overflow-x: auto;
        }
        .nb-link {
          padding: 8px 12px; border-radius: 8px;
          font-size: 15px; font-weight: 700; color: #27563A;
          text-decoration: none; white-space: nowrap;
          border: 1px solid transparent;
          transition: color 0.15s, background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.15s;
        }
        .nb-link:nth-child(1) { color: #0369A1; }
        .nb-link:nth-child(2) { color: #15803D; }
        .nb-link:nth-child(3) { color: #B45309; }
        .nb-link:nth-child(4) { color: #047857; }
        .nb-link:nth-child(5) { color: #7E22CE; }
        .nb-link:nth-child(6) { color: #BE123C; }
        .nb-link:nth-child(7) { color: #C2410C; }
        .nb-link:nth-child(8) { color: #0F766E; }
        .nb-link:hover {
          background: linear-gradient(135deg, #ECFDF5, #FFF7D6);
          border-color: #BBF7D0;
          box-shadow: 0 8px 18px rgba(22, 163, 74, 0.14);
          transform: translateY(-1px);
        }
        .nb-link--active {
          color: #fff !important;
          background: linear-gradient(135deg, #16A34A, #F59E0B);
          border-color: rgba(255,255,255,0.35);
          box-shadow: 0 10px 22px rgba(245, 158, 11, 0.22);
        }

        /* Right side */
        .nb-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

        .nb-dash-link {
          font-size: 15px; font-weight: 500; color: #1B5E20;
          text-decoration: none; padding: 6px 12px;
          border: 1px solid #C5E1A5; border-radius: 6px;
          background: #F1F8E9; white-space: nowrap;
          transition: background 0.15s;
        }
        .nb-dash-link:hover { background: #E8F5E9; }

        .nb-login-btn {
          font-size: 15px; font-weight: 500; color: #fff;
          background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 8px 16px;
          border-radius: 6px; text-decoration: none;
          transition: background 0.15s; white-space: nowrap;
        }
        .nb-login-btn:hover { filter: brightness(1.05); }

        /* Avatar */
        .nb-avatar-wrap { position: relative; }
        .nb-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #1B5E20; color: #fff;
          font-size: 14px; font-weight: 600;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s;
        }
        .nb-avatar:hover { opacity: 0.85; }

        /* Dropdown */
        .nb-drop-overlay {
          position: fixed; inset: 0; z-index: 10;
        }
        .nb-drop {
          position: absolute; right: 0; top: calc(100% + 8px);
          width: 200px; background: #fff;
          border: 1px solid #E0EAD8; border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          z-index: 20; overflow: hidden;
        }
        .nb-drop-header { padding: 12px 14px; }
        .nb-drop-name   { font-size: 15px; font-weight: 600; color: #0A2E0C; }
        .nb-drop-role   { font-size: 13px; color: #7A8F76; margin-top: 2px; text-transform: capitalize; }
        .nb-drop-divider { height: 1px; background: #E0EAD8; }
        .nb-drop-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; font-size: 15px; color: #3A4D38;
          text-decoration: none; cursor: pointer;
          background: none; border: none; width: 100%;
          text-align: left; font-family: inherit;
          transition: background 0.12s;
        }
        .nb-drop-item:hover { background: #F4F7F2; color: #1B5E20; }
        .nb-drop-logout { color: #B91C1C !important; }
        .nb-drop-logout:hover { background: #FEF2F2 !important; }

        /* Hamburger */
        .nb-hamburger {
          display: none; background: none; border: none;
          cursor: pointer; color: #5C6B5A; padding: 4px;
        }

        /* Mobile menu */
        .nb-mobile {
          border-top: 1px solid #E0EAD8;
          padding: 12px 16px; display: flex; flex-direction: column; gap: 2px;
          background: #fff;
        }
        .nb-mobile-link {
          padding: 10px 12px; font-size: 16px; color: #3A4D38;
          text-decoration: none; border-radius: 6px;
          transition: background 0.12s;
        }
        .nb-mobile-link:hover { background: #F4F7F2; color: #1B5E20; }
        .nb-mobile-divider    { height: 1px; background: #E0EAD8; margin: 6px 0; }
        .nb-mobile-logout {
          padding: 10px 12px; font-size: 16px; color: #B91C1C;
          background: none; border: none; cursor: pointer;
          font-family: inherit; text-align: left; border-radius: 6px;
          width: 100%;
        }
        .nb-mobile-logout:hover { background: #FEF2F2; }
        .nb-mobile-btn {
          display: block; padding: 10px 12px; margin-top: 6px;
          background: #1B5E20; color: #fff; font-size: 16px;
          font-weight: 500; text-decoration: none;
          border-radius: 8px; text-align: center;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .nb-links    { display: none; }
          .nb-hamburger { display: flex; }
          .nb-dash-link { display: none; }
          .nb-login-btn { display: none; }
        }
      `}</style>
    </>
  );
}
