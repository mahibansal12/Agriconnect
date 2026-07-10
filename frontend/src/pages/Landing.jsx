// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import axiosInstance from "../utils/axiosInstance";
import Footer from "../components/common/Footer";
import { formatPrice, formatChange } from "../utils/formatters";

const MOCK_MANDI = [
  { crop: "Wheat",        mandi: "Jaipur Mandi",     price: 2450, change: 2.5  },
  { crop: "Paddy (Dhan)", mandi: "Alwar Mandi",      price: 1860, change: -1.2 },
  { crop: "Mustard",      mandi: "Bharatpur Mandi",  price: 5650, change: 1.8  },
  { crop: "Soybean",      mandi: "Kota Mandi",       price: 4120, change: 0.5  },
  { crop: "Chana",        mandi: "Ajmer Mandi",      price: 4980, change: -0.3 },
];

const MOCK_NEWS = [
  { id: 1, title: "Govt announces new scheme for millet farmers",     category: "Government Policies", date: "12 May 2024" },
  { id: 2, title: "Timely rainfall may boost Kharif crop production", category: "Weather News",        date: "10 May 2024" },
  { id: 3, title: "Drip irrigation can save up to 60% water",        category: "New Technologies",    date: "09 May 2024" },
  { id: 4, title: "MSP for Rabi crops increased by 5%",              category: "Market Updates",      date: "08 May 2024" },
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

const CAT_COLORS = {
  "Government Policies": { bg: "#FFF8E1", color: "#E65100" },
  "Weather News":        { bg: "#E3F2FD", color: "#1565C0" },
  "New Technologies":    { bg: "#E8F5E9", color: "#1B5E20" },
  "Market Updates":      { bg: "#F3E5F5", color: "#6A1B9A" },
};

export default function Landing() {
    const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("Detecting location...");
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherByIP = async () => {
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        const city = ipData.city || "Delhi";
        const state = ipData.region || "India";
        setLocationName(`${city}, ${state}`);
        const res = await axiosInstance.get(
          `/v1/weather/coords?lat=${ipData.latitude}&lon=${ipData.longitude}`
        );
        setWeather(res.data.data);
      } catch (e) {
        console.error("IP weather failed:", e);
      } finally {
        setWeatherLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const geoData = await geoRes.json();
            const city = geoData.address?.city
              || geoData.address?.town
              || geoData.address?.village
              || "Your Location";
            const state = geoData.address?.state || "";
            setLocationName(`${city}, ${state}`);
            const res = await axiosInstance.get(
              `/v1/weather/coords?lat=${latitude}&lon=${longitude}`
            );
            setWeather(res.data.data);
          } catch (err) {
            console.error("GPS weather failed:", err);
            fetchWeatherByIP();
            return;
          }
          setWeatherLoading(false);
        },
        () => {
          // user denied GPS — use IP
          fetchWeatherByIP();
        }
      );
    } else {
      fetchWeatherByIP();
    }
  }, []);

  const getWeatherIcon = (desc = "") => {
    const d = desc.toLowerCase();
    if (d.includes("clear") || d.includes("sunny")) return "☀️";
    if (d.includes("cloud")) return "⛅";
    if (d.includes("rain") || d.includes("drizzle")) return "🌧️";
    if (d.includes("storm") || d.includes("thunder")) return "⛈️";
    if (d.includes("snow")) return "❄️";
    if (d.includes("mist") || d.includes("haze") || d.includes("fog")) return "🌫️";
    return "🌤️";
  };
  return (
    <div className="lp">
      <Navbar />

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-hero-tag">
            <span>🏛️</span> Government recognised platform
          </div>
          <h1 className="lp-hero-h1">
            Connecting Farmers<br />with Opportunities
          </h1>
          <p className="lp-hero-p">
            Buy and sell crops directly, get personalised recommendations, check live mandi
            prices, and access all government schemes — in one official platform.
          </p>
          <div className="lp-hero-btns">
            <Link to="/register" className="lp-btn-primary">Get started free</Link>
            <Link to="/marketplace" className="lp-btn-outline">View marketplace</Link>
          </div>

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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
    {locationName}
  </div>

  {weatherLoading ? (
    <div style={{ textAlign:"center", padding:"20px 0", color:"rgba(255,255,255,0.6)", fontSize:"14px" }}>
      Detecting your location...
    </div>
  ) : weather ? (
    <div className="lp-weather-main">
      <span className="lp-weather-icon">{getWeatherIcon(weather.description)}</span>
      <div>
        <div className="lp-weather-temp">{Math.round(weather.temperature)}°C</div>
        <div className="lp-weather-desc" style={{ textTransform:"capitalize" }}>
          {weather.description} · Humidity {weather.humidity}%
        </div>
        <div className="lp-weather-desc">
          Wind {Math.round(weather.windSpeed * 3.6)} km/h
        </div>
      </div>
    </div>
  ) : (
    <div style={{ textAlign:"center", padding:"20px 0", color:"rgba(255,255,255,0.6)", fontSize:"14px" }}>
      Weather unavailable
    </div>
  )}

  <Link to="/weather" className="lp-weather-link">View full forecast →</Link>
</div>
      </section>

      {/* ── Quick links grid ── */}
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

      {/* ── 3-column row ── */}
      <section className="lp-section">
        <div className="lp-three-col">

          {/* Mandi rates */}
          <div className="lp-card">
            <div className="lp-card-head">
              <span className="lp-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6"  y1="20" x2="6"  y2="14"/>
                </svg>
                Live Mandi Rates
              </span>
              <Link to="/mandi" className="lp-card-link">View all →</Link>
            </div>
            <div className="lp-live-dot">
              <span className="lp-dot" />
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
                </svg>
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
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
                  <svg className="lp-scheme-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA banners ── */}
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
        .lp { display: flex; flex-direction: column; min-height: 100vh; background: linear-gradient(180deg, #EAF7FF 0%, #FFF8E6 42%, #F3F8EC 100%); }

        .lp-hero {
          position: relative; overflow: hidden;
          background:
            linear-gradient(90deg, rgba(7,41,18,0.84) 0%, rgba(18,85,28,0.70) 47%, rgba(21,119,80,0.40) 100%),
            radial-gradient(circle at 82% 18%, rgba(255,205,83,0.95) 0 9%, rgba(255,173,46,0.28) 10% 22%, transparent 34%),
            linear-gradient(180deg, #74C7F2 0%, #BDEBFF 31%, #FFE19A 45%, #79B54A 46%, #236E2A 100%);
          padding: 56px clamp(24px, 6vw, 96px) 48px;
          display: grid; grid-template-columns: minmax(0, 1fr) minmax(340px, 390px); gap: clamp(32px, 5vw, 72px);
          width: 100%; box-sizing: border-box;
        }
        .lp-hero::before {
          content: ""; position: absolute; inset: 42% -8% -24% -8%;
          background:
            repeating-linear-gradient(104deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 58px),
            repeating-linear-gradient(76deg, rgba(8,69,22,0.28) 0 3px, transparent 3px 70px);
          transform: perspective(520px) rotateX(58deg);
          transform-origin: top;
          opacity: 0.9;
        }
        .lp-hero::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(4,34,16,0.18) 100%);
        }
        .lp-hero > * { position: relative; z-index: 1; }
        .lp-hero-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,248,220,0.18); border: 1px solid rgba(255,226,139,0.42);
          border-radius: 4px; padding: 4px 12px;
          font-size: 13px; color: #FFE7A3; letter-spacing: 0.06em;
          text-transform: uppercase; margin-bottom: 16px;
        }
        .lp-hero-h1 { font-size: 44px; font-weight: 600; color: #fff; line-height: 1.22; margin: 0 0 16px; }
        .lp-hero-p  { font-size: 17px; color: rgba(255,255,255,0.88); line-height: 1.8; margin: 0 0 28px; max-width: 620px; }
        .lp-hero-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; }
        .lp-btn-primary {
          padding: 11px 24px; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff;
          border-radius: 8px; font-size: 16px; font-weight: 500; text-decoration: none;
          transition: filter 0.15s, transform 0.15s; box-shadow: 0 10px 22px rgba(239,68,68,0.24);
        }
        .lp-btn-primary:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .lp-btn-outline {
          padding: 10px 22px; background: transparent; color: #fff;
          border: 1.5px solid rgba(255,235,167,0.7); border-radius: 8px;
          font-size: 16px; font-weight: 500; text-decoration: none; transition: background 0.15s;
        }
        .lp-btn-outline:hover { background: rgba(255,214,102,0.16); }

        .lp-stats { display: flex; gap: 0; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px; }
        .lp-stat  { flex: 1; }
        .lp-stat + .lp-stat { border-left: 1px solid rgba(255,255,255,0.15); padding-left: 20px; }
        .lp-stat-val   { font-size: 24px; font-weight: 600; color: #FFE082; }
        .lp-stat-label { font-size: 13px; color: rgba(255,255,255,0.72); margin-top: 2px; }

        .lp-weather {
          background: rgba(9,68,76,0.42); border: 1px solid rgba(179,229,252,0.42);
          border-radius: 12px; padding: 18px; color: #fff; align-self: start;
          width: 100%; box-shadow: 0 20px 50px rgba(10,45,30,0.22);
        }
        .lp-weather-location {
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; color: #B3E5FC; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;
        }
        .lp-weather-main { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .lp-weather-icon { font-size: 40px; }
        .lp-weather-temp { font-size: 38px; font-weight: 600; }
        .lp-weather-desc { font-size: 14px; color: rgba(255,255,255,0.78); }
        .lp-forecast {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 6px;
          border-top: 1px solid rgba(255,255,255,0.12); padding-top: 12px; margin-bottom: 12px;
        }
        .lp-forecast-day { background: rgba(255,255,255,0.12); border-radius: 6px; padding: 7px 4px; text-align: center; }
        .lp-forecast-d { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
        .lp-forecast-t { font-size: 14px; font-weight: 500; margin-top: 4px; }
        .lp-weather-link { font-size: 13px; color: #FFE082; text-decoration: none; display: block; text-align: right; }
        .lp-weather-link:hover { text-decoration: underline; }

        .lp-section { width: 100%; padding: 24px clamp(24px, 6vw, 96px); box-sizing: border-box; }

        .lp-quick-grid {
          display: grid; grid-template-columns: repeat(6,1fr); gap: 10px;
          background: rgba(255,255,255,0.74); border: 1px solid #D8E8C8; border-radius: 12px; padding: 18px;
          box-shadow: 0 18px 40px rgba(45,92,30,0.08);
        }
        .lp-quick-card {
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
          min-height: 126px; padding: 18px 10px; border: 1px solid transparent; border-radius: 8px;
          text-decoration: none; transition: all 0.15s; background: #F8FBF6;
        }
        .lp-quick-card:nth-child(1) { background: #E0F2FE; border-color: #BAE6FD; }
        .lp-quick-card:nth-child(2) { background: #FFF7D6; border-color: #FDE68A; }
        .lp-quick-card:nth-child(3) { background: #E9FBE2; border-color: #BBF7D0; }
        .lp-quick-card:nth-child(4) { background: #F3E8FF; border-color: #E9D5FF; }
        .lp-quick-card:nth-child(5) { background: #FFE4E6; border-color: #FECDD3; }
        .lp-quick-card:nth-child(6) { background: #FFEFD5; border-color: #FED7AA; }
        .lp-quick-card:hover { border-color: #F59E0B; transform: translateY(-2px); box-shadow: 0 12px 26px rgba(245,158,11,0.16); }
        .lp-quick-icon  { font-size: 22px; }
        .lp-quick-label { font-size: 14px; font-weight: 500; color: #0A2E0C; }
        .lp-quick-sub   { font-size: 12px; color: #7A8F76; text-align: center; }

        .lp-three-col { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }

        .lp-card {
          background: rgba(255,255,255,0.88); border: 1px solid #DCE6CF;
          border-radius: 10px; overflow: hidden; box-shadow: 0 14px 32px rgba(50,84,35,0.08);
        }
        .lp-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; border-bottom: 1px solid #E0EAD8;
          background: linear-gradient(90deg, #E0F2FE, #FFF7D6);
        }
        .lp-card-title {
          display: flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 600; color: #0A2E0C;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .lp-card-link { font-size: 13px; color: #1B5E20; text-decoration: none; }
        .lp-card-link:hover { text-decoration: underline; }

        .lp-live-dot {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; font-size: 13px; color: #1B5E20;
          border-bottom: 1px solid #F0F5EE; background: #F7FEE7;
        }
        .lp-dot { width: 7px; height: 7px; background: #4CAF50; border-radius: 50%; animation: lp-pulse 1.5s infinite; }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .lp-table { width: 100%; border-collapse: collapse; }
        .lp-table th {
          font-size: 13px; font-weight: 500; color: #7A8F76;
          text-align: left; padding: 8px 14px;
          background: #F8FBF6; border-bottom: 1px solid #E0EAD8;
        }
        .lp-table td { padding: 9px 14px; border-bottom: 1px solid #F4F7F2; }
        .lp-table tr:last-child td { border-bottom: none; }
        .lp-td-bold  { font-size: 15px; font-weight: 500; color: #0A2E0C; }
        .lp-td-muted { font-size: 14px; color: #7A8F76; }
        .lp-td-sm    { font-size: 13px; }
        .lp-td-green { color: #1B5E20; }
        .lp-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: 500; }
        .lp-badge-up   { background: #E8F5E9; color: #1B5E20; }
        .lp-badge-down { background: #FFEBEE; color: #B71C1C; }
        .lp-badge-flat { background: #F5F5F5; color: #616161; }

        .lp-news-list { display: flex; flex-direction: column; }
        .lp-news-item {
          padding: 11px 14px; border-bottom: 1px solid #F4F7F2;
          text-decoration: none; display: flex; flex-direction: column; gap: 4px; transition: background 0.12s;
        }
        .lp-news-item:last-child { border-bottom: none; }
        .lp-news-item:hover { background: #F8FBF6; }
        .lp-news-cat { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; align-self: flex-start; }
        .lp-news-title { font-size: 15px; font-weight: 500; color: #0A2E0C; line-height: 1.4; }
        .lp-news-date  { font-size: 13px; color: #9AAF94; }

        .lp-scheme-list { display: flex; flex-direction: column; }
        .lp-scheme-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-bottom: 1px solid #F4F7F2;
          text-decoration: none; transition: background 0.12s;
        }
        .lp-scheme-item:last-child { border-bottom: none; }
        .lp-scheme-item:hover { background: #F8FBF6; }
        .lp-scheme-icon    { font-size: 20px; flex-shrink: 0; }
        .lp-scheme-name    { font-size: 14px; font-weight: 500; color: #0A2E0C; line-height: 1.3; }
        .lp-scheme-benefit { font-size: 13px; color: #7A8F76; margin-top: 1px; }
        .lp-scheme-arrow   { color: #C5D9C0; margin-left: auto; flex-shrink: 0; }

        .lp-cta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .lp-cta {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 20px 24px; border-radius: 10px;
        }
        .lp-cta--green { background: linear-gradient(135deg, #0EA5E9, #16A34A); }
        .lp-cta--light { background: linear-gradient(135deg, #FFF7D6, #FFE4E6); border: 1px solid #FED7AA; }
        .lp-cta-title  { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
        .lp-cta--green .lp-cta-title { color: #fff; }
        .lp-cta--light .lp-cta-title { color: #0A2E0C; }
        .lp-cta-sub { font-size: 14px; line-height: 1.6; }
        .lp-cta--green .lp-cta-sub { color: rgba(255,255,255,0.65); }
        .lp-cta--light .lp-cta-sub { color: #7A8F76; }
        .lp-cta-btn {
          white-space: nowrap; padding: 10px 20px; border-radius: 8px;
          font-size: 15px; font-weight: 500; text-decoration: none; flex-shrink: 0; transition: all 0.15s;
        }
        .lp-cta-btn--dark    { background: #F59E0B; color: #fff; }
        .lp-cta-btn--dark:hover { background: #D97706; }
        .lp-cta-btn--outline { background: #fff; color: #B45309; border: 1.5px solid #F59E0B; }
        .lp-cta-btn--outline:hover { background: #FFFBEB; }

        @media (max-width: 1024px) {
          .lp-hero       { grid-template-columns: 1fr; }
          .lp-weather    { display: none; }
          .lp-three-col  { grid-template-columns: 1fr; }
          .lp-quick-grid { grid-template-columns: repeat(3,1fr); }
          .lp-cta-row    { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .lp-hero-h1    { font-size: 30px; }
          .lp-hero       { padding: 40px 18px 32px; }
          .lp-section    { padding: 18px; }
          .lp-quick-grid { grid-template-columns: repeat(2,1fr); }
          .lp-stats      { gap: 0; flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}