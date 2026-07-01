import { Link } from "react-router-dom";

const categoryStyle = {
  subsidy:   { bg:"#dcfce7", text:"#166534", border:"#86efac", icon:"💰" },
  loan:      { bg:"#dbeafe", text:"#1d4ed8", border:"#93c5fd", icon:"🏦" },
  insurance: { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", icon:"🛡️" },
  training:  { bg:"#ede9fe", text:"#5b21b6", border:"#c4b5fd", icon:"📚" },
  other:     { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", icon:"📋" },
};

function SchemeCard({ scheme }) {
  const cat = categoryStyle[scheme.category] || categoryStyle.other;
  return (
    <Link to={`/schemes/${scheme._id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={{
        background:"#fff", borderRadius:"18px", overflow:"hidden",
        border:`2px solid ${cat.border}`,
        boxShadow:`0 4px 18px ${cat.border}44`,
        transition:"transform 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 32px ${cat.border}66`; }}
        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 4px 18px ${cat.border}44`; }}
      >
        {/* Top bar */}
        <div style={{ height:"5px", background:`linear-gradient(90deg,${cat.text},${cat.border})` }} />
        <div style={{ padding:"20px 20px 22px" }}>
          {/* Icon + badge */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
            <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:cat.bg, border:`1.5px solid ${cat.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>
              {cat.icon}
            </div>
            <span style={{ background:cat.bg, color:cat.text, border:`1.5px solid ${cat.border}`, borderRadius:"999px", padding:"4px 12px", fontSize:"10px", fontWeight:700, textTransform:"capitalize" }}>
              {scheme.category}
            </span>
          </div>
          <h3 style={{ margin:"0 0 8px", fontSize:"16px", fontWeight:800, color:"#111827" }}>{scheme.title}</h3>
          <p style={{ margin:"0 0 14px", fontSize:"12.5px", color:"#6b7280", lineHeight:1.65, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{scheme.description}</p>
          {/* Benefit highlight */}
          <div style={{ background:cat.bg, border:`1.5px solid ${cat.border}`, borderRadius:"10px", padding:"9px 12px", marginBottom:"14px" }}>
            <div style={{ fontSize:"10px", color:cat.text, fontWeight:600, marginBottom:"2px" }}>Key Benefit</div>
            <div style={{ fontSize:"12px", color:"#1f2937", fontWeight:700 }}>{scheme.benefits.split(",")[0]}</div>
          </div>
          {/* Last date */}
          {scheme.lastDate && (
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontSize:"11px" }}>📅</span>
              <span style={{ fontSize:"11px", color:"#9ca3af" }}>Apply by:</span>
              <span style={{ fontSize:"11px", color:"#374151", fontWeight:700 }}>{new Date(scheme.lastDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
            </div>
          )}
          <div style={{ marginTop:"14px", fontSize:"12px", fontWeight:700, color:cat.text }}>View Details →</div>
        </div>
      </div>
    </Link>
  );
}

export default SchemeCard;