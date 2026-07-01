import { mockSchemes } from "../../mockdata/schemesMock";
import SchemeCard from "../../components/schemes/SchemeCard";
import EligibilityChecker from "../../components/schemes/EligibilityChecker";

function Schemes() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#f0fdfa 100%)",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
    }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 35%,#166534 65%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-40px", right:"180px", width:"180px", height:"180px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px", flexWrap:"wrap", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"18px" }}>
            <div style={{ width:"64px", height:"64px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"30px", backdropFilter:"blur(6px)" }}>🏛️</div>
            <div>
              <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"5px" }}>AgriConnect • Government</div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"30px", fontWeight:900 }}>Government Schemes</h1>
              <p style={{ margin:"7px 0 0", color:"#a7f3d0", fontSize:"14px" }}>Explore benefits and subsidies available for farmers across India.</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:"20px" }}>
            {[{ val: mockSchemes.length, label:"Active Schemes" }, { val:"Free", label:"To Apply" }].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(134,239,172,0.3)", borderRadius:"14px", padding:"12px 20px", backdropFilter:"blur(6px)", textAlign:"center" }}>
                <div style={{ color:"#fff", fontSize:"20px", fontWeight:800 }}>{s.val}</div>
                <div style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px 56px" }}>

        {/* Eligibility Checker */}
        <div style={{ marginBottom:"36px" }}>
          <h2 style={{ margin:"0 0 14px", fontSize:"18px", fontWeight:800, color:"#14532d" }}>🔍 Check Your Eligibility</h2>
          <EligibilityChecker />
        </div>

        {/* Schemes heading */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
          <h2 style={{ margin:0, fontSize:"18px", fontWeight:800, color:"#14532d" }}>📋 All Schemes</h2>
          <span style={{ background:"#dcfce7", color:"#166534", border:"1.5px solid #86efac", padding:"6px 16px", borderRadius:"999px", fontSize:"12px", fontWeight:700 }}>
            {mockSchemes.length} schemes
          </span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"22px" }}>
          {mockSchemes.map((scheme) => <SchemeCard key={scheme._id} scheme={scheme} />)}
        </div>
      </div>
    </div>
  );
}

export default Schemes;