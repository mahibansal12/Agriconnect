// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { formatPrice, formatDate } from "../utils/formatters";
import axiosInstance from "../utils/axiosInstance";

// ─── Constants ───────────────────────────────────────────────────────────────

const SCHEME_CATEGORY_ICON = {
  subsidy:   "💰",
  loan:      "🏦",
  insurance: "🛡️",
  training:  "📚",
  other:     "📋",
};

const QUICK_LINKS = [
  { to: "/marketplace",          icon: "🛒", label: "Marketplace",  sub: "Buy & sell crops",       color: "#E0F2FE", border: "#7DD3FC", accent: "#0EA5E9" },
  { to: "/mandi",                icon: "📊", label: "Mandi Rates",  sub: "Live prices",             color: "#FFF7D6", border: "#FDE68A", accent: "#D97706" },
  { to: "/recommendations/crop", icon: "🌱", label: "Crop Advisor", sub: "Smart suggestions",       color: "#D1FAE5", border: "#6EE7B7", accent: "#059669" },
  { to: "/schemes",              icon: "📋", label: "Schemes",      sub: "Govt benefits",           color: "#EDE9FE", border: "#C4B5FD", accent: "#7C3AED" },
  { to: "/shops",                icon: "📍", label: "Shops",        sub: "Nearby stores",           color: "#FFE4E6", border: "#FECDD3", accent: "#E11D48" },
  { to: "/donations",            icon: "❤️", label: "Donate",       sub: "Support farmers",         color: "#FEF3C7", border: "#FCD34D", accent: "#B45309" },
];

const CAT_COLORS = {
  government: { bg: "#dbeafe", color: "#1d4ed8", label: "Government" },
  market:     { bg: "#fef3c7", color: "#92400e", label: "Market" },
  weather:    { bg: "#e0f2fe", color: "#0c4a6e", label: "Weather" },
  technology: { bg: "#ede9fe", color: "#4c1d95", label: "Technology" },
  general:    { bg: "#d1fae5", color: "#064e3b", label: "General" },
};

const HOW_IT_WORKS = [
  { step: "01", icon: "🌾", title: "List Your Crops", desc: "Register as a farmer and list your crops with quantity, quality, and expected price in minutes." },
  { step: "02", icon: "🤝", title: "Connect with Buyers", desc: "Our platform matches your crops with verified buyers across India. No middlemen, no hidden fees." },
  { step: "03", icon: "💰", title: "Earn Better Returns", desc: "Negotiate directly, access live Mandi rates, and get AI-powered pricing suggestions for maximum profit." },
];



const timeAgo = (dateString) => {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};



// ─── Scroll-triggered section wrapper ────────────────────────────────────────

function RevealSection({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Landing() {
  const [weather, setWeather]               = useState(null);
  const [locationName, setLocationName]     = useState("Detecting location...");
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [schemes, setSchemes]               = useState([]);
  const [mandiRates, setMandiRates]         = useState([]);
  const [news, setNews]                     = useState([]);
  const [mandiLoading, setMandiLoading]     = useState(true);
  const [schemesLoading, setSchemesLoading] = useState(true);

  // ── Data fetching (identical logic, unchanged) ──────────────────────────────

  useEffect(() => {
    const fetchTopMandiRates = async () => {
      try {
        const res = await axiosInstance.get("/v1/mandi/rates", {
          params: { limit: 5, sortBy: "arrivalDate", order: "desc" },
        });
        setMandiRates(res.data?.data?.rates || []);
      } catch (err) {
        console.error("Error fetching mandi rates:", err);
        setMandiRates([]);
      } finally {
        setMandiLoading(false);
      }
    };
    fetchTopMandiRates();
  }, []);

  useEffect(() => {
    const fetchTopNews = async () => {
      try {
        const res = await axiosInstance.get("/v1/news");
        const articles = Array.isArray(res.data?.data) ? res.data.data : [];
        const sorted = [...articles].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNews(sorted.slice(0, 4));
      } catch (err) {
        console.error("Error fetching news:", err);
        setNews([]);
      }
    };
    fetchTopNews();
  }, []);

  useEffect(() => {
    const fetchTopSchemes = async () => {
      try {
        const res = await axiosInstance.get("/v1/schemes");
        setSchemes((res.data.data || []).slice(0, 5));
      } catch (err) {
        console.error("Error fetching schemes:", err);
        setSchemes([]);
      } finally {
        setSchemesLoading(false);
      }
    };
    fetchTopSchemes();
  }, []);

  useEffect(() => {
    const getWeatherByCoords = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=7ea1a387eddc4306145926f9a6eec184&units=metric`
        );
        const data = await res.json();
        if (data.cod !== 200) throw new Error("Weather API error");
        setWeather({
          city: data.name,
          country: data.sys.country,
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          windSpeed: data.wind.speed,
        });
        setLocationName(`${data.name}, ${data.sys.country}`);
      } catch (err) {
        console.error("Weather fetch failed:", err);
      } finally {
        setWeatherLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => getWeatherByCoords(position.coords.latitude, position.coords.longitude),
        async () => {
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            const ipData = await ipRes.json();
            await getWeatherByCoords(ipData.latitude, ipData.longitude);
          } catch (e) {
            setWeatherLoading(false);
          }
        }
      );
    } else {
      setWeatherLoading(false);
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="lp">
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="lp-hero">
        {/* Animated gradient background orbs */}
        <div className="lp-hero-orb lp-hero-orb--1" />
        <div className="lp-hero-orb lp-hero-orb--2" />
        <div className="lp-hero-orb lp-hero-orb--3" />

        {/* Particle dots */}
        <div className="lp-particles" aria-hidden="true">
          {[...Array(18)].map((_, i) => (
            <span key={i} className="lp-particle" style={{ "--i": i }} />
          ))}
        </div>

        {/* Hero content */}
        <motion.div
          className="lp-hero-content"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="lp-hero-tag">
            <span className="lp-hero-tag-dot" />
            <span>🏛️</span>
            <span>Government Recognised Platform</span>
          </motion.div>

          <motion.h1 variants={fadeUpSlow} className="lp-hero-h1">
            Connecting Farmers<br />
            <span className="lp-hero-h1-accent">with Opportunities</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="lp-hero-p">
            Buy and sell crops directly, get personalised recommendations, check live mandi
            prices, and access all government schemes — in one official platform.
          </motion.p>

          <motion.div variants={fadeUp} className="lp-hero-btns">
            <Link to="/register" className="lp-btn-primary">
              <span>Get started free</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/marketplace" className="lp-btn-outline">
              <span>View marketplace</span>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="lp-stats">
            {[
              ["15+",  "Crops available"],
              ["Free", "Access to schemes"],
              ["Live", "Mandi rates"],
              ["24/7", "AI assistance"],
            ].map(([val, label]) => (
              <div key={label} className="lp-stat">
                <div className="lp-stat-val">{val}</div>
                <div className="lp-stat-label">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Weather widget */}
        <motion.div
          className="lp-weather"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="lp-weather-inner">
            <div className="lp-weather-location">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{locationName}</span>
            </div>

            {weatherLoading ? (
              <div className="lp-weather-skeleton">
                <div className="lp-skel lp-skel--circle" />
                <div className="lp-skel-lines">
                  <div className="lp-skel lp-skel--wide" />
                  <div className="lp-skel lp-skel--narrow" />
                </div>
              </div>
            ) : weather ? (
              <>
                <div className="lp-weather-main">
                  <motion.span
                    className="lp-weather-icon"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  >
                    {getWeatherIcon(weather.description)}
                  </motion.span>
                  <div>
                    <div className="lp-weather-temp">{Math.round(weather.temperature)}°C</div>
                    <div className="lp-weather-desc" style={{ textTransform: "capitalize" }}>
                      {weather.description}
                    </div>
                    <div className="lp-weather-meta">
                      <span>💧 {weather.humidity}%</span>
                      <span>🌬️ {Math.round(weather.windSpeed * 3.6)} km/h</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="lp-weather-unavail">Weather unavailable</div>
            )}

            <Link to="/weather" className="lp-weather-link">
              View full forecast
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          QUICK LINKS GRID
      ══════════════════════════════════════════════════════ */}
      <section className="lp-section lp-section--quicklinks">
        <motion.div
          className="lp-quick-grid"
          variants={staggerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {QUICK_LINKS.map((l, idx) => (
            <motion.div key={l.to} variants={scaleIn}>
              <Link
                to={l.to}
                className="lp-quick-card"
                style={{ "--card-bg": l.color, "--card-border": l.border, "--card-accent": l.accent }}
              >
                <motion.span
                  className="lp-quick-icon"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {l.icon}
                </motion.span>
                <span className="lp-quick-label">{l.label}</span>
                <span className="lp-quick-sub">{l.sub}</span>
                <span className="lp-quick-arrow">→</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>



      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS (NEW)
      ══════════════════════════════════════════════════════ */}
      <RevealSection className="lp-section lp-section--how">
        <div className="lp-how-header">
          <div className="lp-section-eyebrow">Simple Process</div>
          <h2 className="lp-section-h2">How AgriConnect Works</h2>
          <p className="lp-section-sub">From farm to market in three straightforward steps</p>
        </div>
        <motion.div
          className="lp-how-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {HOW_IT_WORKS.map((h, idx) => (
            <motion.div key={h.step} variants={fadeUp} className="lp-how-card">
              <div className="lp-how-step">{h.step}</div>
              <motion.div
                className="lp-how-icon"
                whileHover={{ scale: 1.15, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {h.icon}
              </motion.div>
              <h3 className="lp-how-title">{h.title}</h3>
              <p className="lp-how-desc">{h.desc}</p>
              {idx < HOW_IT_WORKS.length - 1 && (
                <div className="lp-how-connector" aria-hidden="true">→</div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════
          3-COLUMN: MANDI / NEWS / SCHEMES
      ══════════════════════════════════════════════════════ */}
      <section className="lp-section">
        <motion.div
          className="lp-three-col"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {/* ── Live Mandi Rates ── */}
          <motion.div variants={fadeUp} className="lp-card">
            <div className="lp-card-head">
              <span className="lp-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Live Mandi Rates
              </span>
              <Link to="/mandi" className="lp-card-link">View all →</Link>
            </div>

            <div className="lp-live-row">
              <div className="lp-live-badge">
                <motion.span
                  className="lp-dot"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                />
                <span className="lp-live-text">LIVE</span>
              </div>
              <span className="lp-live-updated">
                {mandiRates.length
                  ? `Updated ${timeAgo(mandiRates[0].arrivalDate)}`
                  : "Fetching latest rates..."}
              </span>
            </div>

            {mandiLoading ? (
              <div className="lp-table-skeleton">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="lp-table-skel-row">
                    <div className="lp-skel lp-skel--text" />
                    <div className="lp-skel lp-skel--text lp-skel--short" />
                    <div className="lp-skel lp-skel--text lp-skel--price" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="lp-table">
                <thead>
                  <tr>
                    <th>Crop</th><th>Mandi</th><th>Price</th><th>Arrival</th>
                  </tr>
                </thead>
                <tbody>
                  {mandiRates.length === 0 && (
                    <tr><td colSpan={4} className="lp-empty-cell">No mandi rates available right now.</td></tr>
                  )}
                  {mandiRates.map((r, idx) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      whileHover={{ backgroundColor: "rgba(20, 83, 45, 0.04)" }}
                      className="lp-table-row"
                    >
                      <td className="lp-td-bold">{r.commodityName}</td>
                      <td className="lp-td-muted lp-td-sm">{r.mandi}</td>
                      <td className="lp-td-bold lp-td-green">{formatPrice(r.modalPrice)}</td>
                      <td className="lp-td-muted lp-td-sm">{formatDate(r.arrivalDate)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>

          {/* ── Latest News ── */}
          <motion.div variants={fadeUp} className="lp-card">
            <div className="lp-card-head">
              <span className="lp-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                </svg>
                Latest News
              </span>
              <Link to="/news" className="lp-card-link">View all →</Link>
            </div>
            <div className="lp-news-list">
              {news.length === 0 && (
                <div className="lp-empty-state">No news available right now.</div>
              )}
              {news.map((n, idx) => {
                const style = CAT_COLORS[n.category] || { bg: "#F3F4F6", color: "#374151", label: n.category };
                const ItemTag = n.isLive ? "a" : Link;
                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={{ x: 4 }}
                  >
                    <ItemTag
                      className="lp-news-item"
                      {...(n.isLive
                        ? { href: n.sourceUrl, target: "_blank", rel: "noopener noreferrer" }
                        : { to: `/news/${n._id}` })}
                    >
                      <span className="lp-news-cat" style={{ background: style.bg, color: style.color }}>
                        {style.label || n.category}
                      </span>
                      <div className="lp-news-title">{n.title}</div>
                      <div className="lp-news-date">{formatDate(n.createdAt)}</div>
                    </ItemTag>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Top Schemes ── */}
          <motion.div variants={fadeUp} className="lp-card">
            <div className="lp-card-head">
              <span className="lp-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Top Schemes
              </span>
              <Link to="/schemes" className="lp-card-link">View all →</Link>
            </div>
            <div className="lp-scheme-list">
              {schemesLoading && (
                <div className="lp-schemes-skeleton">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="lp-scheme-skel-row">
                      <div className="lp-skel lp-skel--circle-sm" />
                      <div className="lp-skel-lines">
                        <div className="lp-skel lp-skel--wide" />
                        <div className="lp-skel lp-skel--narrow" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!schemesLoading && schemes.length === 0 && (
                <div className="lp-empty-state">No schemes available right now.</div>
              )}
              {schemes.map((s, idx) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ x: 4 }}
                >
                  <Link to="/schemes" className="lp-scheme-item">
                    <span className="lp-scheme-icon">{SCHEME_CATEGORY_ICON[s.category] || "📋"}</span>
                    <div className="lp-scheme-body">
                      <div className="lp-scheme-name">{s.title}</div>
                      <div className="lp-scheme-benefit">{(s.benefits || "").split(",")[0]}</div>
                    </div>
                    <motion.svg
                      className="lp-scheme-arrow"
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </motion.svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNERS
      ══════════════════════════════════════════════════════ */}
      <RevealSection className="lp-section lp-section--cta">
        <div className="lp-cta-row">
          <motion.div
            className="lp-cta lp-cta--green"
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <div className="lp-cta-bg-orb" />
            <div className="lp-cta-content">
              <div className="lp-cta-emoji">🌾</div>
              <div>
                <div className="lp-cta-title">Get personalised crop recommendations</div>
                <div className="lp-cta-sub">Answer a few questions and get the best crop suggestions for your land, soil and season.</div>
              </div>
            </div>
            <Link to="/recommendations/crop" className="lp-cta-btn lp-cta-btn--dark">
              <span>Get started</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            className="lp-cta lp-cta--light"
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <div className="lp-cta-content">
              <div className="lp-cta-emoji">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  style={{ display: "block" }}
                >
                  📍
                </motion.span>
              </div>
              <div>
                <div className="lp-cta-title">Find nearby agriculture shops</div>
                <div className="lp-cta-sub">Seeds, fertilizers, pesticides and equipment dealers near you on the map.</div>
              </div>
            </div>
            <Link to="/shops" className="lp-cta-btn lp-cta-btn--outline">
              <span>Find shops</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </RevealSection>

      <Footer />

      {/* ══════════════════════════════════════════════════════
          SCOPED CSS
      ══════════════════════════════════════════════════════ */}
      <style>{`
        /* ── Base ──────────────────────────────────────────────────── */
        .lp {
          display: flex; flex-direction: column; min-height: 100vh;
          background: linear-gradient(180deg, #EAF7FF 0%, #FFF8E6 42%, #F3F8EC 100%);
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }

        /* ── Hero ──────────────────────────────────────────────────── */
        .lp-hero {
          position: relative; overflow: hidden;
          background:
            linear-gradient(90deg, rgba(7,41,18,0.88) 0%, rgba(18,85,28,0.72) 50%, rgba(21,119,80,0.42) 100%),
            radial-gradient(circle at 82% 18%, rgba(255,205,83,0.95) 0 9%, rgba(255,173,46,0.28) 10% 22%, transparent 34%),
            linear-gradient(180deg, #74C7F2 0%, #BDEBFF 31%, #FFE19A 45%, #79B54A 46%, #236E2A 100%);
          padding: 64px clamp(24px, 6vw, 96px) 56px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
          gap: clamp(32px, 5vw, 72px);
          width: 100%; box-sizing: border-box;
        }

        /* Field grid texture overlay */
        .lp-hero::before {
          content: ""; position: absolute; inset: 44% -8% -24% -8%;
          background:
            repeating-linear-gradient(104deg, rgba(255,255,255,0.14) 0 2px, transparent 2px 58px),
            repeating-linear-gradient(76deg, rgba(8,69,22,0.22) 0 3px, transparent 3px 70px);
          transform: perspective(520px) rotateX(58deg);
          transform-origin: top; opacity: 0.85; pointer-events: none;
        }
        .lp-hero > * { position: relative; z-index: 1; }

        /* Orbs */
        .lp-hero-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          filter: blur(80px); opacity: 0.25; animation: lp-orb-drift 12s ease-in-out infinite alternate;
        }
        .lp-hero-orb--1 { width: 500px; height: 500px; background: #FFD700; top: -120px; right: -80px; animation-delay: 0s; }
        .lp-hero-orb--2 { width: 300px; height: 300px; background: #4CAF50; bottom: 40px; left: 20%; animation-delay: -4s; }
        .lp-hero-orb--3 { width: 200px; height: 200px; background: #0EA5E9; top: 30%; left: -60px; animation-delay: -8s; }
        @keyframes lp-orb-drift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(20px,15px) scale(1.08); } }

        /* Particles */
        .lp-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .lp-particle {
          position: absolute;
          width: calc(2px + (var(--i, 0) % 3) * 1px);
          height: calc(2px + (var(--i, 0) % 3) * 1px);
          background: rgba(255,255,255,0.5);
          border-radius: 50%;
          left: calc((var(--i, 0) * 5.7% + 3%));
          top: calc((var(--i, 0) * 4.9% + 5%));
          animation: lp-float-up 8s ease-in-out infinite;
          animation-delay: calc(var(--i, 0) * -0.45s);
          opacity: 0;
        }
        @keyframes lp-float-up {
          0%   { transform: translateY(0)   scale(1);   opacity: 0;    }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.3; }
          100% { transform: translateY(-60px) scale(0.6); opacity: 0; }
        }

        /* Hero content */
        .lp-hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,248,220,0.16); border: 1px solid rgba(255,226,139,0.45);
          border-radius: 100px; padding: 5px 14px;
          font-size: 12px; color: #FFE7A3; letter-spacing: 0.07em;
          text-transform: uppercase; margin-bottom: 20px; width: fit-content;
          backdrop-filter: blur(8px);
        }
        .lp-hero-tag-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76,175,80,0.25);
          animation: lp-pulse 2s ease-in-out infinite;
        }
        @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.9)} }

        .lp-hero-h1 {
          font-size: clamp(36px, 5vw, 54px); font-weight: 700; color: #fff;
          line-height: 1.15; margin: 0 0 20px;
          letter-spacing: -0.02em;
        }
        .lp-hero-h1-accent {
          background: linear-gradient(135deg, #FFE082, #FFAB40);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero-p {
          font-size: 17px; color: rgba(255,255,255,0.85); line-height: 1.8;
          margin: 0 0 32px; max-width: 560px; font-weight: 400;
        }

        /* Buttons */
        .lp-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; border-radius: 10px; font-size: 15px; font-weight: 600;
          background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff;
          text-decoration: none; box-shadow: 0 12px 28px rgba(239,68,68,0.3);
          transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
          position: relative; overflow: hidden;
        }
        .lp-btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0.12); opacity: 0;
          transition: opacity 0.2s;
        }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 36px rgba(239,68,68,0.35); filter: brightness(1.06); }
        .lp-btn-primary:hover::after { opacity: 1; }
        .lp-btn-primary:active { transform: translateY(0) scale(0.98); }

        .lp-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 10px; font-size: 15px; font-weight: 600;
          background: rgba(255,255,255,0.1); color: #fff;
          border: 1.5px solid rgba(255,235,167,0.55); text-decoration: none;
          backdrop-filter: blur(8px);
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .lp-btn-outline:hover { background: rgba(255,214,102,0.2); border-color: rgba(255,226,139,0.8); transform: translateY(-1px); }

        /* Stats row */
        .lp-stats {
          display: flex; gap: 0; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 24px;
        }
        .lp-stat { flex: 1; }
        .lp-stat + .lp-stat { border-left: 1px solid rgba(255,255,255,0.15); padding-left: 20px; }
        .lp-stat-val   { font-size: 26px; font-weight: 700; color: #FFE082; letter-spacing: -0.01em; }
        .lp-stat-label { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 3px; font-weight: 400; }

        /* Weather widget */
        .lp-weather {
          align-self: start;
          animation: lp-float 5s ease-in-out infinite;
        }
        @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .lp-weather-inner {
          background: rgba(9,68,76,0.45); border: 1px solid rgba(179,229,252,0.35);
          border-radius: 16px; padding: 20px 22px; color: #fff;
          box-shadow: 0 24px 60px rgba(10,45,30,0.28), inset 0 1px 0 rgba(255,255,255,0.12);
          backdrop-filter: blur(16px);
        }
        .lp-weather-location {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #B3E5FC; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px;
        }
        .lp-weather-main { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .lp-weather-icon { font-size: 44px; display: block; }
        .lp-weather-temp { font-size: 40px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
        .lp-weather-desc { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 4px; text-transform: capitalize; }
        .lp-weather-meta { display: flex; gap: 12px; font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 6px; }
        .lp-weather-link {
          display: flex; align-items: center; justify-content: flex-end; gap: 5px;
          font-size: 12px; color: #FFE082; text-decoration: none; margin-top: 12px;
          font-weight: 500; transition: gap 0.2s;
        }
        .lp-weather-link:hover { gap: 8px; text-decoration: underline; }
        .lp-weather-unavail { text-align: center; padding: 20px 0; color: rgba(255,255,255,0.5); font-size: 13px; }

        /* Weather skeleton */
        .lp-weather-skeleton { display: flex; align-items: center; gap: 14px; padding: 8px 0; }
        .lp-skel {
          border-radius: 6px; background: rgba(255,255,255,0.12);
          animation: lp-shimmer 1.6s ease-in-out infinite;
        }
        @keyframes lp-shimmer {
          0%,100% { opacity: 0.5; } 50% { opacity: 1; }
        }
        .lp-skel--circle  { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; }
        .lp-skel--circle-sm { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
        .lp-skel-lines    { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .lp-skel--wide    { height: 20px; width: 100%; }
        .lp-skel--narrow  { height: 14px; width: 65%; }
        .lp-skel--text    { height: 14px; width: 80%; }
        .lp-skel--short   { width: 50% !important; }
        .lp-skel--price   { width: 60% !important; }

        /* ── Sections layout ──────────────────────────────────────── */
        .lp-section {
          width: 100%; padding: 28px clamp(24px, 6vw, 96px); box-sizing: border-box;
        }
        .lp-section--quicklinks { padding-top: 20px; }
        .lp-section--how        { background: rgba(255,255,255,0.5); }
        .lp-section--stats-wrap { padding-top: 40px; padding-bottom: 40px; }
        .lp-section--cta        { padding-top: 12px; }

        /* ── Quick Links Grid ─────────────────────────────────────── */
        .lp-quick-grid {
          display: grid; grid-template-columns: repeat(6,1fr); gap: 10px;
          background: rgba(255,255,255,0.78); border: 1px solid #D8E8C8;
          border-radius: 16px; padding: 18px;
          box-shadow: 0 20px 48px rgba(45,92,30,0.07);
        }
        .lp-quick-card {
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px;
          min-height: 130px; padding: 20px 10px; border-radius: 10px;
          text-decoration: none; border: 1.5px solid var(--card-border, #E0EAD8);
          background: var(--card-bg, #F8FBF6);
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
          position: relative; overflow: hidden;
        }
        .lp-quick-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at center, var(--card-accent, #16A34A) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.3s;
        }
        .lp-quick-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 36px rgba(0,0,0,0.1);
          border-color: var(--card-accent, #F59E0B);
        }
        .lp-quick-card:hover::before { opacity: 0.06; }
        .lp-quick-icon  { font-size: 24px; position: relative; }
        .lp-quick-label { font-size: 13px; font-weight: 600; color: #0A2E0C; position: relative; }
        .lp-quick-sub   { font-size: 11px; color: #7A8F76; text-align: center; position: relative; }
        .lp-quick-arrow {
          font-size: 12px; color: var(--card-accent, #16A34A);
          opacity: 0; transform: translateX(-4px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .lp-quick-card:hover .lp-quick-arrow { opacity: 1; transform: translateX(0); }

        /* ── Platform Stats ───────────────────────────────────────── */
        .lp-platform-stats {
          background: linear-gradient(135deg, #0A2E0C, #1B5E20);
          border-radius: 20px; padding: 48px 40px;
          box-shadow: 0 32px 80px rgba(10,46,12,0.22);
          position: relative; overflow: hidden;
        }
        .lp-platform-stats::before {
          content: ''; position: absolute; inset: 0;
          background: repeating-linear-gradient(
            45deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 40px
          );
        }
        .lp-stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 24px;
          position: relative;
        }
        .lp-pstat {
          text-align: center; padding: 24px 16px;
          border-radius: 12px; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          transition: background 0.2s, transform 0.2s;
        }
        .lp-pstat:hover { background: rgba(255,255,255,0.10); transform: translateY(-3px); }
        .lp-pstat-icon  { font-size: 32px; margin-bottom: 12px; display: block; }
        .lp-pstat-value { font-size: 38px; font-weight: 700; color: #FFE082; letter-spacing: -0.02em; line-height: 1; }
        .lp-pstat-label { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 8px; font-weight: 400; }

        /* ── How It Works ─────────────────────────────────────────── */
        .lp-section--how { padding-top: 52px; padding-bottom: 52px; }
        .lp-how-header { text-align: center; margin-bottom: 44px; }
        .lp-section-eyebrow {
          display: inline-block; font-size: 12px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: #16A34A;
          background: #DCFCE7; border: 1px solid #BBF7D0;
          border-radius: 100px; padding: 4px 14px; margin-bottom: 12px;
        }
        .lp-section-h2  { font-size: clamp(24px, 3.5vw, 34px); font-weight: 700; color: #0A2E0C; margin-bottom: 10px; letter-spacing: -0.02em; }
        .lp-section-sub { font-size: 16px; color: #6B7280; font-weight: 400; }

        .lp-how-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; position: relative; }
        .lp-how-card {
          background: rgba(255,255,255,0.85); border: 1px solid #E0EAD8;
          border-radius: 16px; padding: 32px 28px; position: relative;
          box-shadow: 0 4px 24px rgba(50,84,35,0.06);
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }
        .lp-how-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px rgba(50,84,35,0.12);
          border-color: #A7F3D0;
        }
        .lp-how-step {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          color: #16A34A; text-transform: uppercase; margin-bottom: 16px;
        }
        .lp-how-icon  { font-size: 40px; display: block; margin-bottom: 16px; }
        .lp-how-title { font-size: 18px; font-weight: 700; color: #0A2E0C; margin-bottom: 10px; letter-spacing: -0.01em; }
        .lp-how-desc  { font-size: 14px; color: #6B7280; line-height: 1.7; }
        .lp-how-connector {
          position: absolute; right: -18px; top: 50%;
          transform: translateY(-50%); font-size: 22px; color: #D1FAE5; z-index: 2;
        }

        /* ── 3-col data row ───────────────────────────────────────── */
        .lp-three-col { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }

        .lp-card {
          background: rgba(255,255,255,0.92); border: 1px solid #DCE6CF;
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(50,84,35,0.07);
          transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
        }
        .lp-card:hover {
          box-shadow: 0 16px 48px rgba(50,84,35,0.12);
          transform: translateY(-2px); border-color: #BDE8A0;
        }
        .lp-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid #E0EAD8;
          background: linear-gradient(90deg, rgba(224,242,254,0.7), rgba(255,247,214,0.6));
        }
        .lp-card-title {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 700; color: #0A2E0C;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .lp-card-link {
          font-size: 12px; color: #1B5E20; text-decoration: none; font-weight: 500;
          transition: color 0.15s;
        }
        .lp-card-link:hover { color: #059669; text-decoration: underline; }

        /* Live badge */
        .lp-live-row {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 16px; border-bottom: 1px solid #F0F5EE;
          background: #F7FEE7;
        }
        .lp-live-badge {
          display: flex; align-items: center; gap: 5px;
          background: #DCFCE7; border: 1px solid #86EFAC;
          border-radius: 100px; padding: 2px 8px;
        }
        .lp-dot { width: 6px; height: 6px; background: #22C55E; border-radius: 50%; display: block; }
        .lp-live-text { font-size: 10px; font-weight: 700; color: #15803D; letter-spacing: 0.08em; }
        .lp-live-updated { font-size: 12px; color: #6B7280; }

        /* Table */
        .lp-table { width: 100%; border-collapse: collapse; }
        .lp-table th {
          font-size: 11px; font-weight: 600; color: #9AAF94; letter-spacing: 0.05em;
          text-align: left; padding: 8px 16px; text-transform: uppercase;
          background: #F8FBF6; border-bottom: 1px solid #E0EAD8;
        }
        .lp-table td { padding: 10px 16px; border-bottom: 1px solid #F4F7F2; }
        .lp-table tr:last-child td { border-bottom: none; }
        .lp-table-row { transition: background 0.15s; cursor: default; }
        .lp-table-row:hover { background: #F7FEF4; }
        .lp-td-bold  { font-size: 14px; font-weight: 600; color: #0A2E0C; }
        .lp-td-muted { font-size: 13px; color: #7A8F76; }
        .lp-td-sm    { font-size: 12px; }
        .lp-td-green { color: #15803D; font-weight: 700; }
        .lp-empty-cell { padding: 18px 16px; font-size: 13px; color: #7A8F76; }

        /* Table skeleton */
        .lp-table-skeleton { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
        .lp-table-skel-row { display: flex; gap: 12px; align-items: center; }

        /* News */
        .lp-news-list { display: flex; flex-direction: column; }
        .lp-news-item {
          padding: 12px 16px; border-bottom: 1px solid #F4F7F2;
          text-decoration: none; display: flex; flex-direction: column; gap: 5px;
          transition: background 0.15s;
        }
        .lp-news-item:last-child { border-bottom: none; }
        .lp-news-item:hover { background: #F8FBF6; }
        .lp-news-cat   { display: inline-flex; align-items: center; padding: 2px 9px; border-radius: 100px; font-size: 11px; font-weight: 600; align-self: flex-start; }
        .lp-news-title { font-size: 14px; font-weight: 600; color: #0A2E0C; line-height: 1.45; }
        .lp-news-date  { font-size: 12px; color: #9AAF94; }

        /* Schemes */
        .lp-scheme-list { display: flex; flex-direction: column; }
        .lp-scheme-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; border-bottom: 1px solid #F4F7F2;
          text-decoration: none; transition: background 0.15s;
        }
        .lp-scheme-item:last-child { border-bottom: none; }
        .lp-scheme-item:hover { background: #F8FBF6; }
        .lp-scheme-icon   { font-size: 22px; flex-shrink: 0; }
        .lp-scheme-body   { flex: 1; min-width: 0; }
        .lp-scheme-name   { font-size: 13px; font-weight: 600; color: #0A2E0C; line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lp-scheme-benefit { font-size: 12px; color: #7A8F76; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lp-scheme-arrow  { color: #C5D9C0; flex-shrink: 0; }

        /* Schemes skeleton */
        .lp-schemes-skeleton { padding: 12px 16px; display: flex; flex-direction: column; gap: 14px; }
        .lp-scheme-skel-row { display: flex; gap: 12px; align-items: center; }

        /* Empty states */
        .lp-empty-state { padding: 20px 16px; font-size: 13px; color: #7A8F76; }

        /* ── CTA Banners ──────────────────────────────────────────── */
        .lp-cta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .lp-cta {
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; padding: 28px 32px; border-radius: 16px;
          position: relative; overflow: hidden;
        }
        .lp-cta--green {
          background: linear-gradient(135deg, #065F46, #0EA5E9, #16A34A);
          background-size: 200% 200%; animation: lp-gradient-shift 6s ease infinite;
        }
        @keyframes lp-gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .lp-cta-bg-orb {
          position: absolute; width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.07); right: 100px; top: -60px;
          pointer-events: none;
        }
        .lp-cta--light { background: linear-gradient(135deg, #FFF7D6, #FFE4E6); border: 1px solid #FED7AA; }
        .lp-cta-content { display: flex; align-items: center; gap: 16px; flex: 1; position: relative; }
        .lp-cta-emoji   { font-size: 36px; flex-shrink: 0; }
        .lp-cta-title   { font-size: 17px; font-weight: 700; margin-bottom: 5px; letter-spacing: -0.01em; }
        .lp-cta--green .lp-cta-title { color: #fff; }
        .lp-cta--light .lp-cta-title { color: #0A2E0C; }
        .lp-cta-sub { font-size: 13px; line-height: 1.6; }
        .lp-cta--green .lp-cta-sub { color: rgba(255,255,255,0.72); }
        .lp-cta--light .lp-cta-sub { color: #7A8F76; }

        .lp-cta-btn {
          display: inline-flex; align-items: center; gap: 7px;
          white-space: nowrap; padding: 11px 22px; border-radius: 10px;
          font-size: 14px; font-weight: 600; text-decoration: none; flex-shrink: 0;
          transition: transform 0.2s, box-shadow 0.2s, gap 0.2s;
          position: relative;
        }
        .lp-cta-btn:hover { transform: translateY(-1px); gap: 10px; }
        .lp-cta-btn--dark {
          background: #F59E0B; color: #fff;
          box-shadow: 0 8px 20px rgba(245,158,11,0.32);
        }
        .lp-cta-btn--dark:hover { background: #D97706; box-shadow: 0 14px 28px rgba(245,158,11,0.4); }
        .lp-cta-btn--outline {
          background: #fff; color: #B45309; border: 1.5px solid #FED7AA;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .lp-cta-btn--outline:hover { background: #FFFBEB; box-shadow: 0 10px 24px rgba(0,0,0,0.1); }

        /* ── Responsive ───────────────────────────────────────────── */
        @media (max-width: 1100px) {
          .lp-hero       { grid-template-columns: 1fr; }
          .lp-weather    { display: none; }
          .lp-three-col  { grid-template-columns: 1fr; }
          .lp-quick-grid { grid-template-columns: repeat(3,1fr); }
          .lp-cta-row    { grid-template-columns: 1fr; }
          .lp-stats-grid { grid-template-columns: repeat(2,1fr); }
          .lp-how-grid   { grid-template-columns: 1fr; }
          .lp-how-connector { display: none; }
        }
        @media (max-width: 640px) {
          .lp-hero-h1    { font-size: 32px; }
          .lp-hero       { padding: 44px 18px 36px; }
          .lp-section    { padding: 20px 18px; }
          .lp-quick-grid { grid-template-columns: repeat(2,1fr); }
          .lp-stats      { flex-wrap: wrap; }
          .lp-platform-stats { padding: 32px 20px; }
          .lp-stats-grid { grid-template-columns: repeat(2,1fr); }
          .lp-cta        { flex-direction: column; align-items: flex-start; }
          .lp-cta-btn    { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}