import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import TreatmentGuide from "../../components/pest-library/TreatmentGuide";
import Navbar from "../../components/common/Navbar";
import axiosInstance from "../../utils/axiosInstance";

const typeStyle = {
  insect:   { bg:"#ffedd5", text:"#c2410c", border:"#fdba74", topBar:"#f97316", icon:"🐛" },
  fungus:   { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", topBar:"#f59e0b", icon:"🍄" },
  bacteria: { bg:"#fee2e2", text:"#991b1b", border:"#fca5a5", topBar:"#ef4444", icon:"🦠" },
  virus:    { bg:"#ede9fe", text:"#5b21b6", border:"#c4b5fd", topBar:"#8b5cf6", icon:"⚠️" },
  weed:     { bg:"#ecfccb", text:"#3f6212", border:"#bef264", topBar:"#84cc16", icon:"🌿" },
};

function PestDetail() {
  const { id } = useParams();
  const [pest, setPest]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Fetch single pest from backend ──────────────────────────────────────
  useEffect(() => {
    const fetchPest = async () => {
      try {
        setLoading(true);
        setError(null);
        // GET /api/v1/pests/:id — public route, no auth needed
        const res = await axiosInstance.get(`/v1/pests/${id}`);
        setPest(res.data.data);
      } catch (err) {
        console.error("Pest detail fetch error:", err);
        setError(err.response?.status === 404 ? "Pest not found." : "Failed to load pest details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPest();
  }, [id]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", padding:"40px 48px", minHeight:"120px" }}>
        <div style={{ width:"160px", height:"16px", borderRadius:"8px", background:"rgba(255,255,255,0.15)", marginBottom:"12px" }} />
        <div style={{ width:"260px", height:"28px", borderRadius:"8px", background:"rgba(255,255,255,0.2)" }} />
      </div>
      <div style={{ maxWidth:"1100px", margin:"40px auto", padding:"0 40px", display:"grid", gridTemplateColumns:"1fr 300px", gap:"28px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
          <div style={{ height:"280px", borderRadius:"20px", background:"linear-gradient(90deg,#f0fdf4,#dcfce7,#f0fdf4)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
          <div style={{ height:"120px", borderRadius:"20px", background:"#f0fdf4" }} />
        </div>
        <div style={{ height:"220px", borderRadius:"18px", background:"#f0fdf4" }} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );

  // ── Error / Not found state ──────────────────────────────────────────────
  if (error || !pest) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"100px 20px" }}>
        <div style={{ fontSize:"56px", marginBottom:"16px" }}>🐛</div>
        <p style={{ color:"#374151", fontWeight:700, fontSize:"16px", marginBottom:"8px" }}>{error || "Pest not found."}</p>
        <Link to="/pests" style={{ marginTop:"12px", display:"inline-flex", alignItems:"center", gap:"6px", color:"#166534", fontWeight:700, padding:"10px 20px", borderRadius:"12px", background:"#dcfce7", border:"1.5px solid #86efac", textDecoration:"none", fontSize:"13px" }}>
          ← Back to Pest Library
        </Link>
      </div>
    </div>
  );

  const sty = typeStyle[pest.type] || { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", topBar:"#9ca3af", icon:"🔍" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      <Navbar />

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-40px", right:"120px", width:"180px", height:"180px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"28px 40px", position:"relative", zIndex:1 }}>
          <Link to="/pests" style={{ display:"inline-flex", alignItems:"center", gap:"6px", color:"#86efac", fontSize:"13px", fontWeight:600, textDecoration:"none", marginBottom:"20px", padding:"7px 14px", borderRadius:"999px", background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(134,239,172,0.3)", backdropFilter:"blur(6px)" }}>
            ← Back to Pest Library
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"56px", height:"56px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", backdropFilter:"blur(6px)" }}>
              {sty.icon}
            </div>
            <div>
              <span style={{ background:sty.bg, color:sty.text, border:`1.5px solid ${sty.border}`, borderRadius:"999px", padding:"3px 12px", fontSize:"10px", fontWeight:700, textTransform:"capitalize", display:"inline-block", marginBottom:"7px" }}>
                {pest.type}
              </span>
              <h1 style={{ margin:0, color:"#fff", fontSize:"28px", fontWeight:900 }}>{pest.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 40px 56px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"28px", alignItems:"start" }}>

          {/* Left column */}
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

            {/* Image + Symptoms */}
            <div style={{ background:"#fff", borderRadius:"20px", overflow:"hidden", border:`2px solid ${sty.border}`, boxShadow:`0 6px 24px ${sty.border}44` }}>
              <div style={{ position:"relative", height:"260px" }}>
                {pest.image ? (
                  <img src={pest.image} alt={pest.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                ) : (
                  <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${sty.bg},${sty.border})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"72px" }}>
                    {sty.icon}
                  </div>
                )}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.3),transparent)" }} />
                <div style={{ position:"absolute", bottom:"14px", left:"16px", display:"flex", flexWrap:"wrap", gap:"6px" }}>
                  {(pest.affectedCrops || []).map((crop) => (
                    <span key={crop} style={{ background:"rgba(255,255,255,0.92)", color:sty.text, border:`1.5px solid ${sty.border}`, borderRadius:"999px", padding:"3px 12px", fontSize:"10px", fontWeight:700 }}>{crop}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding:"22px 26px" }}>
                <div style={{ height:"4px", background:`linear-gradient(90deg,${sty.topBar},${sty.border})`, borderRadius:"4px", marginBottom:"16px" }} />
                <h3 style={{ margin:"0 0 10px", fontSize:"15px", fontWeight:800, color:"#14532d" }}>🔬 Symptoms</h3>
                <p style={{ margin:0, fontSize:"14px", color:"#374151", lineHeight:1.8 }}>{pest.symptoms}</p>
              </div>
            </div>

            {/* Treatment + Prevention */}
            <TreatmentGuide treatment={pest.treatment} prevention={pest.prevention} />
          </div>

          {/* Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ background:"#fff", borderRadius:"18px", border:`2px solid ${sty.border}`, boxShadow:`0 4px 16px ${sty.border}44`, overflow:"hidden" }}>
              <div style={{ height:"5px", background:`linear-gradient(90deg,${sty.topBar},${sty.border})` }} />
              <div style={{ padding:"20px" }}>
                <h3 style={{ margin:"0 0 14px", fontSize:"14px", fontWeight:800, color:"#14532d" }}>📋 Quick Facts</h3>
                {[
                  { label:"Type",           val: pest.type, icon: sty.icon },
                  { label:"Affected Crops", val: `${(pest.affectedCrops || []).length} Crops`, icon:"🌾" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f3f4f6" }}>
                    <span style={{ fontSize:"12px", color:"#9ca3af", display:"flex", alignItems:"center", gap:"6px" }}><span>{item.icon}</span>{item.label}</span>
                    <span style={{ fontSize:"12px", fontWeight:700, color:"#1f2937", textTransform:"capitalize" }}>{item.val}</span>
                  </div>
                ))}

                {/* All affected crops */}
                <div style={{ marginTop:"14px" }}>
                  <p style={{ margin:"0 0 8px", fontSize:"11px", color:"#9ca3af", fontWeight:600 }}>AFFECTED CROPS</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {(pest.affectedCrops || []).map(crop => (
                      <span key={crop} style={{ background:sty.bg, color:sty.text, border:`1px solid ${sty.border}`, borderRadius:"999px", padding:"3px 10px", fontSize:"10px", fontWeight:600 }}>{crop}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link to="/pests" style={{ display:"block", textDecoration:"none", background:"#f0fdf4", color:"#166534", border:"2px solid #86efac", borderRadius:"14px", padding:"13px 20px", textAlign:"center", fontSize:"13px", fontWeight:700 }}>
              ← Back to Library
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PestDetail;