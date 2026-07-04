import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import ShopCard from "../components/shop-finder/ShopCard";
import ShopMap from "../components/shop-finder/ShopMap";
import Navbar from "../components/common/Navbar";

const categories = ["all", "seeds", "fertilizer", "pesticide", "equipment", "general"];

const categoryMeta = {
  all:        { label: "All Shops",   icon: "🌾", activeBg: "linear-gradient(135deg,#166534,#15803d)", activeText: "#fff", chip: "#166534" },
  seeds:      { label: "Seeds",       icon: "🌱", activeBg: "linear-gradient(135deg,#365314,#4d7c0f)", activeText: "#fff", chip: "#4d7c0f" },
  fertilizer: { label: "Fertilizer",  icon: "🧪", activeBg: "linear-gradient(135deg,#134e4a,#0f766e)", activeText: "#fff", chip: "#0f766e" },
  pesticide:  { label: "Pesticide",   icon: "🐛", activeBg: "linear-gradient(135deg,#7c2d12,#c2410c)", activeText: "#fff", chip: "#c2410c" },
  equipment:  { label: "Equipment",   icon: "🚜", activeBg: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", activeText: "#fff", chip: "#1d4ed8" },
  general:    { label: "General",     icon: "🏪", activeBg: "linear-gradient(135deg,#4c1d95,#7c3aed)", activeText: "#fff", chip: "#7c3aed" },
};

const howItWorks = [
  { icon: "🛡️", title: "Verified Shops", desc: "Every shop is verified before listing." },
  { icon: "🌱", title: "Wide Range",    desc: "Seeds, fertilizers, pesticides & equipment." },
  { icon: "💰", title: "Best Prices",   desc: "Compare prices and get the best deals." },
  { icon: "⚡", title: "Save Time",     desc: "Find everything in one place, fast." },
];

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function ShopFinder() {
  const [userLocation, setUserLocation]     = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeShop, setActiveShop]         = useState(null);
  const [search, setSearch]                 = useState("");
  const [shops, setShops]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  // ── Fetch shops from database ───────────────────────────────────────────
  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);
      // GET /api/v1/shops — public route
      const res = await axiosInstance.get("/v1/shops");
      setShops(res.data.data || []);
    } catch (err) {
      console.error("Shops fetch error:", err);
      setError("Failed to load shop directory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation(null)
      );
    }
  }, []);

  const filteredShops = shops.filter((shop) => {
    const matchCat = categoryFilter === "all" || shop.category === categoryFilter;
    const matchSearch =
      !search ||
      shop.name.toLowerCase().includes(search.toLowerCase()) ||
      shop.address.toLowerCase().includes(search.toLowerCase()) ||
      shop.district.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0fdf4 0%, #f7fef9 40%, #ecfdf5 70%, #f0fdfa 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      <Navbar />

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #052e16 0%, #14532d 35%, #166534 65%, #065f46 100%)",
        padding: "0 0 0 0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position:"absolute", top:"-60px", right:"120px", width:"220px", height:"220px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-40px", left:"60px", width:"160px", height:"160px", borderRadius:"50%", background:"rgba(52,211,153,0.06)", pointerEvents:"none" }} />

        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px", flexWrap:"wrap", position:"relative", zIndex:1 }}>
          {/* Left: title */}
          <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
            <div style={{
              width:"68px", height:"68px",
              background:"rgba(255,255,255,0.12)",
              border:"2px solid rgba(134,239,172,0.4)",
              borderRadius:"18px",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"34px",
              boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
              backdropFilter:"blur(6px)",
            }}>🏬</div>
            <div>
              <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"5px" }}>AgriConnect • Shop Directory</div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"30px", fontWeight:800, letterSpacing:"-0.5px", lineHeight:1.15 }}>
                Nearby Agriculture Shops
              </h1>
              <p style={{ margin:"7px 0 0", color:"#a7f3d0", fontSize:"14px", fontWeight:400 }}>
                Seeds, fertilizers, pesticides & equipment — all near you.
              </p>
            </div>
          </div>

          {/* Right: search */}
          <div style={{ position:"relative", width:"340px", flexShrink:0 }}>
            <span style={{ position:"absolute", left:"16px", top:"50%", transform:"translateY(-50%)", fontSize:"15px" }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops, products or locations..."
              style={{
                width:"100%", boxSizing:"border-box",
                paddingLeft:"44px", paddingRight:"16px", paddingTop:"13px", paddingBottom:"13px",
                borderRadius:"14px",
                background:"rgba(255,255,255,0.10)",
                border:"1.5px solid rgba(134,239,172,0.35)",
                color:"#fff",
                fontSize:"13px",
                outline:"none",
                backdropFilter:"blur(8px)",
                transition:"border 0.2s",
              }}
              onFocus={e => e.target.style.border = "1.5px solid rgba(134,239,172,0.75)"}
              onBlur={e => e.target.style.border = "1.5px solid rgba(134,239,172,0.35)"}
            />
          </div>
        </div>

        {/* Stats ribbon */}
        <div style={{
          background:"rgba(0,0,0,0.18)",
          borderTop:"1px solid rgba(134,239,172,0.15)",
          backdropFilter:"blur(4px)",
        }}>
          <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"10px 48px", display:"flex", gap:"36px", alignItems:"center" }}>
            {[
              { val: loading ? "—" : shops.length, label: "Listed Shops" },
              { val: "5", label: "Categories" },
              { val: "Jaipur", label: "Serving" },
              { val: "Free", label: "Directory Access" },
            ].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ color:"#fff", fontWeight:800, fontSize:"16px" }}>{s.val}</span>
                <span style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"28px 48px 48px" }}>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom:"24px", padding:"14px 20px", borderRadius:"12px", background:"#fee2e2", border:"1.5px solid #fca5a5", color:"#991b1b", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
            <span style={{ fontWeight:600, fontSize:"14px" }}>⚠️ {error}</span>
            <button onClick={fetchShops} style={{ padding:"6px 14px", borderRadius:"8px", background:"#991b1b", color:"#fff", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>
              Retry
            </button>
          </div>
        )}

        {/* ── Category Filter ── */}
        <div style={{
          display:"flex", gap:"10px", marginBottom:"26px",
          overflowX:"auto", paddingBottom:"4px",
        }}>
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  display:"flex", alignItems:"center", gap:"8px",
                  padding:"10px 22px",
                  borderRadius:"999px",
                  fontSize:"13px", fontWeight:700,
                  cursor:"pointer",
                  whiteSpace:"nowrap",
                  transition:"all 0.18s ease",
                  border: active ? "2.5px solid transparent" : "2.5px solid #d1fae5",
                  background: active ? meta.activeBg : "#fff",
                  color: active ? "#fff" : "#374151",
                  boxShadow: active
                    ? `0 4px 16px rgba(0,0,0,0.18), 0 0 0 3px ${meta.chip}22`
                    : "0 1px 4px rgba(0,0,0,0.07)",
                  transform: active ? "translateY(-2px) scale(1.03)" : "scale(1)",
                  outline:"none",
                }}
              >
                <span style={{ fontSize:"15px" }}>{meta.icon}</span>
                {meta.label}
              </button>
            );
          })}

          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
            <span style={{
              background:"#dcfce7", color:"#166534",
              border:"1.5px solid #86efac",
              padding:"6px 16px", borderRadius:"999px",
              fontSize:"12px", fontWeight:700,
            }}>
              📍 {loading ? "..." : filteredShops.length} shop{filteredShops.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* ── Main Grid: Map + Cards ── */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr 420px",
          gap:"24px",
          alignItems:"start",
        }}>

          {/* ── Map Panel ── */}
          <div style={{
            borderRadius:"22px",
            overflow:"hidden",
            boxShadow:"0 8px 40px rgba(0,0,0,0.13)",
            border:"2.5px solid #86efac",
            background:"#fff",
            position:"relative",
          }}>
            {/* Map label */}
            <div style={{
              padding:"14px 20px",
              background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
              borderBottom:"1.5px solid #bbf7d0",
              display:"flex", alignItems:"center", justifyContent:"space-between",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{
                  width:"32px", height:"32px", borderRadius:"10px",
                  background:"#16a34a", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"16px",
                  boxShadow:"0 2px 8px rgba(22,163,74,0.3)",
                }}>🗺️</div>
                <div>
                  <div style={{ fontWeight:700, color:"#14532d", fontSize:"14px" }}>Live Shop Map</div>
                  <div style={{ fontSize:"11px", color:"#4b7a5c" }}>Click a card to highlight on map</div>
                </div>
              </div>
              <span style={{
                background:"#fff", border:"1.5px solid #86efac",
                color:"#16a34a", fontSize:"11px", fontWeight:700,
                padding:"4px 12px", borderRadius:"999px",
                boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
              }}>
                {loading ? "..." : filteredShops.length} pins
              </span>
            </div>

            <ShopMap
              shops={filteredShops}
              userLocation={userLocation}
              selectedShop={activeShop}
            />

            {/* Bottom bar */}
            <div style={{
              padding:"10px 20px",
              background:"#f0fdf4",
              borderTop:"1px solid #d1fae5",
              display:"flex", alignItems:"center", gap:"16px",
            }}>
              <span style={{ fontSize:"11px", color:"#6b7280" }}>📡 Powered by OpenStreetMap</span>
              {userLocation && (
                <span style={{ fontSize:"11px", color:"#16a34a", fontWeight:600, marginLeft:"auto" }}>✅ Location detected</span>
              )}
            </div>
          </div>

          {/* ── Shop Cards Panel ── */}
          <div style={{
            borderRadius:"22px",
            border:"2.5px solid #86efac",
            boxShadow:"0 8px 40px rgba(0,0,0,0.10)",
            background:"#fff",
            overflow:"hidden",
            display:"flex", flexDirection:"column",
          }}>
            {/* Panel header */}
            <div style={{
              padding:"16px 20px",
              background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
              borderBottom:"1.5px solid #bbf7d0",
              display:"flex", alignItems:"center", gap:"12px",
            }}>
              <div style={{
                width:"36px", height:"36px", borderRadius:"10px",
                background:"#16a34a", display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:"18px",
                boxShadow:"0 3px 10px rgba(22,163,74,0.3)",
              }}>🏪</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, color:"#14532d", fontSize:"15px" }}>Shops Near You</div>
                <div style={{ fontSize:"11px", color:"#4b7a5c", marginTop:"1px" }}>
                  {categoryFilter === "all" ? "All categories" : categoryMeta[categoryFilter].label}
                </div>
              </div>
              <div style={{
                background:"#16a34a", color:"#fff",
                fontSize:"12px", fontWeight:800,
                padding:"4px 12px", borderRadius:"999px",
                boxShadow:"0 2px 8px rgba(22,163,74,0.35)",
              }}>
                {loading ? "..." : filteredShops.length}
              </div>
            </div>

            {/* Scroll area */}
            <div style={{
              maxHeight:"490px", overflowY:"auto",
              padding:"16px", display:"flex", flexDirection:"column", gap:"14px",
              scrollbarWidth:"thin", scrollbarColor:"#86efac #f0fdf4",
            }}>
              {loading ? (
                [1, 2, 3].map(n => (
                  <div key={n} style={{ background: "#fff", borderRadius: "18px", padding: "20px", border: "1.5px solid #d1fae5" }} className="animate-pulse">
                    <div style={{ height: "16px", background: "#f0fdf4", width: "60%", marginBottom: "10px", borderRadius: "8px" }} />
                    <div style={{ height: "12px", background: "#f0fdf4", width: "80%", marginBottom: "6px", borderRadius: "8px" }} />
                    <div style={{ height: "12px", background: "#f0fdf4", width: "40%", borderRadius: "8px" }} />
                  </div>
                ))
              ) : filteredShops.length === 0 ? (
                <div style={{ textAlign:"center", padding:"60px 20px", color:"#9ca3af" }}>
                  <div style={{ fontSize:"48px", marginBottom:"10px" }}>🔍</div>
                  <p style={{ fontSize:"14px", fontWeight:600, color:"#6b7280" }}>No shops found</p>
                  <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"4px" }}>Try a different category or search term</p>
                </div>
              ) : (
                filteredShops.map((shop, idx) => (
                  <ShopCard
                    key={shop._id}
                    shop={shop}
                    index={idx}
                    isActive={activeShop?._id === shop._id}
                    onSelect={setActiveShop}
                    distance={
                      userLocation
                        ? getDistanceKm(
                            userLocation[0], userLocation[1],
                            shop.location.coordinates[1], shop.location.coordinates[0]
                          )
                        : null
                    }
                  />
                ))
              )}
            </div>

            {/* Footer hint */}
            <div style={{
              padding:"12px 20px",
              background:"#f9fafb",
              borderTop:"1px solid #e5e7eb",
              textAlign:"center",
            }}>
              <span style={{ fontSize:"11px", color:"#9ca3af" }}>
                💡 Click any shop card to highlight it on the map
              </span>
            </div>
          </div>
        </div>

        {/* ── Info Features Grid ── */}
        <div style={{
          marginTop:"36px",
          display:"grid",
          gridTemplateColumns:"repeat(4,1fr)",
          gap:"20px",
        }}>
          {howItWorks.map((step) => (
            <div
              key={step.title}
              style={{
                background:"#fff",
                borderRadius:"16px",
                border:"2px solid #d1fae5",
                boxShadow:"0 4px 16px rgba(22,163,74,0.06)",
                padding:"18px 18px 20px",
              }}
            >
              <div style={{
                width:"40px", height:"40px",
                background:"#f0fdf4",
                border:"1.5px solid #86efac",
                borderRadius:"12px",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"18px", marginBottom:"12px",
              }}>
                {step.icon}
              </div>
              <p style={{ margin:0, fontWeight:700, color:"#14532d", fontSize:"13.5px" }}>{step.title}</p>
              <p style={{ margin:"6px 0 0", color:"#4b7a5c", fontSize:"12px", lineHeight:1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShopFinder;