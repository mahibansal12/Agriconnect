// src/pages/Landing.jsx   Premium UI Enhancements
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { formatPrice, formatDate } from "../utils/formatters";
import axiosInstance from "../utils/axiosInstance";

//  Constants

const SCHEME_CATEGORY_ICON = {
  subsidy: "💰",
  loan: "🏦",
  insurance: "🛡️",
  training: "📚",
  other: "📋",
};

const CAT_COLORS = {
  government: { bg: "#dbeafe", color: "#1d4ed8", label: "Government" },
  market: { bg: "#fef3c7", color: "#92400e", label: "Market" },
  weather: { bg: "#e0f2fe", color: "#0c4a6e", label: "Weather" },
  technology: { bg: "#ede9fe", color: "#4c1d95", label: "Technology" },
  general: { bg: "#d1fae5", color: "#064e3b", label: "General" },
};

const POST_CAT_STYLE = {
  general: { bg: "#fee2e2", color: "#b91c1c", label: "General", icon: "💬" },
  "crop-tips": { bg: "#dcfce7", color: "#15803d", label: "Crop Tips", icon: "🌱" },
  weather: { bg: "#e0f2fe", color: "#0c4a6e", label: "Weather", icon: "🌦️" },
  market: { bg: "#fef3c7", color: "#92400e", label: "Market", icon: "📊" },
  "pest-control": { bg: "#ede9fe", color: "#5b21b6", label: "Pest Control", icon: "🐛" },
};

const QUICK_LINK_IMG = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80";

