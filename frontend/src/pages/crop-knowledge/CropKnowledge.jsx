import { useState } from "react";
import { mockCrops } from "../../mockdata/cropKnowledgeMock";
import CropInfoCard from "../../components/crop-knowledge/CropInfoCard";

const categories = ["all", "grain", "pulse", "fruit", "vegetable", "spice", "cash crop"];

const categoryMeta = {
  all:        { label: "All Crops",  icon: "🌾", color: "#166534", bg: "#dcfce7", border: "#86efac" },
  grain:      { label: "Grain",      icon: "🌾", color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  pulse:      { label: "Pulse",      icon: "🫛", color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  fruit:      { label: "Fruit",      icon: "🍋", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  vegetable:  { label: "Vegetable",  icon: "🥦", color: "#166534", bg: "#dcfce7", border: "#86efac" },
  spice:      { label: "Spice",      icon: "🌶️", color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
  "cash crop":{ label: "Cash Crop",  icon: "💰", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
};

function CropKnowledge() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredCrops = mockCrops.filter((crop) => {
    const matchesSearch = crop.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || crop.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f0fdf4 0%, #f7fef9 40%, #ecfdf5 80%, #f0fdfa 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 70%, #065f46 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:"-50px", right:"200px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-30px", left:"100px", width:"140px", height:"140px", borderRadius:"50%", background:"rgba(52,211,153,0.06)", pointerEvents:"none" }} />

        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"36px 48px", position:"relative", zIndex:1 }}>
          {/* Eyebrow */}
          <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase", marginBottom:"10px" }}>
            AgriConnect • Knowledge Base
          </div>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:"32px", flexWrap:"wrap" }}>
            <div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"32px", fontWeight:900, letterSpacing:"-0.5px", lineHeight:1.15 }}>
                🌱 Crop Knowledge Center
              </h1>
              <p style={{ margin:"10px 0 0", color:"#a7f3d0", fontSize:"15px", fontWeight:400, maxWidth:"500px", lineHeight:1.6 }}>
                Everything you need to know about growing each crop — soil, irrigation, fertilizers, and more.
              </p>
            </div>

            {/* Search */}
            <div style={{ position:"relative", width:"320px", flexShrink:0 }}>
              <span style={{ position:"absolute", left:"15px", top:"50%", transform:"translateY(-50%)", fontSize:"15px" }}>🔍</span>
              <input
                type="text"
                placeholder="Search crops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width:"100%", boxSizing:"border-box",
                  paddingLeft:"44px", paddingRight:"16px",
                  paddingTop:"13px", paddingBottom:"13px",
                  borderRadius:"14px",
                  background:"rgba(255,255,255,0.10)",
                  border:"1.5px solid rgba(134,239,172,0.35)",
                  color:"#fff",
                  fontSize:"14px",
                  outline:"none",
                  backdropFilter:"blur(8px)",
                  transition:"border 0.2s",
                }}
                onFocus={e => e.target.style.border = "1.5px solid rgba(134,239,172,0.75)"}
                onBlur={e => e.target.style.border = "1.5px solid rgba(134,239,172,0.35)"}
              />
            </div>
          </div>
        </div>

        {/* Stats ribbon */}
        <div style={{ background:"rgba(0,0,0,0.15)", borderTop:"1px solid rgba(134,239,172,0.12)" }}>
          <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"11px 48px", display:"flex", gap:"36px", alignItems:"center" }}>
            {[
              { val: mockCrops.length, label: "Total Crops" },
              { val: filteredCrops.length, label: "Showing" },
              { val: categories.length - 1, label: "Categories" },
              { val: "Free", label: "Access" },
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
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px 56px" }}>

        {/* ── Category Filter Pills ── */}
        <div style={{ display:"flex", gap:"10px", marginBottom:"32px", overflowX:"auto", paddingBottom:"4px", flexWrap:"wrap" }}>
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  display:"flex", alignItems:"center", gap:"7px",
                  padding:"10px 22px",
                  borderRadius:"999px",
                  fontSize:"13px", fontWeight:700,
                  cursor:"pointer",
                  whiteSpace:"nowrap",
                  border: active ? `2px solid ${meta.color}` : "2px solid #d1fae5",
                  background: active ? meta.bg : "#fff",
                  color: active ? meta.color : "#374151",
                  boxShadow: active
                    ? `0 4px 16px ${meta.border}66, 0 0 0 3px ${meta.border}44`
                    : "0 1px 4px rgba(0,0,0,0.07)",
                  transform: active ? "translateY(-2px) scale(1.03)" : "scale(1)",
                  transition:"all 0.18s ease",
                  outline:"none",
                }}
              >
                <span>{meta.icon}</span>
                {meta.label}
              </button>
            );
          })}

          {/* Result count */}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center" }}>
            <span style={{
              background:"#dcfce7", color:"#166534",
              border:"1.5px solid #86efac",
              padding:"7px 16px", borderRadius:"999px",
              fontSize:"12px", fontWeight:700,
            }}>
              🌱 {filteredCrops.length} crop{filteredCrops.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Crop Grid ── */}
        {filteredCrops.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 20px", color:"#9ca3af" }}>
            <div style={{ fontSize:"56px", marginBottom:"14px" }}>🌾</div>
            <p style={{ fontSize:"16px", fontWeight:600, color:"#6b7280" }}>No crops found</p>
            <p style={{ fontSize:"13px", color:"#9ca3af", marginTop:"6px" }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(3, 1fr)",
            gap:"24px",
          }}>
            {filteredCrops.map((crop) => (
              <CropInfoCard key={crop._id} crop={crop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CropKnowledge;
