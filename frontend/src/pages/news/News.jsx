import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import NewsCard from "../../components/news/NewsCard";
import Navbar from "../../components/common/Navbar";

const categories = ["all", "government", "market", "weather", "technology", "general"];

const categoryMeta = {
  all:        { icon: "📰", label: "All News",    color: "#166534", bg: "#dcfce7", border: "#86efac" },
  government: { icon: "🏛️", label: "Government",  color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  market:     { icon: "📈", label: "Market",      color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  weather:    { icon: "🌦️", label: "Weather",     color: "#0c4a6e", bg: "#e0f2fe", border: "#7dd3fc" },
  technology: { icon: "💡", label: "Technology",  color: "#4c1d95", bg: "#ede9fe", border: "#c4b5fd" },
  general:    { icon: "🌾", label: "General",     color: "#064e3b", bg: "#d1fae5", border: "#6ee7b7" },
};

function News() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [news, setNews]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Fetch all news from backend ─────────────────────────────────────────
  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      // GET /api/v1/news  — public route, no auth needed
      const res = await axiosInstance.get("/v1/news");
      setNews(res.data.data || []);
    } catch (err) {
      console.error("News fetch error:", err);
      setError("Failed to load news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  // ── Client-side category filter ─────────────────────────────────────────
  const filteredNews =
    activeCategory === "all"
      ? news
      : news.filter((a) => a.category === activeCategory);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#f0fdfa 100%)",
      fontFamily: "'Segoe UI',system-ui,sans-serif",
    }}>

      <Navbar />

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg,#052e16 0%,#14532d 35%,#166534 65%,#065f46 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:"-50px", right:"150px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px", flexWrap:"wrap", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"18px" }}>
            <div style={{ width:"64px", height:"64px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"30px", backdropFilter:"blur(6px)" }}>📰</div>
            <div>
              <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"5px" }}>AgriConnect • News</div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"30px", fontWeight:900, letterSpacing:"-0.5px" }}>Agriculture News</h1>
              <p style={{ margin:"7px 0 0", color:"#a7f3d0", fontSize:"14px" }}>Stay updated with the latest in farming, markets, weather and policy.</p>
            </div>
          </div>
          <div style={{
            background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(134,239,172,0.3)",
            borderRadius:"16px", padding:"14px 24px", backdropFilter:"blur(6px)", textAlign:"center",
          }}>
            <div style={{ color:"#fff", fontSize:"22px", fontWeight:800 }}>{loading ? "—" : news.length}</div>
            <div style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>Articles</div>
          </div>
        </div>
        {/* Stats ribbon */}
        <div style={{ background:"rgba(0,0,0,0.15)", borderTop:"1px solid rgba(134,239,172,0.12)" }}>
          <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"10px 48px", display:"flex", gap:"36px" }}>
            {[{ val: news.length, label:"Total Articles" }, { val: filteredNews.length, label:"Showing" }, { val: categories.length - 1, label:"Categories" }].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ color:"#fff", fontWeight:800, fontSize:"15px" }}>{loading ? "—" : s.val}</span>
                <span style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"28px 48px 56px" }}>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom:"20px", padding:"14px 20px", borderRadius:"12px", background:"#fee2e2", border:"1.5px solid #fca5a5", color:"#991b1b", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
            <span style={{ fontWeight:600, fontSize:"14px" }}>⚠️ {error}</span>
            <button onClick={fetchNews} style={{ padding:"6px 14px", borderRadius:"8px", background:"#991b1b", color:"#fff", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>
              Retry
            </button>
          </div>
        )}

        {/* Category pills */}
        <div style={{ display:"flex", gap:"10px", marginBottom:"28px", overflowX:"auto", flexWrap:"wrap" }}>
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                display:"flex", alignItems:"center", gap:"7px",
                padding:"9px 20px", borderRadius:"999px",
                fontSize:"13px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
                border: active ? `2px solid ${meta.color}` : "2px solid #d1fae5",
                background: active ? meta.bg : "#fff",
                color: active ? meta.color : "#374151",
                boxShadow: active ? `0 4px 14px ${meta.border}55` : "0 1px 4px rgba(0,0,0,0.06)",
                transform: active ? "translateY(-2px)" : "scale(1)",
                transition:"all 0.18s ease", outline:"none",
              }}>
                <span>{meta.icon}</span>{meta.label}
              </button>
            );
          })}
          <span style={{ marginLeft:"auto", background:"#dcfce7", color:"#166534", border:"1.5px solid #86efac", padding:"7px 16px", borderRadius:"999px", fontSize:"12px", fontWeight:700 }}>
            📄 {loading ? "..." : filteredNews.length} article{filteredNews.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"22px" }}>
            {[1,2,3,4,5,6].map(n => (
              <div key={n} style={{ borderRadius:"20px", overflow:"hidden", background:"#fff", border:"1.5px solid #d1fae5", boxShadow:"0 2px 12px rgba(22,101,52,0.06)" }}>
                <div style={{ height:"200px", background:"linear-gradient(90deg,#f0fdf4,#dcfce7,#f0fdf4)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
                <div style={{ padding:"18px" }}>
                  <div style={{ height:"16px", borderRadius:"8px", background:"#f0fdf4", marginBottom:"10px" }} />
                  <div style={{ height:"12px", borderRadius:"8px", background:"#f0fdf4", width:"60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:"52px", marginBottom:"12px" }}>📭</div>
            <p style={{ color:"#6b7280", fontWeight:600 }}>No articles in this category yet.</p>
            {news.length === 0 && (
              <p style={{ color:"#9ca3af", fontSize:"13px", marginTop:"6px" }}>
                No news available. Make sure the admin has added news articles to the database.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Featured (first article large) */}
            <div style={{ marginBottom:"28px" }}>
              <NewsCard article={filteredNews[0]} featured />
            </div>
            {/* Grid */}
            {filteredNews.length > 1 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"22px" }}>
                {filteredNews.slice(1).map((article) => <NewsCard key={article._id} article={article} />)}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

export default News;
