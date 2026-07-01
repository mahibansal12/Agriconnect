import { Link } from "react-router-dom";

const typeStyle = {
  insect:   { bg:"#ffedd5", text:"#c2410c", border:"#fdba74", topBar:"#f97316", icon:"🐛" },
  fungus:   { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", topBar:"#f59e0b", icon:"🍄" },
  bacteria: { bg:"#fee2e2", text:"#991b1b", border:"#fca5a5", topBar:"#ef4444", icon:"🦠" },
  virus:    { bg:"#ede9fe", text:"#5b21b6", border:"#c4b5fd", topBar:"#8b5cf6", icon:"⚠️" },
  weed:     { bg:"#ecfccb", text:"#3f6212", border:"#bef264", topBar:"#84cc16", icon:"🌿" },
};

function PestCard({ pest }) {
  const sty = typeStyle[pest.type] || { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", topBar:"#9ca3af", icon:"🔍" };
  return (
    <Link to={`/pests/${pest._id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={{
        background:"#fff", borderRadius:"18px", overflow:"hidden",
        border:`2px solid ${sty.border}`,
        boxShadow:`0 4px 18px ${sty.border}44`,
        transition:"transform 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow=`0 14px 36px ${sty.border}66`; }}
        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 4px 18px ${sty.border}44`; }}
      >
        {/* Image */}
        <div style={{ position:"relative", height:"170px" }}>
          <img src={pest.image} alt={pest.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.35),transparent)" }} />
          <span style={{ position:"absolute", top:"10px", right:"10px", background:"rgba(255,255,255,0.92)", border:`1.5px solid ${sty.border}`, borderRadius:"999px", padding:"4px 10px", fontSize:"10px", fontWeight:700, color:sty.text, textTransform:"capitalize" }}>
            {sty.icon} {pest.type}
          </span>
        </div>

        <div style={{ padding:"16px 18px 20px" }}>
          <div style={{ height:"4px", background:`linear-gradient(90deg,${sty.topBar},${sty.border})`, borderRadius:"4px", marginBottom:"12px" }} />
          <h3 style={{ margin:"0 0 10px", fontSize:"16px", fontWeight:800, color:"#111827" }}>{pest.name}</h3>

          {/* Affected crops */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
            {pest.affectedCrops.slice(0, 3).map((crop) => (
              <span key={crop} style={{ background:sty.bg, color:sty.text, border:`1px solid ${sty.border}`, borderRadius:"999px", padding:"2px 10px", fontSize:"10px", fontWeight:600 }}>{crop}</span>
            ))}
            {pest.affectedCrops.length > 3 && (
              <span style={{ background:"#f3f4f6", color:"#6b7280", borderRadius:"999px", padding:"2px 10px", fontSize:"10px", fontWeight:600 }}>+{pest.affectedCrops.length - 3} more</span>
            )}
          </div>

          {/* Symptoms preview */}
          <p style={{ margin:"0 0 14px", fontSize:"12px", color:"#6b7280", lineHeight:1.65, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{pest.symptoms}</p>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"11px", color:sty.text, fontWeight:600 }}>🔬 View Treatment</span>
            <span style={{ fontSize:"11px", fontWeight:700, color:sty.text }}>Details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PestCard;