import { useParams, Link } from "react-router-dom";
import { mockSchemes } from "../../mockdata/schemesMock";

const categoryStyle = {
  subsidy:   { bg:"#dcfce7", text:"#166534", border:"#86efac", icon:"💰" },
  loan:      { bg:"#dbeafe", text:"#1d4ed8", border:"#93c5fd", icon:"🏦" },
  insurance: { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", icon:"🛡️" },
  training:  { bg:"#ede9fe", text:"#5b21b6", border:"#c4b5fd", icon:"📚" },
  other:     { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", icon:"📋" },
};

function SchemeDetail() {
  const { id } = useParams();
  const scheme = mockSchemes.find((s) => s._id === id);

  if (!scheme) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0fdf4" }}>
      <p style={{ color:"#6b7280" }}>Scheme not found.</p>
    </div>
  );

  const cat = categoryStyle[scheme.category] || categoryStyle.other;
  const lastDate = scheme.lastDate ? new Date(scheme.lastDate).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }) : null;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-40px", right:"150px", width:"180px", height:"180px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"28px 40px", position:"relative", zIndex:1 }}>
          <Link to="/schemes" style={{ display:"inline-flex", alignItems:"center", gap:"6px", color:"#86efac", fontSize:"13px", fontWeight:600, textDecoration:"none", marginBottom:"20px", padding:"7px 14px", borderRadius:"999px", background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(134,239,172,0.3)", backdropFilter:"blur(6px)" }}>
            ← Back to all schemes
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"56px", height:"56px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", backdropFilter:"blur(6px)" }}>
              {cat.icon}
            </div>
            <div>
              <span style={{ background:cat.bg, color:cat.text, border:`1.5px solid ${cat.border}`, borderRadius:"999px", padding:"3px 12px", fontSize:"10px", fontWeight:700, textTransform:"capitalize", display:"inline-block", marginBottom:"7px" }}>
                {scheme.category}
              </span>
              <h1 style={{ margin:0, color:"#fff", fontSize:"28px", fontWeight:900 }}>{scheme.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 40px 56px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"28px", alignItems:"start" }}>

          {/* Main card */}
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

            {/* Description */}
            <div style={{ background:"#fff", borderRadius:"20px", border:`2px solid ${cat.border}`, boxShadow:`0 4px 20px ${cat.border}44`, overflow:"hidden" }}>
              <div style={{ height:"5px", background:`linear-gradient(90deg,${cat.text},${cat.border})` }} />
              <div style={{ padding:"24px 28px" }}>
                <h2 style={{ margin:"0 0 10px", fontSize:"15px", fontWeight:800, color:"#14532d", display:"flex", alignItems:"center", gap:"8px" }}>📄 About this Scheme</h2>
                <p style={{ margin:0, fontSize:"14px", color:"#374151", lineHeight:1.8 }}>{scheme.description}</p>
              </div>
            </div>

            {/* Eligibility */}
            <div style={{ background:"#fff", borderRadius:"20px", border:"2px solid #bbf7d0", boxShadow:"0 4px 16px rgba(22,163,74,0.08)", overflow:"hidden" }}>
              <div style={{ height:"5px", background:"linear-gradient(90deg,#16a34a,#86efac)" }} />
              <div style={{ padding:"24px 28px" }}>
                <h2 style={{ margin:"0 0 10px", fontSize:"15px", fontWeight:800, color:"#14532d", display:"flex", alignItems:"center", gap:"8px" }}>✅ Eligibility</h2>
                <p style={{ margin:0, fontSize:"14px", color:"#374151", lineHeight:1.8 }}>{scheme.eligibility}</p>
              </div>
            </div>

            {/* Benefits */}
            <div style={{ background:cat.bg, borderRadius:"20px", border:`2px solid ${cat.border}`, boxShadow:`0 4px 16px ${cat.border}44`, padding:"24px 28px" }}>
              <h2 style={{ margin:"0 0 12px", fontSize:"15px", fontWeight:800, color:cat.text, display:"flex", alignItems:"center", gap:"8px" }}>🎁 Benefits</h2>
              {scheme.benefits.split(",").map((b, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"10px", marginBottom:"8px" }}>
                  <span style={{ color:cat.text, fontWeight:700, marginTop:"1px" }}>•</span>
                  <span style={{ fontSize:"14px", color:"#1f2937", lineHeight:1.7 }}>{b.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

            {/* Quick info */}
            <div style={{ background:"#fff", borderRadius:"18px", border:"2px solid #bbf7d0", boxShadow:"0 4px 16px rgba(22,163,74,0.10)", padding:"20px" }}>
              <h3 style={{ margin:"0 0 14px", fontSize:"14px", fontWeight:800, color:"#14532d" }}>📋 Quick Info</h3>
              {[
                { label:"Category",   val: scheme.category, icon:"🏷️" },
                ...(lastDate ? [{ label:"Last Date", val: lastDate, icon:"📅" }] : []),
                { label:"Apply",      val: "Online / Offline", icon:"💻" },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f3f4f6", gap:"8px" }}>
                  <span style={{ fontSize:"12px", color:"#9ca3af", display:"flex", alignItems:"center", gap:"6px", flexShrink:0 }}><span>{item.icon}</span>{item.label}</span>
                  <span style={{ fontSize:"12px", fontWeight:700, color:"#1f2937", textAlign:"right", textTransform:"capitalize" }}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* Apply button */}
            {scheme.applicationLink && (
              <a href={scheme.applicationLink} target="_blank" rel="noopener noreferrer" style={{
                display:"block", textDecoration:"none",
                background:"linear-gradient(135deg,#14532d,#166534)",
                color:"#fff", borderRadius:"14px", padding:"16px 20px",
                textAlign:"center", fontSize:"14px", fontWeight:800,
                boxShadow:"0 6px 20px rgba(22,163,74,0.35)",
              }}>
                Apply Now →
              </a>
            )}

            <Link to="/schemes" style={{ display:"block", textDecoration:"none", background:"#f0fdf4", color:"#166534", border:"2px solid #86efac", borderRadius:"14px", padding:"13px 20px", textAlign:"center", fontSize:"13px", fontWeight:700 }}>
              ← All Schemes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchemeDetail;