import { useState } from "react";
import { mockPests } from "../../mockdata/pestLibraryMock";
import PestCard from "../../components/pest-library/PestCard";

const types = ["all", "insect", "fungus", "bacteria", "virus", "weed"];

const typeMeta = {
  all:      { icon:"🔍", label:"All Types",  color:"#166534", bg:"#dcfce7", border:"#86efac" },
  insect:   { icon:"🐛", label:"Insect",     color:"#c2410c", bg:"#ffedd5", border:"#fdba74" },
  fungus:   { icon:"🍄", label:"Fungus",     color:"#92400e", bg:"#fef3c7", border:"#fcd34d" },
  bacteria: { icon:"🦠", label:"Bacteria",   color:"#991b1b", bg:"#fee2e2", border:"#fca5a5" },
  virus:    { icon:"⚠️", label:"Virus",      color:"#5b21b6", bg:"#ede9fe", border:"#c4b5fd" },
  weed:     { icon:"🌿", label:"Weed",       color:"#3f6212", bg:"#ecfccb", border:"#bef264" },
};

function PestLibrary() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredPests = mockPests.filter((pest) => {
    const matchesSearch =
      pest.name.toLowerCase().includes(search.toLowerCase()) ||
      pest.affectedCrops.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || pest.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#f0fdfa 100%)",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
    }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 35%,#166534 65%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-50px", right:"120px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px", flexWrap:"wrap", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"18px" }}>
            <div style={{ width:"64px", height:"64px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"30px", backdropFilter:"blur(6px)" }}>🐛</div>
            <div>
              <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"5px" }}>AgriConnect • Pest Library</div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"30px", fontWeight:900 }}>Pest & Disease Library</h1>
              <p style={{ margin:"7px 0 0", color:"#a7f3d0", fontSize:"14px" }}>Identify pests and diseases and find the right treatment fast.</p>
            </div>
          </div>
          {/* Search */}
          <div style={{ position:"relative", width:"320px", flexShrink:0 }}>
            <span style={{ position:"absolute", left:"15px", top:"50%", transform:"translateY(-50%)", fontSize:"15px" }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pest or crop name..."
              style={{
                width:"100%", boxSizing:"border-box",
                paddingLeft:"44px", paddingRight:"16px", paddingTop:"13px", paddingBottom:"13px",
                borderRadius:"14px", background:"rgba(255,255,255,0.10)",
                border:"1.5px solid rgba(134,239,172,0.35)", color:"#fff",
                fontSize:"13px", outline:"none", backdropFilter:"blur(8px)",
              }}
              onFocus={e => e.target.style.border="1.5px solid rgba(134,239,172,0.75)"}
              onBlur={e => e.target.style.border="1.5px solid rgba(134,239,172,0.35)"}
            />
          </div>
        </div>
        <div style={{ background:"rgba(0,0,0,0.15)", borderTop:"1px solid rgba(134,239,172,0.12)" }}>
          <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"10px 48px", display:"flex", gap:"36px" }}>
            {[{ val: mockPests.length, label:"Total Entries" }, { val: filteredPests.length, label:"Showing" }, { val: types.length - 1, label:"Types" }].map(s => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ color:"#fff", fontWeight:800, fontSize:"15px" }}>{s.val}</span>
                <span style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"28px 48px 56px" }}>

        {/* Type filter pills */}
        <div style={{ display:"flex", gap:"10px", marginBottom:"28px", flexWrap:"wrap" }}>
          {types.map((t) => {
            const meta = typeMeta[t];
            const active = typeFilter === t;
            return (
              <button key={t} onClick={() => setTypeFilter(t)} style={{
                display:"flex", alignItems:"center", gap:"7px",
                padding:"9px 20px", borderRadius:"999px",
                fontSize:"13px", fontWeight:700, cursor:"pointer",
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
            🐛 {filteredPests.length} found
          </span>
        </div>

        {/* Grid */}
        {filteredPests.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:"52px", marginBottom:"12px" }}>🔍</div>
            <p style={{ color:"#6b7280", fontWeight:600 }}>No pests match your search.</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"22px" }}>
            {filteredPests.map((pest) => <PestCard key={pest._id} pest={pest} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default PestLibrary;