// All features of the platform
const ALL_FEATURES = [
  { to: "/marketplace", icon: "🛒", label: "Marketplace", sub: "Buy & sell crops directly to buyers across India", photo: "/marketplace_photo.png", color: "#0EA5E9", grad: "linear-gradient(135deg, #0EA5E9, #0284C7)", tag: "Trade" },
  { to: "/mandi", icon: "📊", label: "Mandi Rates", sub: "Live commodity price updates from mandis", photo: "/mandi_photo.png", color: "#D97706", grad: "linear-gradient(135deg, #F59E0B, #D97706)", tag: "Live" },
  { to: "/recommendations/crop", icon: "🌱", label: "Crop Advisor", sub: "Personalised crop suggestions for you", photo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80", color: "#059669", grad: "linear-gradient(135deg, #10B981, #059669)", tag: "Advisor" },
  { to: "/schemes", icon: "📋", label: "Govt Schemes", sub: "Explore subsidies, loans, insurance & training", photo: "/schemes_photo.png", color: "#7C3AED", grad: "linear-gradient(135deg, #8B5CF6, #7C3AED)", tag: "Benefits" },
  { to: "/news", icon: "📰", label: "Agri News", sub: "Latest agriculture news, policies & market trends", photo: "/news_photo.png", color: "#DC2626", grad: "linear-gradient(135deg, #EF4444, #DC2626)", tag: "Breaking" },
  { to: "/community", icon: "👥", label: "Community", sub: "Connect with farmers across India", photo: "/community_photo_1.jpg", color: "#0891B2", grad: "linear-gradient(135deg, #22D3EE, #0891B2)", tag: "Connect" },
  { to: "/shops", icon: "📍", label: "Shop Finder", sub: "Locate nearby seed, fertilizer & equipment dealers", photo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80", color: "#E11D48", grad: "linear-gradient(135deg, #F43F5E, #E11D48)", tag: "Nearby" },
  { to: "/donations", icon: "❤️", label: "Donations", sub: "Support fellow farmers and build a stronger community", photo: "/donation_photo_1.jpg", color: "#B45309", grad: "linear-gradient(135deg, #F59E0B, #B45309)", tag: "Community" },
  { to: "/ai-assistant", icon: "🤖", label: "AI Assistant", sub: "24/7 intelligent farming assistant", photo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80", color: "#6366F1", grad: "linear-gradient(135deg, #818CF8, #6366F1)", tag: "Smart" },
  { to: "/calendar", icon: "📅", label: "Crop Calendar", sub: "Track your sowing and harvesting timeline", photo: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=80", color: "#0284C7", grad: "linear-gradient(135deg, #38BDF8, #0284C7)", tag: "Planning" },
  { to: "/pest-library", icon: "🐛", label: "Pest Library", sub: "Identify crop pests instantly and get treatment guides", photo: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80", color: "#65A30D", grad: "linear-gradient(135deg, #84CC16, #65A30D)", tag: "Identify" },
  { to: "/crop-knowledge", icon: "📖", label: "Crop Knowledge", sub: "Deep-dive library of crop profiles and best practices", photo: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80", color: "#15803D", grad: "linear-gradient(135deg, #22C55E, #15803D)", tag: "Learn" },
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

//  Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// Carousel slide variants (Smoother)
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.98, filter: "blur(4px)" }),
  center: { x: 0, opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

//  Scroll Reveal Wrapper
function Reveal({ children, className = "", delay = 0, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

//  Auto-Carousel Hook
function useAutoCarousel(length, interval = 3500) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const timerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const go = (next) => {
    setDir(next > idx ? 1 : -1);
    setIdx((next + length) % length);
    setProgress(0);
  };

  useEffect(() => {
    if (length <= 1) return;
    const startTime = Date.now();
    let animFrame;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min((elapsed / interval) * 100, 100);
      setProgress(p);
      if (p < 100) {
        animFrame = requestAnimationFrame(tick);
      }
    };
    animFrame = requestAnimationFrame(tick);

    timerRef.current = setInterval(() => {
      setDir(1);
      setIdx((i) => (i + 1) % length);
      setProgress(0);
    }, interval);

    return () => {
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrame);
    };
  }, [length, interval, idx]);

  return { idx, dir, go, progress };
}

//  Animated SVG Spark Graph
function SparkGraph({ color = "#16A34A" }) {
  const pts = [30, 55, 40, 70, 45, 85, 60, 50, 80, 65, 95, 40, 120, 58, 145, 35, 165, 52, 190, 30, 215, 48, 240, 25, 265, 44, 290, 20];
  const pathD = pts.reduce((acc, v, i) => (i % 2 === 0 ? `${acc}${i === 0 ? "M" : " L"}${v},` : `${acc}${100 - v * 0.65}`), "");
  return (
    <svg viewBox="0 0 300 80" fill="none" style={{ width: "100%", maxWidth: 340, overflow: "visible" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <motion.path
        d={pathD + " L290,80 L30,80 Z"}
        fill="url(#sg)"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "bottom" }}
      />
      <motion.path
        d={pathD}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{ filter: `drop-shadow(0px 4px 6px ${color}40)` }}
      />
    </svg>
  );
}

//  Animated Connecting Line (How it works)
function AnimatedDashedLine() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="lp-how-connector-wrap">
      <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <motion.path
          d="M 0 20 Q 200 -20 400 20"
          fill="none"
          stroke="#A7F3D0"
          strokeWidth="3"
          strokeDasharray="8 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
        />
        {/* Animated dot traveling along the path */}
        <motion.circle
          r="4"
          fill="#10B981"
          initial={{ offsetDistance: "0%", opacity: 0 }}
          animate={isInView ? { offsetDistance: "100%", opacity: [0, 1, 1, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
          style={{ offsetPath: `path('M 0 20 Q 200 -20 400 20')` }}
        />
      </svg>
    </div>
  );
}

//  Main Component
export default function Landing() {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("Detecting location...");
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [mandiRates, setMandiRates] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [mandiLoading, setMandiLoading] = useState(true);
  const [schemesLoading, setSchemesLoading] = useState(true);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Community posts carousel
  const postsLen = communityPosts.length || 1;
  const { idx: postIdx, dir: postDir, go: goPost, progress: postProgress } = useAutoCarousel(postsLen, 5000);

  // Schemes carousel
  const schemeLen = schemes.length || 1;
  const { idx: schemeIdx, dir: schemeDir, go: goScheme, progress: schemeProgress } = useAutoCarousel(schemeLen, 5500);

  // Features parallax bg scroll
  const featRef = useRef(null);
  const { scrollYProgress: featScroll } = useScroll({ target: featRef, offset: ["start end", "end start"] });
  const featBgY = useTransform(featScroll, [0, 1], [-80, 80]);

  //  Data Fetching
  useEffect(() => {
    axiosInstance.get("/v1/mandi/rates", { params: { limit: 6, sortBy: "arrivalDate", order: "desc" } })
      .then(res => setMandiRates(res.data?.data?.rates || []))
      .catch(() => setMandiRates([]))
      .finally(() => setMandiLoading(false));
  }, []);

  useEffect(() => {
    axiosInstance.get("/v1/community/posts")
      .then(res => {
        const posts = Array.isArray(res.data?.data) ? res.data.data : [];
        setCommunityPosts([...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6));
      })
      .catch(() => setCommunityPosts([]));
  }, []);

  useEffect(() => {
    axiosInstance.get("/v1/schemes")
      .then(res => setSchemes((res.data.data || []).slice(0, 6)))
      .catch(() => setSchemes([]))
      .finally(() => setSchemesLoading(false));
  }, []);

  useEffect(() => {
    const getWeatherByCoords = async (lat, lon) => {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=7ea1a387eddc4306145926f9a6eec184&units=metric`);
        const data = await res.json();
        if (data.cod !== 200) throw new Error("error");
        setWeather({
          city: data.name, country: data.sys.country,
          temperature: data.main.temp, feelsLike: data.main.feels_like,
          humidity: data.main.humidity, description: data.weather[0].description,
          windSpeed: data.wind.speed,
        });
        setLocationName(`${data.name}, ${data.sys.country}`);
      } catch { } finally { setWeatherLoading(false); }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => getWeatherByCoords(p.coords.latitude, p.coords.longitude),
        async () => {
          try {
            const d = await (await fetch("https://ipapi.co/json/")).json();
            await getWeatherByCoords(d.latitude, d.longitude);
          } catch { setWeatherLoading(false); }
        }
      );
    } else { setWeatherLoading(false); }
  }, []);

  const weatherIcon = (desc = "") => {
    const d = desc.toLowerCase();
    if (d.includes("clear") || d.includes("sunny")) return "☀️";
    if (d.includes("cloud")) return "⛅";
    if (d.includes("rain") || d.includes("drizzle")) return "🌧️";
    if (d.includes("storm") || d.includes("thunder")) return "⛈️";
    if (d.includes("snow")) return "❄️";
    if (d.includes("mist") || d.includes("haze") || d.includes("fog")) return "🌫️";
    return "🌤️";
  };

  const currentPost = communityPosts[postIdx];
  const currentScheme = schemes[schemeIdx];
  const currentPostStyle = currentPost ? (POST_CAT_STYLE[currentPost.category] || { bg: "#f3f4f6", color: "#374151", label: currentPost?.category, icon: "💬" }) : null;
  const postAuthorName = currentPost?.author?.name || "Farmer";
  const postAuthorInitial = postAuthorName.trim().charAt(0).toUpperCase();

  //  Hover Spotlight Effect Logic
  const handleMouseMove = (e) => {
    const cards = document.querySelectorAll('.lp-spotlight-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  //  Render
  return (
    <div className="lp">
      <Navbar />

      {/* Hero */}
      <section className="lp-hero" ref={heroRef}>
        <motion.div className="lp-hero-bg-img" style={{ y: heroY, opacity: heroOpacity }}>
          <img src="/hero_farm_bg.png" alt="farm landscape" />
          <div className="lp-hero-bg-overlay" />
        </motion.div>



        {/* Hero Content */}
        <motion.div
          className="lp-hero-content"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="lp-hero-tag lp-glass">
            <span className="lp-hero-tag-dot" />
            <span>🌾</span>
            <span>India's Smartest Farming Platform</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="lp-hero-h1">
            Empowering Every<br />
            <span className="lp-hero-h1-accent">Farmer in India</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="lp-hero-p">
            From live mandi prices and government schemes to AI crop advice and a
            nationwide marketplace — AgriConnect puts the power of modern agriculture
            right in your hands.
          </motion.p>

          <motion.div variants={fadeUp} className="lp-hero-btns">
            <Link to="/register" className="lp-btn-primary lp-btn-glow">
              <span>Start for free</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/marketplace" className="lp-btn-outline lp-glass-hover">
              <span>Browse marketplace</span>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="lp-stats">
            {[
              ["12+", "Features"],
              ["Live", "Mandi Rates"],
              ["Free", "Govt Schemes"],
              ["24/7", "AI Help"],
            ].map(([val, label]) => (
              <div key={label} className="lp-stat">
                <div className="lp-stat-val">{val}</div>
                <div className="lp-stat-label">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Weather & Market Alerts */}
        <div className="lp-hero-right">
          <motion.div
            className="lp-weather lp-glass-panel"
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.6, duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <div className="lp-weather-inner">
              <div className="lp-weather-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {locationName}
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
                    <motion.span className="lp-weather-icon"
                      animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                      {weatherIcon(weather.description)}
                    </motion.span>
                    <div>
                      <div className="lp-weather-temp">{Math.round(weather.temperature)}°C</div>
                      <div className="lp-weather-desc">{weather.description}</div>
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
                Full forecast <span className="lp-arrow-icon">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Floating Market Alert */}
          <motion.div
            className="lp-hero-alert lp-glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6, type: "spring" }}
          >
            <div className="lp-alert-icon">📈</div>
            <div className="lp-alert-content">
              <div className="lp-alert-title">Wheat Price Up</div>
              <div className="lp-alert-sub">+2.4% across major mandis today</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links Strip (spotlight Glow Cards) */}
      <section className="lp-section lp-section--quicklinks">
        <motion.div
          className="lp-quick-grid"
          variants={staggerFast}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {ALL_FEATURES.slice(0, 6).map((l) => (
            <motion.div key={l.to} variants={scaleIn}>
              <Link to={l.to} className="lp-quick-card lp-spotlight-card" style={{ "--card-color": l.color, "--card-grad": l.grad }}>
                <div className="lp-spotlight-border"></div>
                <div className="lp-quick-img-wrap">
                  <img
                    src={l.photo}
                    alt={l.label}
                    className="lp-quick-img"
                    loading="lazy"
                  />
                  <div className="lp-quick-img-overlay" style={{ background: l.grad + "D9" }} />
                  <span className="lp-quick-tag">{l.tag}</span>
                </div>
                <div className="lp-spotlight-content">
                  <motion.span className="lp-quick-icon"
                    whileHover={{ scale: 1.25, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    {l.icon}
                  </motion.span>
                  <span className="lp-quick-label">{l.label}</span>
                  <span className="lp-quick-sub">{l.sub.split(" ").slice(0, 5).join(" ")}…</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* News Section */}


      <section className="lp-section lp-split-section lp-split-section--marketplace">
        <Reveal className="lp-split-info" delay={0}>
          <div className="lp-section-eyebrow lp-section-eyebrow--blue">🛒 Direct Trade</div>
          <h2 className="lp-section-h2">Sell Your Crops<br /><span className="lp-h2-accent-blue">Directly to Buyers</span></h2>
          <p className="lp-section-desc">
            List your harvest in minutes and connect with verified buyers across India. No
            middlemen, no hidden charges. Negotiate directly and get better prices.
          </p>
          <div className="lp-marketplace-features">
            {[
              { icon: "🤝", t: "Direct Buyers", s: "Connect with genuine buyers" },
              { icon: "💬", t: "Direct Chat", s: "Negotiate price directly" },
              { icon: "🚀", t: "Quick Crop Listing", s: "List your harvest in 2 mins" },
            ].map((f, i) => (
              <motion.div key={f.t} className="lp-mp-feat" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.2 }}>
                <span className="lp-mp-feat-icon">{f.icon}</span>
                <div>
                  <div className="lp-mp-feat-title">{f.t}</div>
                  <div className="lp-mp-feat-sub">{f.s}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <Link to="/marketplace" className="lp-split-cta lp-split-cta--blue">
            Open marketplace
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>

        <Reveal className="lp-split-photo-side" delay={0.15}>
          <div className="lp-split-photo-wrap lp-split-photo-wrap--marketplace">
            <motion.img
              src="/marketplace_photo.png"
              alt="Farmer selling crops online"
              className="lp-split-photo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <div className="lp-split-photo-overlay" />



            <motion.div className="lp-floating-glass-card lp-floating-glass-card--br" animate={{ y: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✅</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0A2E0C' }}>Order #4092</div>
                  <div style={{ fontSize: 11, color: '#0284C7', fontWeight: 600 }}>Payment Secured</div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="lp-split-stat-row">
            {[
              { val: "All", label: "Crop Types" },
              { val: "Fast", label: "Settlement" },
              { val: "Direct", label: "Contact" },
            ].map(s => (
              <motion.div key={s.label} className="lp-split-stat lp-split-stat--blue" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                <div className="lp-split-stat-val">{s.val}</div>
                <div className="lp-split-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>

        </Reveal>
      </section>









      {/* Final Cta Strip */}

      <section className="lp-section lp-split-section lp-split-section--mandi">
        {/* Left — info + graph + rate preview */}
        <Reveal className="lp-split-info" delay={0}>
          <div className="lp-mandi-live-row">
            <motion.span
              className="lp-live-dot"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.3 }}
            />
            <span className="lp-live-text">LIVE PRICES</span>
          </div>
          <div className="lp-section-eyebrow lp-section-eyebrow--amber">📊 Market Intelligence</div>
          <h2 className="lp-section-h2">Live Mandi Rates<br /><span className="lp-h2-accent-amber">&amp; Commodity Prices</span></h2>
          <p className="lp-section-desc">
            Real-time commodity prices from hundreds of mandis across every state of India.
            Check wheat, rice, cotton, vegetables and more — updated every hour.
          </p>

          {/* Animated graph preview */}
          <div className="lp-mandi-graph-box">
            <div className="lp-mandi-graph-header">
              <div className="lp-mandi-graph-label">Price Trend (Modal Price)</div>
              <div className="lp-mandi-graph-trend lp-trend-up">↑ 2.4%</div>
            </div>
            <SparkGraph color="#D97706" />
            <div className="lp-mandi-graph-axis">
              <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span>
            </div>
          </div>

          {/* Rate preview chips */}
          <div className="lp-mandi-rate-chips">
            {mandiLoading ? (
              [1, 2, 3].map(i => <div key={i} className="lp-rate-chip-skel" />)
            ) : (
              mandiRates.slice(0, 3).map(r => (
                <motion.div key={r._id} className="lp-rate-chip" whileHover={{ y: -3, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}>
                  <span className="lp-rate-chip-name">{r.commodityName}</span>
                  <span className="lp-rate-chip-price">{formatPrice(r.modalPrice)}</span>
                </motion.div>
              ))
            )}
          </div>

          <Link to="/mandi" className="lp-split-cta lp-split-cta--amber">
            See full price board
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>

        {/* Right — photo + stats */}
        <Reveal className="lp-split-photo-side" delay={0.15}>
          <div className="lp-split-photo-wrap lp-split-photo-wrap--mandi">
            <motion.img
              src="/mandi_photo.png"
              alt="Vibrant mandi market with live price boards"
              className="lp-split-photo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <div className="lp-split-photo-overlay" />

            <motion.div className="lp-floating-badge lp-floating-badge--tl" animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <span className="lp-badge-dot lp-badge-dot--green" />
              <span>Updated Hourly</span>
            </motion.div>

            {/* Floating Glass Chart Card */}
            <motion.div className="lp-floating-glass-card lp-floating-glass-card--br" animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>TOP GAINER</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0A2E0C', margin: '2px 0' }}>Wheat <span style={{ color: '#16A34A', fontSize: 14 }}>↑ 4%</span></div>
              <div style={{ width: 80, height: 2, background: '#16A34A', marginTop: 6, borderRadius: 2 }}></div>
            </motion.div>
          </div>
          <div className="lp-split-stat-row">
            {[
              { val: "Fresh", label: "Commodities" },
              { val: "Live", label: "Market Data" },
              { val: "Verified", label: "Mandis" },
            ].map(s => (
              <motion.div key={s.label} className="lp-split-stat lp-split-stat--amber" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                <div className="lp-split-stat-val">{s.val}</div>
                <div className="lp-split-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>

        </Reveal>
      </section>



      {/* Ai + Crop Advisor Split Highlight */}
      <section className="lp-section lp-split-section lp-split-section--community">
        {/* Left — info + animated carousel */}
        <Reveal className="lp-split-info" delay={0}>
          <div className="lp-section-eyebrow lp-section-eyebrow--red">👥 Farmer Community</div>
          <h2 className="lp-section-h2">Community Discussions<br /><span className="lp-h2-accent-red">&amp; Insights</span></h2>
          <p className="lp-section-desc">
            Connect with fellow farmers, share your experiences, and learn from the community. A dedicated space for Indian farmers to grow together.
          </p>

          {/* Animated community post card */}
          <div className="lp-carousel-box lp-carousel-box--news">
            {communityPosts.length === 0 ? (
              <div className="lp-carousel-empty">
                <div className="lp-carousel-skeleton" />
                <div className="lp-carousel-skeleton lp-carousel-skeleton--sm" />
                <div className="lp-carousel-skeleton lp-carousel-skeleton--xs" />
              </div>
            ) : (
              <AnimatePresence mode="wait" custom={postDir}>
                <motion.div
                  key={postIdx}
                  custom={postDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="lp-news-slide"
                >
                  <div className="lp-post-slide-author">
                    <div className="lp-post-slide-avatar">{postAuthorInitial}</div>
                    <div>
                      <div className="lp-post-slide-name">{postAuthorName}</div>
                      <div className="lp-post-slide-time">🕐 {timeAgo(currentPost?.createdAt)}</div>
                    </div>
                    <div className="lp-news-slide-cat lp-post-slide-cat"
                      style={{ background: currentPostStyle?.bg, color: currentPostStyle?.color }}>
                      {currentPostStyle?.icon} {currentPostStyle?.label || currentPost?.category}
                    </div>
                  </div>
                  <div className="lp-news-slide-title">{currentPost?.title}</div>
                  <div className="lp-news-slide-excerpt">
                    {(currentPost?.content || "").slice(0, 140)}…
                  </div>
                  <div className="lp-news-slide-meta">
                    <span className="lp-news-slide-date">❤️ {Array.isArray(currentPost?.likes) ? currentPost.likes.length : (currentPost?.likes || 0)} likes</span>
                    <Link
                      to={`/community/${currentPost?._id}`}
                      className="lp-news-slide-read">
                      View post <span className="lp-arrow-icon">→</span>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Progress Dots */}
            {communityPosts.length > 0 && (
              <div className="lp-carousel-dots">
                {communityPosts.map((_, i) => (
                  <button
                    key={i}
                    className={`lp-dot-btn ${i === postIdx ? "lp-dot-btn--active lp-dot-btn--red" : ""}`}
                    onClick={() => goPost(i)}
                    aria-label={`Post ${i + 1}`}
                  >
                    {i === postIdx && <div className="lp-dot-progress" style={{ width: `${postProgress}%`, background: "#DC2626" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/community" className="lp-split-cta lp-split-cta--red">
            Join community
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>

        {/* Right — photo + stats */}
        <Reveal className="lp-split-photo-side" delay={0.15}>
          <div className="lp-split-photo-wrap lp-split-photo-wrap--news">
            <motion.img
              src="/news_photo.png"
              alt="Farmer reading agriculture news"
              className="lp-split-photo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <div className="lp-split-photo-overlay" />

            {/* Floating UI Badges */}
            <motion.div className="lp-floating-badge lp-floating-badge--tl" animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <span className="lp-badge-dot lp-badge-dot--red" />
              <span>Live Updates</span>
            </motion.div>

            <motion.div className="lp-floating-glass-pill lp-floating-glass-pill--br" animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
              🌧️ Monsoon alerts active
            </motion.div>
          </div>
          <div className="lp-split-stat-row">
            {[
              { val: "Daily", label: "Discussions" },
              { val: "Active", label: "Farmers" },
              { val: "Free", label: "Access" },
            ].map(s => (
              <motion.div key={s.label} className="lp-split-stat lp-split-stat--red" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                <div className="lp-split-stat-val">{s.val}</div>
                <div className="lp-split-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>


        </Reveal>
      </section>

      {/* ️ Schemes Section */}
      <section className="lp-section lp-split-section lp-split-section--schemes lp-split-section--reverse">
        {/* Left — photo + stats */}
        <Reveal className="lp-split-photo-side" delay={0.15}>
          <div className="lp-split-photo-wrap lp-split-photo-wrap--schemes">
            <motion.img
              src="/schemes_photo.png"
              alt="Farmer receiving government scheme benefits"
              className="lp-split-photo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <div className="lp-split-photo-overlay" />

            {/* Floating UI Badges */}


            <motion.div className="lp-floating-glass-pill lp-floating-glass-pill--bl" animate={{ y: [0, 8, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
              💰 PM-Kisan Support
            </motion.div>
          </div>
          <div className="lp-split-stat-row">
            {[
              { val: "Top", label: "Featured Schemes" },
              { val: "₹Free", label: "To Apply" },
              { val: "All", label: "Farmers" },
            ].map(s => (
              <motion.div key={s.label} className="lp-split-stat lp-split-stat--purple" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                <div className="lp-split-stat-val">{s.val}</div>
                <div className="lp-split-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>


        </Reveal>

        {/* Right — info + animated carousel */}
        <Reveal className="lp-split-info" delay={0}>
          <div className="lp-section-eyebrow lp-section-eyebrow--purple">💰 Your Benefits Await</div>
          <h2 className="lp-section-h2">Government Schemes<br /><span className="lp-h2-accent-purple">&amp; Subsidies</span></h2>
          <p className="lp-section-desc">
            Access India's largest collection of farmer welfare programs — from PM-KISAN
            direct payments and crop insurance to Kisan Credit Cards and skill training.
            Find out what you're eligible for in seconds.
          </p>

          {/* Animated scheme card */}
          <div className="lp-carousel-box lp-carousel-box--schemes">
            {schemes.length === 0 ? (
              <div className="lp-carousel-empty">
                <div className="lp-carousel-skeleton" />
                <div className="lp-carousel-skeleton lp-carousel-skeleton--sm" />
              </div>
            ) : (
              <AnimatePresence mode="wait" custom={schemeDir}>
                <motion.div
                  key={schemeIdx}
                  custom={schemeDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="lp-scheme-slide"
                >
                  <div className="lp-scheme-slide-header">
                    <span className="lp-scheme-slide-icon">
                      {SCHEME_CATEGORY_ICON[currentScheme?.category] || "📋"}
                    </span>
                    <span className="lp-scheme-slide-cat">
                      {currentScheme?.category}
                    </span>
                  </div>
                  <div className="lp-scheme-slide-title">{currentScheme?.title}</div>
                  <div className="lp-scheme-slide-desc">
                    {(currentScheme?.description || "").slice(0, 130)}…
                  </div>
                  <div className="lp-scheme-slide-benefit">
                    <span className="lp-scheme-benefit-label">✅ Benefit:</span>
                    <span>{(currentScheme?.benefits || "").split(",")[0]}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            {schemes.length > 0 && (
              <div className="lp-carousel-dots">
                {schemes.map((_, i) => (
                  <button
                    key={i}
                    className={`lp-dot-btn ${i === schemeIdx ? "lp-dot-btn--active lp-dot-btn--purple" : ""}`}
                    onClick={() => goScheme(i)}
                    aria-label={`Scheme ${i + 1}`}
                  >
                    {i === schemeIdx && <div className="lp-dot-progress" style={{ width: `${schemeProgress}%`, background: "#7C3AED" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/schemes" className="lp-split-cta lp-split-cta--purple">
            Explore all schemes
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>
      </section>

      {/* Mandi Rates Section */}
      <section className="lp-section lp-split-section lp-split-section--knowledge">
        <Reveal className="lp-split-info" delay={0}>
          <div className="lp-section-eyebrow lp-section-eyebrow--green">📖 Knowledge Hub</div>
          <h2 className="lp-section-h2">Master Your Crops &<br /><span className="lp-h2-accent-green">Defeat Pests Instantly</span></h2>
          <p className="lp-section-desc">
            Access our deep-dive library of crop profiles, best practices, and a comprehensive pest identification guide. Everything you need to grow healthier yields and protect your harvest.
          </p>
          <div className="lp-marketplace-features">
            {[
              { icon: "🌱", t: "Crop Profiles", s: "A-Z guides for farming" },
              { icon: "🐛", t: "Pest Library", s: "Identify and treat diseases" },
              { icon: "🛡️", t: "Treatment Plans", s: "Organic & chemical solutions" },
              { icon: "📅", t: "Crop Calendar", s: "When to sow, harvest & spray" },
            ].map((f, i) => (
              <motion.div key={f.t} className="lp-mp-feat" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.2 }}>
                <span className="lp-mp-feat-icon">{f.icon}</span>
                <div>
                  <div className="lp-mp-feat-title">{f.t}</div>
                  <div className="lp-mp-feat-sub">{f.s}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="lp-hero-btns" style={{ marginTop: 32 }}>
            <Link to="/crop-knowledge" className="lp-split-cta lp-split-cta--green">
              Crop Knowledge
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/pests" className="lp-split-cta-outline">
              Pest Library
            </Link>
          </div>
        </Reveal>

        <Reveal className="lp-split-photo-side" delay={0.15}>
          <div className="lp-split-photo-wrap lp-split-photo-wrap--knowledge">
            <motion.img
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&q=80"
              alt="Farmer inspecting crops"
              className="lp-split-photo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <div className="lp-split-photo-overlay" />

            <motion.div className="lp-floating-badge lp-floating-badge--tl" animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
              <span className="lp-badge-dot lp-badge-dot--green" />
              <span>100+ Crop Guides</span>
            </motion.div>

            <motion.div className="lp-floating-glass-card lp-floating-glass-card--br" animate={{ y: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🐛</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#064e3b' }}>Fall Armyworm</div>
                  <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Treatment Found</div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="lp-split-stat-row">
            {[
              { val: "A-Z", label: "Crop Guides" },
              { val: "Fast", label: "Pest Solutions" },
              { val: "Free", label: "For Everyone" },
            ].map(s => (
              <motion.div key={s.label} className="lp-split-stat lp-split-stat--green" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                <div className="lp-split-stat-val">{s.val}</div>
                <div className="lp-split-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>

        </Reveal>
      </section>

      <section className="lp-section lp-split-section lp-split-section--ai lp-split-section--reverse">
        <Reveal className="lp-split-photo-side" delay={0.15}>
          <div className="lp-split-photo-wrap lp-split-photo-wrap--ai">
            <motion.img
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700&q=80"
              alt="AI assistant for farmers"
              className="lp-split-photo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <div className="lp-split-photo-overlay" />



            <motion.div className="lp-floating-glass-pill lp-floating-glass-pill--bl" animate={{ y: [0, 8, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
              ✨ "Best crop for clay soil?"
            </motion.div>
          </div>

        </Reveal>

        <Reveal className="lp-split-info" delay={0}>
          <div className="lp-section-eyebrow lp-section-eyebrow--indigo">🤖 Smart Farming</div>
          <h2 className="lp-section-h2">AI-Powered Crop<br /><span className="lp-h2-accent-indigo">Advisor &amp; Assistant</span></h2>
          <p className="lp-section-desc">
            Get instant AI-driven crop recommendations based on your soil type, location,
            budget and season. Ask our 24/7 AI assistant anything — from disease diagnosis to
            market timing — in Hindi or English.
          </p>
          <div className="lp-ai-chips">
            {["🌱 Which crop suits my soil?", "📈 When should I sell wheat?", "🐛 Identify this pest", "💧 How much to irrigate?"].map(q => (
              <motion.div key={q} className="lp-ai-chip" whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
                {q}
              </motion.div>
            ))}
          </div>
          <div className="lp-hero-btns" style={{ marginTop: 32 }}>
            <Link to="/recommendations/crop" className="lp-split-cta lp-split-cta--indigo">
              Get crop advice
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/ai-assistant" className="lp-split-cta-outline">
              Try AI assistant
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Marketplace Highlight */}
      <section className="lp-section lp-split-section lp-split-section--donations lp-split-section--reverse">
        <Reveal className="lp-split-info" delay={0}>
          <div className="lp-section-eyebrow lp-section-eyebrow--orange">❤️ Community Support</div>
          <h2 className="lp-section-h2">Raise a Campaign &<br /><span className="lp-h2-accent-orange">Help Fellow Farmers</span></h2>
          <p className="lp-section-desc">
            Whether you need financial support to recover from crop loss, or you want to contribute to the community, our donations platform connects farmers in need with people who care.
          </p>
          <div className="lp-marketplace-features">
            {[
              { icon: "🤝", t: "Raise Funds", s: "Start a campaign for your needs" },
              { icon: "💸", t: "Zero Fees", s: "100% goes to the farmer" },
            ].map((f, i) => (
              <motion.div key={f.t} className="lp-mp-feat" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.2 }}>
                <span className="lp-mp-feat-icon">{f.icon}</span>
                <div>
                  <div className="lp-mp-feat-title">{f.t}</div>
                  <div className="lp-mp-feat-sub">{f.s}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="lp-hero-btns" style={{ marginTop: 32 }}>
            <Link to="/donations" className="lp-split-cta lp-split-cta--orange">
              View Campaigns
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </Reveal>

        <Reveal className="lp-split-photo-side" delay={0.15}>
          <div className="lp-split-photo-wrap lp-split-photo-wrap--donations">
            <motion.img
              src="/donation_photo_1.jpg"
              alt="Farmers community"
              className="lp-split-photo"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
            <div className="lp-split-photo-overlay" />


          </div>

        </Reveal>
      </section>




      {/* All Features Showcase */}
      <section className="lp-section lp-features-section" ref={featRef}>
        <motion.div className="lp-features-bg" style={{ y: featBgY }}>
          <div className="lp-features-bg-img" />
        </motion.div>

        {/* Decorative elements */}
        <div className="lp-features-decor lp-features-decor--1" />
        <div className="lp-features-decor lp-features-decor--2" />

        <div className="lp-features-content">
          <Reveal>
            <div className="lp-features-header">
              <div className="lp-section-eyebrow lp-section-eyebrow--green lp-eyebrow-glow">✨ Complete Platform</div>
              <h2 className="lp-section-h2 lp-section-h2--white">Every Tool a Farmer Needs</h2>
              <p className="lp-features-sub">
                AgriConnect is a complete ecosystem — explore all features below
              </p>
            </div>
          </Reveal>

          <motion.div
            className="lp-features-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {ALL_FEATURES.map((f, i) => (
              <motion.div key={f.to} variants={fadeUp}>
                <Link to={f.to} className="lp-feat-card lp-spotlight-card">
                  <div className="lp-spotlight-border"></div>
                  <div className="lp-feat-card-inner">
                    <div className="lp-feat-card-img-wrap">
                      <img
                        src={f.photo}
                        alt={f.label}
                        className="lp-feat-card-img"
                        loading="lazy"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <div className="lp-feat-card-img-overlay" style={{ background: f.grad + "D9" }} />
                      <div className="lp-feat-card-tag-top">{f.tag}</div>
                    </div>
                    <div className="lp-feat-card-body">
                      <div className="lp-feat-card-icon-row">
                        <motion.span
                          className="lp-feat-card-icon"
                          whileHover={{ rotate: 12, scale: 1.25 }}
                          transition={{ type: "spring", stiffness: 400 }}>
                          {f.icon}
                        </motion.span>
                        <span className="lp-feat-card-label">{f.label}</span>
                      </div>
                      <p className="lp-feat-card-sub">{f.sub}</p>
                      <div className="lp-feat-card-arrow" style={{ color: f.color }}>
                        Explore feature <span className="lp-arrow-icon">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Weather + Shop Finder */}
      <Reveal className="lp-section lp-section--dual-cta">
        <div className="lp-dual-cta-grid">
          {/* Weather CTA */}
          <Link to="/weather" className="lp-dual-cta-card lp-dual-cta-card--weather">
            <img src="/weather_photo.png" alt="weather forecast for farmers" className="lp-dual-cta-bg-img" />
            <div className="lp-dual-cta-overlay lp-dual-cta-overlay--blue" />
            <div className="lp-dual-cta-content">
              <div className="lp-dual-cta-icon-wrap">⛅</div>
              <div className="lp-dual-cta-text">
                <div className="lp-dual-cta-eyebrow">Hyper-local Forecasts</div>
                <div className="lp-dual-cta-title">Weather for Farmers</div>
                <p className="lp-dual-cta-sub">Rain predictions, frost alerts and crop-specific advisories tailored to your district.</p>
                <div className="lp-dual-cta-btn">Check weather <span className="lp-arrow-icon">→</span></div>
              </div>
            </div>
          </Link>

          {/* Shop Finder CTA */}
          <Link to="/shops" className="lp-dual-cta-card lp-dual-cta-card--shop">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80" alt="agriculture shop finder" className="lp-dual-cta-bg-img" />
            <div className="lp-dual-cta-overlay lp-dual-cta-overlay--orange" />
            <div className="lp-dual-cta-content">
              <div className="lp-dual-cta-icon-wrap">📍</div>
              <div className="lp-dual-cta-text">
                <div className="lp-dual-cta-eyebrow">Find Stores Near You</div>
                <div className="lp-dual-cta-title">Agriculture Shops</div>
                <p className="lp-dual-cta-sub">Seeds, fertilizers, pesticides and equipment dealers on an interactive map.</p>
                <div className="lp-dual-cta-btn">Find shops <span className="lp-arrow-icon">→</span></div>
              </div>
            </div>
          </Link>

          {/* Community CTA */}
          <Link to="/community" className="lp-dual-cta-card lp-dual-cta-card--community">
            <img src="/community_photo_2.jpg" alt="farmer community" className="lp-dual-cta-bg-img" />
            <div className="lp-dual-cta-overlay lp-dual-cta-overlay--teal" />
            <div className="lp-dual-cta-content">
              <div className="lp-dual-cta-icon-wrap">👥</div>
              <div className="lp-dual-cta-text">
                <div className="lp-dual-cta-eyebrow">Farmer Network</div>
                <div className="lp-dual-cta-title">Community Forum</div>
                <p className="lp-dual-cta-sub">Ask questions, share experiences and learn from 10,000+ farmers in our community.</p>
                <div className="lp-dual-cta-btn">Join community <span className="lp-arrow-icon">→</span></div>
              </div>
            </div>
          </Link>

          {/* Donations CTA */}
          <Link to="/donations" className="lp-dual-cta-card lp-dual-cta-card--donate">
            <img src="/donation_photo_2.jpg" alt="support farmers" className="lp-dual-cta-bg-img" />
            <div className="lp-dual-cta-overlay lp-dual-cta-overlay--rose" />
            <div className="lp-dual-cta-content">
              <div className="lp-dual-cta-icon-wrap">❤️</div>
              <div className="lp-dual-cta-text">
                <div className="lp-dual-cta-eyebrow">Give Back</div>
                <div className="lp-dual-cta-title">Support Farmers</div>
                <p className="lp-dual-cta-sub">Donate to support farmers affected by drought, floods and natural disasters.</p>
                <div className="lp-dual-cta-btn">Donate now <span className="lp-arrow-icon">→</span></div>
              </div>
            </div>
          </Link>
        </div>
      </Reveal>

      <Reveal className="lp-section lp-section--final-cta">
        <div className="lp-final-cta">
          <div className="lp-final-cta-mesh" />


          <div className="lp-final-cta-content">

            <h2 className="lp-final-cta-h2">Ready to Transform Your Farm?</h2>
            <p className="lp-final-cta-p">
              Join thousands of farmers already using AgriConnect to get better prices,
              access more benefits and make smarter decisions every season.
            </p>
            <div className="lp-final-cta-btns">
              <Link to="/register" className="lp-btn-primary lp-btn-primary--lg lp-btn-glow">
                <span>Create free account</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="lp-arrow-icon">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/marketplace" className="lp-btn-ghost">
                Browse marketplace
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Footer />

      {/* Scoped Css - Premium Enhancements */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* Custom Scrollbar for a premium feel */
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #FBF5E7; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #FBF5E7; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Base */
        .lp {
          display: flex; flex-direction: column; min-height: 100vh;
          background: #FBF5E7;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* Reusable Animations */
        .lp-arrow-icon { transition: transform 0.25s ease; }
        a:hover .lp-arrow-icon { transform: translateX(4px); }
        
        /* Glassmorphism Utilities */
        .lp-glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .lp-glass-panel {
          background: rgba(10, 46, 28, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 30px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .lp-glass-hover { transition: all 0.3s ease; }
        .lp-glass-hover:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.4);
        }

        /* Spotlight Glow Effect (For Cards) */
        .lp-spotlight-card {
          position: relative;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          cursor: pointer;
        }
        .lp-spotlight-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 2px; /* Border thickness */
          background: radial-gradient(
            800px circle at var(--mouse-x) var(--mouse-y),
            rgba(22, 163, 74, 0.3),
            transparent 40%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .lp-spotlight-card:hover::before { opacity: 1; }

        /* HERO */
        .lp-hero {
          position: relative; overflow: hidden;
          min-height: 38vh;
          background: #021a0e;
          padding: 48px clamp(20px, 6vw, 100px) 36px;
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(260px,320px);
          gap: clamp(24px, 4vw, 60px);
          align-items: stretch;
        }
        .lp-hero-bg-img {
          position: absolute; inset: 0; pointer-events: none;
        }
        .lp-hero-bg-img img {
          width: 100%; height: 100%; object-fit: cover; object-position: center;
          opacity: 0.35; filter: saturate(1.4) contrast(1.1);
        }
        .lp-hero-bg-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 70% 30%, transparent 0%, rgba(2, 26, 14, 0.8) 60%, #021a0e 100%),
                      linear-gradient(180deg, rgba(2, 26, 14, 0.4) 0%, rgba(2, 26, 14, 0.9) 100%);
        }
        
        .lp-hero-mesh {
          position: absolute; inset: 0; opacity: 0.4;
          background-image: 
            radial-gradient(at 10% 20%, hsla(140,100%,20%,1) 0px, transparent 50%),
            radial-gradient(at 80% 10%, hsla(45,100%,30%,1) 0px, transparent 50%),
            radial-gradient(at 90% 90%, hsla(160,100%,15%,1) 0px, transparent 50%);
          filter: blur(60px);
          pointer-events: none;
        }

        .lp-hero > *:not(.lp-hero-bg-img):not(.lp-particles):not(.lp-hero-orb):not(.lp-hero-mesh) {
          position: relative; z-index: 1;
        }

        /* Orbs */
        .lp-hero-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          filter: blur(100px); opacity: 0.25;
          animation: lp-orb-drift 15s ease-in-out infinite alternate;
        }
        .lp-hero-orb--1 { width: 600px; height: 600px; background: #F59E0B; top: -200px; right: -100px; }
        .lp-hero-orb--2 { width: 450px; height: 450px; background: #10B981; bottom: -100px; left: 10%; animation-delay: -5s; }
        .lp-hero-orb--3 { width: 300px; height: 300px; background: #38BDF8; top: 20%; left: -100px; animation-delay: -9s; }
        @keyframes lp-orb-drift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(30px,25px) scale(1.15)} }

        /* Particles */
        .lp-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .lp-particle {
          position: absolute;
          width: var(--size, 3px); height: var(--size, 3px);
          background: rgba(255,255,255,0.6); border-radius: 50%;
          box-shadow: 0 0 10px rgba(255,255,255,0.4);
          left: calc(var(--i,0) * 4.2% + 1%);
          top: calc(var(--i,0) * 5.5% + 2%);
          animation: lp-float-up 12s ease-in-out infinite;
          animation-delay: calc(var(--i,0) * -0.5s);
          opacity: 0;
        }
        @keyframes lp-float-up {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.5; }
          100% { transform: translateY(-100px) scale(0.2); opacity: 0; }
        }

        /* Hero content */
        .lp-hero-content { display: flex; flex-direction: column; justify-content: center; }
        .lp-hero-tag {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 100px; padding: 5px 14px; width: fit-content;
          font-size: 10px; font-weight: 700; color: #FEF08A; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .lp-hero-tag-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4ADE80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.25);
          animation: lp-pulse 2s ease-in-out infinite;
        }
        @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }

        .lp-hero-h1 {
          font-size: clamp(26px, 3.2vw, 40px); font-weight: 900;
          color: #fff; line-height: 1.1; margin: 0 0 12px;
          letter-spacing: -0.03em; text-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .lp-hero-h1-accent {
          background: linear-gradient(135deg, #FDE047, #F59E0B, #EF4444);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero-p {
          font-size: 14px; color: rgba(255,255,255,0.85); line-height: 1.6;
          margin: 0 0 20px; max-width: 520px; font-weight: 400;
        }

        /* Buttons */
        .lp-hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 22px; }
        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 12px; font-size: 13px; font-weight: 700;
          background: linear-gradient(135deg, #F59E0B, #EF4444);
          color: #fff; text-decoration: none;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative; overflow: hidden;
        }
        .lp-btn-glow {
          box-shadow: 0 12px 30px -10px rgba(239,68,68,0.6), 0 0 20px rgba(245,158,11,0.2);
        }
        .lp-btn-primary:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 20px 40px -10px rgba(239,68,68,0.8), 0 0 30px rgba(245,158,11,0.4); 
          filter: brightness(1.1); 
        }
        .lp-btn-primary:active { transform: translateY(0) scale(0.98); }
        .lp-btn-primary--lg { padding: 14px 32px; font-size: 15px; }

        .lp-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
          color: #fff; border: 1.5px solid rgba(255,255,255,0.3); text-decoration: none;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .lp-btn-outline:hover { transform: translateY(-4px); }

        .lp-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 600;
          background: transparent; color: rgba(255,255,255,0.9);
          border: 1.5px solid rgba(255,255,255,0.2); text-decoration: none;
          transition: all 0.3s;
        }
        .lp-btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5); transform: translateY(-2px); }

        /* Stats row */
        .lp-stats { display: flex; gap: 0; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 16px; }
        .lp-stat { flex: 1; position: relative; }
        .lp-stat + .lp-stat::before {
           content: ''; position: absolute; left: 0; top: 10%; height: 80%; width: 1px;
           background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent);
        }
        .lp-stat + .lp-stat { padding-left: 16px; }
        .lp-stat-val   { font-size: 20px; font-weight: 900; color: #FDE047; letter-spacing: -0.02em; }
        .lp-stat-label { font-size: 10px; color: rgba(255,255,255,0.65); margin-top: 2px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Hero Right Side (Weather & Alerts) */
        .lp-hero-right {
          display: flex; flex-direction: column; gap: 16px; height: 100%;
        }

        /* Weather Widget */
        .lp-weather {
          flex: 1; display: flex;
        }
        .lp-weather-inner {
          border-radius: 20px; padding: 24px 26px;
          display: flex; flex-direction: column; justify-content: center;
          width: 100%;
        }
        .lp-weather-location {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #BAE6FD; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;
        }
        .lp-weather-main { display: flex; align-items: center; gap: 18px; margin-bottom: 14px; }
        .lp-weather-icon { font-size: 48px; display: block; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); }
        .lp-weather-temp { font-size: 44px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; }
        .lp-weather-desc { font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 6px; text-transform: capitalize; font-weight: 500;}
        .lp-weather-meta { display: flex; gap: 14px; font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px; font-weight: 500;}
        .lp-weather-link {
          display: flex; align-items: center; justify-content: flex-end; gap: 5px;
          font-size: 12px; color: #FDE047; text-decoration: none; margin-top: 16px;
          font-weight: 700;
        }
        
        .lp-hero-alert {
           border-radius: 16px; padding: 16px 18px;
           display: flex; align-items: center; gap: 14px;
           background: rgba(2, 44, 34, 0.5); /* Dark green glass */
           box-shadow: 0 20px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .lp-alert-icon { font-size: 22px; background: rgba(255,255,255,0.1); padding: 9px; border-radius: 11px; }
        .lp-alert-title { font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 3px; }
        .lp-alert-sub { font-size: 12px; color: #A7F3D0; font-weight: 500; }

        /* Section Wrapper */
        .lp-section {
          width: 100%; padding: 50px clamp(20px, 6vw, 100px); box-sizing: border-box;
        }
        .lp-section--quicklinks { padding-top: 48px; padding-bottom: 32px; background: transparent; margin-top: 0; position: relative; z-index: 10; }
        .lp-section--how { background: #FFFAF0; position: relative; overflow: hidden; }
        .lp-section--dual-cta { background: #FDF4E3; }
        .lp-section--final-cta { background: #FDF4E3; padding-bottom: 100px; }

        /* Quick Links Grid */
        .lp-quick-grid {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px;
        }
        .lp-quick-card {
          display: flex; flex-direction: column;
          height: 200px; padding: 0;
          text-decoration: none; overflow: hidden;
          background: #ffffff;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
        }
        .lp-quick-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1);
          border-color: transparent;
        }
        .lp-spotlight-border {
           position: absolute; inset: 0; border-radius: 16px; padding: 2px;
           background: var(--card-grad, #16A34A);
           -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
           -webkit-mask-composite: xor; mask-composite: exclude;
           opacity: 0; transition: opacity 0.3s; z-index: 3; pointer-events: none;
        }
        .lp-quick-card:hover .lp-spotlight-border { opacity: 1; }

        /* Image top section — fixed height so all cards align */
        .lp-quick-img-wrap {
          position: relative; width: 100%; height: 110px; flex-shrink: 0;
          overflow: hidden;
        }
        .lp-quick-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lp-quick-card:hover .lp-quick-img { transform: scale(1.1); }
        .lp-quick-img-overlay {
          position: absolute; inset: 0; opacity: 0.55;
          transition: opacity 0.4s;
        }
        .lp-quick-card:hover .lp-quick-img-overlay { opacity: 0.35; }

        .lp-spotlight-content {
           display: flex; flex-direction: column; align-items: center; justify-content: center;
           position: relative; z-index: 2; flex: 1; width: 100%;
           padding: 8px 10px 10px;
           text-align: center;
        }

        .lp-quick-tag {
          position: absolute; top: 8px; right: 8px; z-index: 2;
          font-size: 9px; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 4px 8px; border-radius: 100px;
          background: var(--card-color, #16A34A); color: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        .lp-quick-icon  { font-size: 22px; margin-bottom: 2px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
        .lp-quick-label { font-size: 12px; font-weight: 800; color: #0F172A; text-align: center; line-height: 1.2; }
        .lp-quick-sub   {
          font-size: 10px; color: #64748B; text-align: center; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;
          overflow: hidden; margin-top: 2px;
        }
        @keyframes fadeIn { from {opacity: 0; transform: translateY(4px);} to {opacity: 1; transform: translateY(0);} }

        /* Split Sections */
        .lp-split-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(40px, 8vw, 100px);
          align-items: center;
        }
        .lp-split-section--community  { background: #FFFAF0; }
        .lp-split-section--schemes    { background: #FBF2DF; border-top: 1px solid #F3E6C8; border-bottom: 1px solid #F3E6C8; }
        .lp-split-section--mandi      { background: #FFFAF0; }
        .lp-split-section--ai         { background: #FBF2DF; border-top: 1px solid #F3E6C8; border-bottom: 1px solid #F3E6C8;}
        .lp-split-section--knowledge  { background: #FFFAF0; }
        .lp-split-section--donations  { background: #FBF2DF; border-top: 1px solid #F3E6C8; }
        .lp-split-section--marketplace { background: #FFFAF0; }
        .lp-split-section--reverse    { direction: rtl; }
        .lp-split-section--reverse > * { direction: ltr; }

        /* Section labels & headings */
        .lp-section-eyebrow {
          display: inline-block; font-size: 13px; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase;
          border-radius: 100px; padding: 6px 16px; margin-bottom: 16px;
        }
        .lp-section-eyebrow--green  { color: #15803D; background: #DCFCE7; border: 1px solid #BBF7D0; }
        .lp-section-eyebrow--red    { color: #B91C1C; background: #FEE2E2; border: 1px solid #FCA5A5; }
        .lp-section-eyebrow--purple { color: #6D28D9; background: #EDE9FE; border: 1px solid #C4B5FD; }
        .lp-section-eyebrow--amber  { color: #B45309; background: #FEF3C7; border: 1px solid #FCD34D; }
        .lp-section-eyebrow--indigo { color: #4338CA; background: #E0E7FF; border: 1px solid #A5B4FC; }
        .lp-section-eyebrow--blue   { color: #0369A1; background: #E0F2FE; border: 1px solid #7DD3FC; }
        .lp-eyebrow-glow { box-shadow: 0 0 20px rgba(22, 163, 74, 0.4); }

        .lp-section-h2 {
          font-size: clamp(32px, 4.5vw, 48px); font-weight: 900;
          color: #0F172A; margin: 0 0 18px; line-height: 1.1; letter-spacing: -0.03em;
        }
        .lp-section-h2--white { color: #fff; }
        .lp-h2-accent-red    { color: #DC2626; }
        .lp-h2-accent-purple { color: #7C3AED; }
        .lp-h2-accent-amber  { color: #D97706; }
        .lp-h2-accent-indigo { color: #4F46E5; }
        .lp-h2-accent-blue   { color: #0284C7; }

        .lp-section-desc {
          font-size: 18px; color: #475569; line-height: 1.8;
          margin: 0 0 32px; max-width: 540px; font-weight: 400;
        }
        .lp-section-sub { font-size: 18px; color: #94A3B8; font-weight: 500; }

        /* Split CTA buttons */
        .lp-split-cta {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 15px 30px; border-radius: 14px; font-size: 16px; font-weight: 700;
          text-decoration: none; width: fit-content; margin-top: 10px;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lp-split-cta:hover { transform: translateY(-4px); }
        .lp-split-cta--red    { background: #DC2626; color: #fff; box-shadow: 0 10px 24px -6px rgba(220,38,38,0.5); }
        .lp-split-cta--red:hover { box-shadow: 0 16px 32px -8px rgba(220,38,38,0.6); }
        .lp-split-cta--purple { background: #7C3AED; color: #fff; box-shadow: 0 10px 24px -6px rgba(124,58,237,0.5); }
        .lp-split-cta--purple:hover { box-shadow: 0 16px 32px -8px rgba(124,58,237,0.6); }
        .lp-split-cta--amber  { background: #D97706; color: #fff; box-shadow: 0 10px 24px -6px rgba(217,119,6,0.5); }
        .lp-split-cta--amber:hover { box-shadow: 0 16px 32px -8px rgba(217,119,6,0.6); }
        .lp-split-cta--indigo { background: #4F46E5; color: #fff; box-shadow: 0 10px 24px -6px rgba(79,70,229,0.5); }
        .lp-split-cta--indigo:hover { box-shadow: 0 16px 32px -8px rgba(79,70,229,0.6); }
        .lp-split-cta--blue   { background: #0284C7; color: #fff; box-shadow: 0 10px 24px -6px rgba(2,132,199,0.5); }
        .lp-split-cta--blue:hover { box-shadow: 0 16px 32px -8px rgba(2,132,199,0.6); }

        .lp-split-cta-outline {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 14px; font-size: 16px; font-weight: 700;
          text-decoration: none; background: transparent;
          border: 2px solid #C7D2FE; color: #4338CA;
          transition: all 0.3s;
        }
        .lp-split-cta-outline:hover { background: #EEF2FF; border-color: #818CF8; transform: translateY(-2px); }

        /* Photo side */
        .lp-split-photo-side { display: flex; flex-direction: column; gap: 20px; position: relative; }

        .lp-split-photo-wrap {
          border-radius: 24px; overflow: hidden; position: relative;
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15);
          aspect-ratio: 4/3;
        }
        .lp-split-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lp-split-photo-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        
        /* Floating Elements on Photos */
        .lp-floating-badge {
          position: absolute; z-index: 2;
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.95); border-radius: 100px;
          padding: 8px 18px; font-size: 13px; font-weight: 800; color: #0F172A;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.5);
        }
        .lp-floating-badge--tl { top: 20px; left: 20px; }
        .lp-floating-badge--tr { top: 20px; right: 20px; }
        
        .lp-floating-glass-pill {
           position: absolute; z-index: 2;
           background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
           padding: 12px 20px; border-radius: 100px;
           font-size: 14px; font-weight: 700; color: #1E293B;
           box-shadow: 0 15px 35px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.6);
        }
        .lp-floating-glass-pill--br { bottom: 30px; right: 30px; }
        .lp-floating-glass-pill--bl { bottom: 30px; left: 30px; }
        
        .lp-floating-glass-card {
           position: absolute; z-index: 2;
           background: rgba(255,255,255,0.9); backdrop-filter: blur(16px);
           padding: 16px 20px; border-radius: 16px;
           box-shadow: 0 20px 40px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.6);
        }
        .lp-floating-glass-card--br { bottom: 20px; right: 20px; }

        .lp-badge-dot {
          width: 8px; height: 8px; border-radius: 50%; display: block; flex-shrink: 0;
          animation: lp-pulse 1.5s ease-in-out infinite;
        }
        .lp-badge-dot--red   { background: #DC2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.25); }
        .lp-badge-dot--green { background: #16A34A; box-shadow: 0 0 0 3px rgba(22,163,74,0.25); }
        .lp-badge-dot--blue  { background: #0284C7; box-shadow: 0 0 0 3px rgba(2,132,199,0.25); }

        /* Stat row under photo */
        .lp-split-stat-row {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .lp-split-stat {
          border-radius: 16px; padding: 18px 16px; text-align: center;
          cursor: default;
        }
        .lp-split-stat--red    { background: #FEF2F2; border: 1px solid #FECACA; }
        .lp-split-stat--purple { background: #F5F3FF; border: 1px solid #DDD6FE; }
        .lp-split-stat--amber  { background: #FFFBEB; border: 1px solid #FDE68A; }
        .lp-split-stat--indigo { background: #EEF2FF; border: 1px solid #C7D2FE; }
        .lp-split-stat--blue   { background: #F0F9FF; border: 1px solid #BAE6FD; }
        .lp-split-stat-val {
          font-size: 26px; font-weight: 900; letter-spacing: -0.02em; color: #0F172A; line-height: 1.1;
        }
        .lp-split-stat-label { font-size: 12px; color: #64748B; margin-top: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;}

        /* Carousel Box */
        .lp-carousel-box {
          border-radius: 20px; overflow: hidden; margin-bottom: 24px;
          position: relative; min-height: 200px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
        }
        .lp-carousel-box--news    { background: linear-gradient(135deg, #ffffff, #FEF2F2); border: 1.5px solid #FECACA; }
        .lp-carousel-box--schemes { background: linear-gradient(135deg, #ffffff, #F5F3FF); border: 1.5px solid #DDD6FE; }

        .lp-carousel-empty { padding: 32px; display: flex; flex-direction: column; gap: 16px; }
        .lp-carousel-skeleton { height: 20px; border-radius: 10px; background: rgba(0,0,0,0.06); animation: lp-shimmer 1.5s infinite; }
        .lp-carousel-skeleton--sm { width: 75%; }
        .lp-carousel-skeleton--xs { width: 50%; height: 16px; }

        /* News slide */
        .lp-news-slide { padding: 28px 32px; }
        .lp-post-slide-author { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .lp-post-slide-avatar {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #F87171, #DC2626); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; box-shadow: 0 4px 10px rgba(220,38,38,0.25);
        }
        .lp-post-slide-name { font-size: 14px; font-weight: 800; color: #0F172A; }
        .lp-post-slide-time { font-size: 12px; color: #94A3B8; font-weight: 600; margin-top: 1px; }
        .lp-post-slide-cat { margin-left: auto; margin-bottom: 0; white-space: nowrap; }
        .lp-news-slide-cat {
          display: inline-flex; padding: 4px 12px; border-radius: 100px;
          font-size: 12px; font-weight: 800; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .lp-news-slide-title {
          font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.3;
          margin-bottom: 12px; letter-spacing: -0.01em;
        }
        .lp-news-slide-excerpt {
          font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 18px;
        }
        .lp-news-slide-meta { display: flex; align-items: center; justify-content: space-between; }
        .lp-news-slide-date { font-size: 13px; font-weight: 600; color: #94A3B8; }
        .lp-news-slide-read {
          font-size: 14px; font-weight: 800; color: #DC2626; text-decoration: none;
          display: flex; align-items: center; gap: 6px;
        }

        /* Scheme slide */
        .lp-scheme-slide { padding: 28px 32px; }
        .lp-scheme-slide-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .lp-scheme-slide-icon { font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));}
        .lp-scheme-slide-cat {
          font-size: 12px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.08em; color: #7C3AED;
          background: #F5F3FF; border: 1px solid #DDD6FE;
          padding: 4px 12px; border-radius: 100px;
        }
        .lp-scheme-slide-title {
          font-size: 20px; font-weight: 900; color: #0F172A; margin-bottom: 12px; letter-spacing: -0.01em;
        }
        .lp-scheme-slide-desc {
          font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 16px;
        }
        .lp-scheme-slide-benefit {
          display: flex; gap: 8px; align-items: flex-start;
          font-size: 14px; color: #15803D; font-weight: 700;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          padding: 12px 16px; border-radius: 12px;
        }
        .lp-scheme-benefit-label { color: #15803D; flex-shrink: 0; }

        /* Carousel dots */
        .lp-carousel-dots {
          display: flex; gap: 8px; padding: 0 32px 24px;
          justify-content: flex-start;
        }
        .lp-dot-btn {
          width: 10px; height: 10px; border-radius: 50%;
          background: rgba(0,0,0,0.1); border: none; cursor: pointer; padding: 0;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          position: relative; overflow: hidden;
        }
        .lp-dot-btn:hover { transform: scale(1.2); }
        .lp-dot-btn--active { width: 32px; border-radius: 5px; background: rgba(0,0,0,0.05); }
        .lp-dot-progress { position: absolute; left: 0; top: 0; height: 100%; }

        /* Mandi Section Specifics */
        .lp-mandi-live-row {
          display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
        }
        .lp-live-dot {
          width: 10px; height: 10px; background: #22C55E;
          border-radius: 50%; display: block;
          box-shadow: 0 0 0 4px rgba(34,197,94,0.25);
        }
        .lp-live-text {
          font-size: 13px; font-weight: 900; color: #15803D;
          letter-spacing: 0.15em; text-transform: uppercase;
        }

        .lp-mandi-graph-box {
          background: #ffffff; border: 1.5px solid #FDE68A;
          border-radius: 20px; padding: 24px 28px; margin-bottom: 24px;
          box-shadow: 0 10px 30px -10px rgba(217, 119, 6, 0.1);
        }
        .lp-mandi-graph-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .lp-mandi-graph-label {
          font-size: 13px; font-weight: 800; color: #B45309;
          text-transform: uppercase; letter-spacing: 0.08em; 
        }
        .lp-mandi-graph-trend { font-size: 13px; font-weight: 700; background: #F0FDF4; color: #16A34A; padding: 4px 10px; border-radius: 100px; }
        
        .lp-mandi-graph-axis {
          display: flex; justify-content: space-between;
          font-size: 12px; font-weight: 600; color: #94A3B8; margin-top: 10px; padding: 0 8px;
        }

        .lp-mandi-rate-chips { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
        .lp-rate-chip {
          display: flex; align-items: center; gap: 10px;
          background: #ffffff; border: 1.5px solid #FDE68A;
          border-radius: 12px; padding: 10px 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          cursor: pointer;
        }
        .lp-rate-chip-name  { font-size: 14px; font-weight: 800; color: #0F172A; }
        .lp-rate-chip-price { font-size: 15px; font-weight: 900; color: #D97706; }
        .lp-rate-chip-skel  { width: 130px; height: 50px; border-radius: 12px; background: #FEF3C7; animation: lp-shimmer 1.5s ease-in-out infinite; }

        /* Features Grid Section */
        .lp-features-section {
          position: relative; overflow: hidden;
          background: #022c22; /* Very dark green */
          padding: 60px clamp(20px, 6vw, 100px);
        }
        .lp-features-bg {
          position: absolute; inset: -20%; pointer-events: none;
        }
        .lp-features-bg-img {
          width: 100%; height: 100%;
          background:
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 60%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        .lp-features-decor { position: absolute; filter: blur(80px); opacity: 0.3; border-radius: 50%; pointer-events: none; }
        .lp-features-decor--1 { width: 500px; height: 500px; background: #10B981; top: -100px; left: -100px; }
        .lp-features-decor--2 { width: 400px; height: 400px; background: #38BDF8; bottom: 100px; right: -50px; }

        .lp-features-content { position: relative; z-index: 1; }
        .lp-features-header { text-align: center; margin-bottom: 64px; }
        .lp-features-sub {
          font-size: 19px; color: rgba(255,255,255,0.7); margin-top: 16px; font-weight: 500;
        }

        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .lp-feat-card {
          display: flex; flex-direction: column;
          text-decoration: none; border-radius: 20px; overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s;
        }
        .lp-feat-card-inner {
           position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column;
           background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
        }
        .lp-feat-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
          border-color: transparent;
        }

        .lp-feat-card-img-wrap {
          position: relative; height: 180px; overflow: hidden;
        }
        .lp-feat-card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lp-feat-card:hover .lp-feat-card-img { transform: scale(1.1); }
        .lp-feat-card-img-overlay {
          position: absolute; inset: 0; opacity: 0.75;
          transition: opacity 0.4s;
        }
        .lp-feat-card:hover .lp-feat-card-img-overlay { opacity: 0.5; }
        .lp-feat-card-tag-top {
          position: absolute; top: 16px; left: 16px;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
          color: #fff; font-size: 10px; font-weight: 800; letter-spacing: 0.15em;
          text-transform: uppercase; padding: 6px 12px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .lp-feat-card-body { padding: 24px 20px; flex: 1; display: flex; flex-direction: column;}
        .lp-feat-card-icon-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .lp-feat-card-icon  { font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));}
        .lp-feat-card-label { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.01em; }
        .lp-feat-card-sub   { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.6; margin-bottom: 20px; flex: 1;}
        .lp-feat-card-arrow {
          font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 6px;
          transition: gap 0.2s;
        }

        /* AI Section Specifics */
        .lp-ai-chips { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .lp-ai-chip {
          font-size: 14px; font-weight: 700; color: #4338CA;
          background: #ffffff; border: 1.5px solid #C7D2FE;
          border-radius: 100px; padding: 10px 18px;
          box-shadow: 0 4px 10px rgba(67, 56, 202, 0.05);
          cursor: pointer;
        }

        /* Marketplace Section Specifics */
        .lp-marketplace-features { display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px; }
        .lp-mp-feat { display: flex; align-items: center; gap: 18px; }
        .lp-mp-feat-icon { font-size: 24px; flex-shrink: 0; width: 50px; height: 50px; background: #E0F2FE; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(2,132,199,0.1); }
        .lp-mp-feat-title { font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 2px;}
        .lp-mp-feat-sub   { font-size: 14px; color: #64748B; }

        /* How It Works */
        .lp-how-header { text-align: center; margin-bottom: 60px; }
        .lp-how-line-container { position: absolute; top: 110px; left: 15%; width: 70%; z-index: -1; }
        
        .lp-how-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; }
        .lp-how-card {
          background: #ffffff; border: 1px solid #E2E8F0;
          border-radius: 24px; text-align: center;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
        }
        .lp-how-card-inner { padding: 40px 32px; position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; align-items: center;}
        
        .lp-how-step-badge {
           background: #DCFCE7; color: #16A34A; font-weight: 900; font-size: 12px;
           padding: 6px 16px; border-radius: 100px; letter-spacing: 0.1em;
           margin-bottom: 24px; border: 1px solid #BBF7D0;
        }
        .lp-how-icon { font-size: 52px; display: block; margin-bottom: 24px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.1)); }
        .lp-how-title { font-size: 22px; font-weight: 900; color: #0F172A; margin-bottom: 14px; letter-spacing: -0.02em; }
        .lp-how-desc  { font-size: 15px; color: #475569; line-height: 1.7; }

        /* Dual CTA Grid */
        .lp-dual-cta-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
        }
        .lp-dual-cta-card {
          position: relative; border-radius: 24px; overflow: hidden;
          min-height: 320px; display: flex; flex-direction: column; justify-content: flex-end;
          text-decoration: none;
          box-shadow: 0 15px 40px -10px rgba(0,0,0,0.15);
        }
        .lp-dual-cta-bg-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .lp-dual-cta-card:hover .lp-dual-cta-bg-img { transform: scale(1.08); }
        .lp-dual-cta-overlay {
          position: absolute; inset: 0; transition: opacity 0.3s;
        }
        .lp-dual-cta-overlay--blue   { background: linear-gradient(to top, rgba(2,100,200,0.95) 0%, rgba(2,100,200,0.5) 60%, transparent 100%); }
        .lp-dual-cta-overlay--orange { background: linear-gradient(to top, rgba(180,83,9,0.95) 0%, rgba(180,83,9,0.5) 60%, transparent 100%); }
        .lp-dual-cta-overlay--teal   { background: linear-gradient(to top, rgba(8,145,178,0.95) 0%, rgba(8,145,178,0.5) 60%, transparent 100%); }
        .lp-dual-cta-overlay--rose   { background: linear-gradient(to top, rgba(159,18,57,0.95) 0%, rgba(159,18,57,0.5) 60%, transparent 100%); }
        
        .lp-dual-cta-card:hover .lp-dual-cta-overlay { opacity: 0.9; }
        
        .lp-dual-cta-content {
          position: relative; z-index: 1; padding: 40px 32px; color: #fff;
          display: flex; gap: 24px; align-items: flex-end;
        }
        .lp-dual-cta-icon-wrap {
           font-size: 44px; background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
           width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center;
           flex-shrink: 0; border: 1px solid rgba(255,255,255,0.3);
           box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .lp-dual-cta-text { flex: 1; }
        
        .lp-dual-cta-eyebrow { font-size: 12px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-bottom: 8px; }
        .lp-dual-cta-title   { font-size: 26px; font-weight: 900; margin-bottom: 12px; letter-spacing: -0.02em; }
        .lp-dual-cta-sub     { font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.6; margin-bottom: 20px; font-weight: 400;}
        .lp-dual-cta-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #ffffff; color: #0F172A;
          font-size: 14px; font-weight: 800;
          padding: 12px 24px; border-radius: 12px;
          transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .lp-dual-cta-card:hover .lp-dual-cta-btn { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); }

        /* Final CTA */
        .lp-final-cta {
          background: linear-gradient(135deg, #022c22 0%, #065f46 50%, #047857 100%);
          border-radius: 32px; padding: 80px 60px;
          position: relative; overflow: hidden; text-align: center;
          box-shadow: 0 40px 100px -20px rgba(2, 44, 34, 0.5);
        }
        
        .lp-final-cta-mesh {
          position: absolute; inset: 0; opacity: 0.3;
          background-image: 
            radial-gradient(at 20% 80%, hsla(140,100%,40%,1) 0px, transparent 50%),
            radial-gradient(at 80% 20%, hsla(45,100%,50%,1) 0px, transparent 50%);
          filter: blur(50px); pointer-events: none;
        }
        
        .lp-final-cta-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          filter: blur(90px); opacity: 0.25;
        }
        .lp-final-cta-orb--1 { width: 500px; height: 500px; background: #FDE047; top: -200px; right: -100px; }
        .lp-final-cta-orb--2 { width: 400px; height: 400px; background: #34D399; bottom: -150px; left: -100px; }
        
        .lp-final-cta-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }
        .lp-final-cta-emoji { font-size: 64px; margin-bottom: 24px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2)); }
        .lp-final-cta-h2 { font-size: clamp(32px, 5vw, 56px); font-weight: 900; color: #fff; margin: 0 0 20px; letter-spacing: -0.03em; }
        .lp-final-cta-p  { font-size: 20px; color: rgba(255,255,255,0.85); line-height: 1.7; margin: 0 auto 40px; max-width: 600px; font-weight: 400;}
        .lp-final-cta-btns { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }

        /* Responsive */
        @media (max-width: 1280px) {
          .lp-features-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 1024px) {
          .lp-hero          { grid-template-columns: 1fr; min-height: auto; padding-top: 90px;}
          .lp-hero-right    { display: none; }
          .lp-split-section { grid-template-columns: 1fr; gap: 60px; }
          .lp-split-section--reverse { direction: ltr; }
          .lp-quick-grid    { grid-template-columns: repeat(3, 1fr); }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-how-grid      { grid-template-columns: 1fr; }
          .lp-how-line-container { display: none; }
        }
        @media (max-width: 768px) {
          .lp-hero { padding: 80px 24px 32px; }
          .lp-section { padding: 60px 24px; }
          .lp-quick-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .lp-dual-cta-grid { grid-template-columns: 1fr; }
          .lp-dual-cta-content { flex-direction: column; align-items: flex-start; gap: 16px; }
          .lp-final-cta { padding: 60px 30px; border-radius: 24px; }
          .lp-split-stat-row { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 480px) {
          .lp-hero-h1 { font-size: 26px; }
          .lp-quick-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-stats { flex-wrap: wrap; gap: 10px; }
          .lp-stat { flex: 1 1 40%; }
        }
      `}</style>
    </div>
  );
}