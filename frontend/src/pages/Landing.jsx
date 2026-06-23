// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { formatPrice, formatChange } from "../utils/formatters";

// ── Mock data (swap with real API calls in Week 4) ─────────────
const MOCK_MANDI = [
  { crop: "Wheat",        mandi: "Jaipur Mandi",     price: 2450, change: 2.5  },
  { crop: "Paddy (Dhan)", mandi: "Alwar Mandi",      price: 1860, change: -1.2 },
  { crop: "Mustard",      mandi: "Bharatpur Mandi",  price: 5650, change: 1.8  },
  { crop: "Soybean",      mandi: "Kota Mandi",       price: 4120, change: 0.5  },
  { crop: "Chana",        mandi: "Ajmer Mandi",      price: 4980, change: -0.3 },
];

const MOCK_NEWS = [
  { id: 1, title: "Govt announces new scheme for millet farmers",  category: "Government Policies", date: "12 May 2024" },
  { id: 2, title: "Timely rainfall may boost Kharif crop production", category: "Weather News",       date: "10 May 2024" },
  { id: 3, title: "Drip irrigation can save up to 60% water",      category: "New Technologies",    date: "09 May 2024" },
  { id: 4, title: "MSP for Rabi crops increased by 5%",            category: "Market Updates",      date: "08 May 2024" },
];

const MOCK_SCHEMES = [
  { id: 1, icon: "💰", name: "PM Kisan Samman Nidhi",         benefit: "₹6,000 per year financial support" },
  { id: 2, icon: "🌾", name: "PM Fasal Bima Yojana",          benefit: "Crop insurance for financial support" },
  { id: 3, icon: "🧪", name: "Soil Health Card Scheme",        benefit: "Free soil testing and improvement" },
  { id: 4, icon: "💳", name: "Kisan Credit Card",              benefit: "Low interest loans for farmers" },
  { id: 5, icon: "💧", name: "Pradhan Mantri Krishi Sinchai",  benefit: "Irrigation facility scheme" },
  { id: 6, icon: "📱", name: "Rashtriya Krishi Vikas Yojana", benefit: "Agriculture development support" },
];

const QUICK_LINKS = [
  { to: "/marketplace",          icon: "🛒", label: "Marketplace",  sub: "Buy & sell crops" },
  { to: "/mandi",                icon: "📊", label: "Mandi Rates",  sub: "Live prices" },
  { to: "/recommendations/crop", icon: "🌱", label: "Crop Advisor", sub: "Smart suggestions" },
  { to: "/schemes",              icon: "📋", label: "Schemes",      sub: "Govt benefits" },
  { to: "/shops",                icon: "📍", label: "Shops",        sub: "Nearby stores" },
  { to: "/donations",            icon: "❤️", label: "Donate",       sub: "Support farmers" },
];

// ── Category badge color map ───────────────────────────────────
const CAT_COLORS = {
  "Government Policies": { bg: "#FFF8E1", color: "#E65100" },
  "Weather News":        { bg: "#E3F2FD", color: "#1565C0" },
  "New Technologies":    { bg: "#E8F5E9", color: "#1B5E20" },
  "Market Updates":      { bg: "#F3E5F5", color: "#6A1B9A" },
};

export default function Landing() {
  return (
    <div className="lp">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-hero-tag">
            <span>🏛️</span> Government recognised platform
          </div>
          <h1 className="lp-hero-h1">
            Connecting Farmers<br/>with Opportunities
          </h1>
          <p className="lp-hero-p">
            Buy and sell crops directly, get personalised recommendations, check live mandi prices, and access all government schemes — in one official platform.
          </p>
          <div className="lp-hero-btns">
            <Link to="/register" className="lp-btn-primary">Get started free</Link>
            <Link to="/marketplace" className="lp-btn-outline">View marketplace</Link>
          </div>

          {/* Stats */}
          <div className="lp-stats">
            {[
              ["12,400+", "Registered farmers"],
              ["₹2.8Cr+", "Crops traded"],
              ["500+",    "Mandis covered"],
              ["18",      "States active"],
            ].map(([val, label]) => (
              <div key={label} className="lp-stat">
                <div className="lp-stat-val">{val}</div>
                <div className="lp-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather widget */}
        <div className="lp-weather">
          <div className="lp-weather-location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Jaipur, Rajasthan
          </div>
          <div className="lp-weather-main">
            <span className="lp-weather-icon">☀️</span>
            <div>
              <div className="lp-weather-temp">32°C</div>
              <div className="lp-weather-desc">Sunny · Humidity 42%</div>
              <div className="lp-weather-desc">Wind 18 km/h · Rain 0%</div>
            </div>
          </div>
          <div className="lp-forecast">
            {[["Tue","☀️","33°"],["Wed","☀️","34°"],["Thu","⛅","32°"],["Fri","🌤️","31°"]].map(([d,ic,t]) => (
              <div key={d} className="lp-forecast-day">
                <div className="lp-forecast-d">{d}</div>
                <div>{ic}</div>
                <div className="lp-forecast-t">{t}</div>
              </div>
            ))}
          </div>
          <Link to="/weather" className="lp-weather-link">View full forecast →</Link>
        </div>
      </section>

      {/* ── Quick links grid ─────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-quick-grid">
          {QUICK_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="lp-quick-card">
              <span className="lp-quick-icon">{l.icon}</span>
              <span className="lp-quick-label">{l.label}</span>
              <span className="lp-quick-sub">{l.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3-column row: Mandi + News + Schemes ─────────────── */}
      <section className="lp-section">
        <div className="lp-three-col">

          {/* Mandi rates */}
          <div className="lp-card">
            <div className="lp-card-head">
              <span className="lp-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Live Mandi Rates
              </span>
              <Link to="/mandi" className="lp-card-link">View all →</Link>
            </div>
            <div className="lp-live-dot">
              <span className="lp-dot"/>
              <span>Live · Updated 2 min ago</span>
            </div>
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Mandi</th>
                  <th>Price</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MANDI.map((r) => {
                  const ch = formatChange(r.change);
                  return (
                    <tr key={r.crop}>
                      <td className="lp-td-bold">{r.crop}</td>
                      <td className="lp-td-muted lp-td-sm">{r.mandi}</td>
                      <td className="lp-td-bold lp-td-green">{formatPrice(r.price)}</td>
                      <td>
                        <span className={`lp-badge lp-badge-${ch.direction}`}>{ch.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Latest news */}
          <div className="lp-card">
            <div className="lp-card-head">
              <span className="lp-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                Latest News
              </span>
              <Link to="/news" className="lp-card-link">View all →</Link>
            </div>
            <div className="lp-news-list">
              {MOCK_NEWS.map((n) => {
                const style = CAT_COLORS[n.category] || { bg: "#F3F4F6", color: "#374151" };
                return (
                  <Link key={n.id} to={`/news/${n.id}`} className="lp-news-item">
                    <span className="lp-news-cat" style={{ background: style.bg, color: style.color }}>
                      {n.category}
                    </span>
                    <div className="lp-news-title">{n.title}</div>
                    <div className="lp-news-date">{n.date}</div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Schemes */}
          <div className="lp-card">
            <div className="lp-card-head">
              <span className="lp-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>
                Top Schemes
              </span>
              <Link to="/schemes" className="lp-card-link">View all →</Link>
            </div>
            <div className="lp-scheme-list">
              {MOCK_SCHEMES.map((s) => (
                <Link key={s.id} to={`/schemes/${s.id}`} className="lp-scheme-item">
                  <span className="lp-scheme-icon">{s.icon}</span>
                  <div>
                    <div className="lp-scheme-name">{s.name}</div>
                    <div className="lp-scheme-benefit">{s.benefit}</div>
                  </div>
                  <svg className="lp-scheme-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banners ──────────────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-cta-row">
          <div className="lp-cta lp-cta--green">
            <div>
              <div className="lp-cta-title">Get personalised crop recommendations</div>
              <div className="lp-cta-sub">Answer a few questions and get the best crop suggestions for your land, soil and season.</div>
            </div>
            <Link to="/recommendations/crop" className="lp-cta-btn lp-cta-btn--dark">Get started →</Link>
          </div>
          <div className="lp-cta lp-cta--light">
            <div>
              <div className="lp-cta-title">Find nearby agriculture shops</div>
              <div className="lp-cta-sub">Seeds, fertilizers, pesticides and equipment dealers near you on the map.</div>
            </div>
            <Link to="/shops" className="lp-cta-btn lp-cta-btn--outline">Find shops →</Link>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .lp { display: flex; flex-direction: column; min-height: 100vh; background: #F4F7F2; }

        /* ── Hero ── */
        .lp-hero {
          background: linear-gradient(135deg, #0A3D0C 0%, #1B5E20 55%, #2E7D32 100%);
          padding: 48px 24px 40px;
          display: grid; grid-template-columns: 1fr 340px; gap: 32px;
          max-width: 1280px; margin: 0 auto; width: 100%; box-sizing: border-box;
        }
        .lp-hero-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
          border-radius: 4px; padding: 4px 12px;
          font-size: 11px; color: #A5D6A7; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 16px;
        }
        .lp-hero-h1 {
          font-size: 34px; font-weight: 600; color: #fff;
          line-height: 1.25; margin: 0 0 12px; letter-spacing: -0.5px;
        }
        .lp-hero-p {
          font-size: 14px; color: rgba(255,255,255,0.7);
          line-height: 1.8; margin: 0 0 24px; max-width: 480px;
        }
        .lp-hero-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
        .lp-btn-primary {
          padding: 11px 24px; background: #4CAF50; color: #fff;
          border-radius: 8px; font-size: 14px; font-weight: 500;
          text-decoration: none; transition: background 0.15s;
        }
        .lp-btn-primary:hover { background: #388E3C; }
        .lp-btn-outline {
          padding: 10px 22px; background: transparent; color: #fff;
          border: 1.5px solid rgba(255,255,255,0.4); border-radius: 8px;
          font-size: 14px; font-weight: 500; text-decoration: none;
          transition: background 0.15s;
        }
        .lp-btn-outline:hover { background: rgba(255,255,255,0.08); }

        /* Stats */
        .lp-stats {
          display: flex; gap: 0;
          border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px;
        }
        .lp-stat { flex: 1; }
        .lp-stat + .lp-stat { border-left: 1px solid rgba(255,255,255,0.15); padding-left: 20px; }
        .lp-stat-val   { font-size: 20px; font-weight: 600; color: #A5D6A7; }
        .lp-stat-label { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 2px; }

        /* Weather widget */
        .lp-weather {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px; padding: 18px; color: #fff; align-self: start;
        }
        .lp-weather-location {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #A5D6A7; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;
        }
        .lp-weather-main { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .lp-weather-icon { font-size: 40px; }
        .lp-weather-temp { font-size: 34px; font-weight: 600; }
        .lp-weather-desc { font-size: 12px; color: rgba(255,255,255,0.6); }
        .lp-forecast {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 6px;
          border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px; margin-bottom: 12px;
        }
        .lp-forecast-day {
          background: rgba(255,255,255,0.06); border-radius: 6px;
          padding: 7px 4px; text-align: center;
        }
        .lp-forecast-d { font-size: 10px; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .lp-forecast-t { font-size: 12px; font-weight: 500; margin-top: 4px; }
        .lp-weather-link { font-size: 11px; color: #80CBC4; text-decoration: none; display: block; text-align: right; }
        .lp-weather-link:hover { text-decoration: underline; }

        /* Sections */
        .lp-section { max-width: 1280px; margin: 0 auto; width: 100%; padding: 20px 24px; box-sizing: border-box; }

        /* Quick links */
        .lp-quick-grid {
          display: grid; grid-template-columns: repeat(6,1fr); gap: 10px;
          background: #fff; border: 1px solid #E0EAD8; border-radius: 12px; padding: 16px;
        }
        .lp-quick-card {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 8px; border: 1px solid #E0EAD8; border-radius: 8px;
          text-decoration: none; transition: all 0.15s; background: #F8FBF6;
        }
        .lp-quick-card:hover { border-color: #1B5E20; background: #EDF5EB; transform: translateY(-1px); }
        .lp-quick-icon  { font-size: 22px; }
        .lp-quick-label { font-size: 12px; font-weight: 500; color: #0A2E0C; }
        .lp-quick-sub   { font-size: 10px; color: #7A8F76; text-align: center; }

        /* 3 col */
        .lp-three-col { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }

        /* Card */
        .lp-card {
          background: #fff; border: 1px solid #E0EAD8;
          border-radius: 10px; overflow: hidden;
        }
        .lp-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-bottom: 1px solid #E0EAD8;
          background: #F8FBF6;
        }
        .lp-card-title {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: #0A2E0C;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .lp-card-link { font-size: 11px; color: #1B5E20; text-decoration: none; }
        .lp-card-link:hover { text-decoration: underline; }

        /* Live dot */
        .lp-live-dot {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; font-size: 11px; color: #1B5E20;
          border-bottom: 1px solid #F0F5EE;
        }
        .lp-dot {
          width: 7px; height: 7px; background: #4CAF50; border-radius: 50%;
          animation: lp-pulse 1.5s infinite;
        }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* Table */
        .lp-table { width: 100%; border-collapse: collapse; }
        .lp-table th {
          font-size: 11px; font-weight: 500; color: #7A8F76;
          text-align: left; padding: 8px 14px;
          background: #F8FBF6; border-bottom: 1px solid #E0EAD8;
        }
        .lp-table td { padding: 9px 14px; border-bottom: 1px solid #F4F7F2; }
        .lp-table tr:last-child td { border-bottom: none; }
        .lp-td-bold  { font-size: 13px; font-weight: 500; color: #0A2E0C; }
        .lp-td-muted { font-size: 12px; color: #7A8F76; }
        .lp-td-sm    { font-size: 11px; }
        .lp-td-green { color: #1B5E20; }
        .lp-badge {
          display: inline-flex; align-items: center;
          padding: 2px 8px; border-radius: 4px;
          font-size: 11px; font-weight: 500;
        }
        .lp-badge-up   { background: #E8F5E9; color: #1B5E20; }
        .lp-badge-down { background: #FFEBEE; color: #B71C1C; }
        .lp-badge-flat { background: #F5F5F5; color: #616161; }

        /* News list */
        .lp-news-list { display: flex; flex-direction: column; }
        .lp-news-item {
          padding: 11px 14px; border-bottom: 1px solid #F4F7F2;
          text-decoration: none; display: flex; flex-direction: column; gap: 4px;
          transition: background 0.12s;
        }
        .lp-news-item:last-child { border-bottom: none; }
        .lp-news-item:hover { background: #F8FBF6; }
        .lp-news-cat {
          display: inline-flex; align-items: center;
          padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 500;
          align-self: flex-start;
        }
        .lp-news-title { font-size: 13px; font-weight: 500; color: #0A2E0C; line-height: 1.4; }
        .lp-news-date  { font-size: 11px; color: #9AAF94; }

        /* Scheme list */
        .lp-scheme-list { display: flex; flex-direction: column; }
        .lp-scheme-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-bottom: 1px solid #F4F7F2;
          text-decoration: none; transition: background 0.12s;
        }
        .lp-scheme-item:last-child { border-bottom: none; }
        .lp-scheme-item:hover { background: #F8FBF6; }
        .lp-scheme-icon  { font-size: 20px; flex-shrink: 0; }
        .lp-scheme-name  { font-size: 12px; font-weight: 500; color: #0A2E0C; line-height: 1.3; }
        .lp-scheme-benefit { font-size: 11px; color: #7A8F76; margin-top: 1px; }
        .lp-scheme-arrow { color: #C5D9C0; margin-left: auto; flex-shrink: 0; }

        /* CTA banners */
        .lp-cta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .lp-cta {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 20px 24px; border-radius: 10px;
        }
        .lp-cta--green { background: #1B5E20; }
        .lp-cta--light { background: #fff; border: 1px solid #E0EAD8; }
        .lp-cta-title {
          font-size: 15px; font-weight: 600; margin-bottom: 4px;
        }
        .lp-cta--green .lp-cta-title { color: #fff; }
        .lp-cta--light .lp-cta-title { color: #0A2E0C; }
        .lp-cta-sub { font-size: 12px; line-height: 1.6; }
        .lp-cta--green .lp-cta-sub { color: rgba(255,255,255,0.65); }
        .lp-cta--light .lp-cta-sub { color: #7A8F76; }
        .lp-cta-btn {
          white-space: nowrap; padding: 10px 20px;
          border-radius: 8px; font-size: 13px; font-weight: 500;
          text-decoration: none; flex-shrink: 0; transition: all 0.15s;
        }
        .lp-cta-btn--dark    { background: #4CAF50; color: #fff; }
        .lp-cta-btn--dark:hover { background: #388E3C; }
        .lp-cta-btn--outline { background: transparent; color: #1B5E20; border: 1.5px solid #1B5E20; }
        .lp-cta-btn--outline:hover { background: #F1F8E9; }

        @media (max-width: 1024px) {
          .lp-hero        { grid-template-columns: 1fr; }
          .lp-weather     { display: none; }
          .lp-three-col   { grid-template-columns: 1fr; }
          .lp-quick-grid  { grid-template-columns: repeat(3,1fr); }
          .lp-cta-row     { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .lp-hero-h1     { font-size: 26px; }
          .lp-quick-grid  { grid-template-columns: repeat(2,1fr); }
          .lp-stats       { gap: 0; flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
