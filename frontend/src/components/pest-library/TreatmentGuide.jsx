function TreatmentGuide({ treatment, prevention }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>

      {/* Treatment */}
      <div style={{ background:"#fff", borderRadius:"18px", overflow:"hidden", border:"2px solid #fdba74", boxShadow:"0 4px 16px rgba(249,115,22,0.12)" }}>
        <div style={{ height:"5px", background:"linear-gradient(90deg,#c2410c,#fdba74)" }} />
        <div style={{ padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"#ffedd5", border:"1.5px solid #fdba74", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>💊</div>
            <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#c2410c" }}>Treatment</h3>
          </div>
          <p style={{ margin:0, fontSize:"13px", color:"#374151", lineHeight:1.75 }}>{treatment}</p>
        </div>
      </div>

      {/* Prevention */}
      <div style={{ background:"#fff", borderRadius:"18px", overflow:"hidden", border:"2px solid #86efac", boxShadow:"0 4px 16px rgba(22,163,74,0.10)" }}>
        <div style={{ height:"5px", background:"linear-gradient(90deg,#16a34a,#86efac)" }} />
        <div style={{ padding:"20px 22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"#dcfce7", border:"1.5px solid #86efac", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>🛡️</div>
            <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#16a34a" }}>Prevention</h3>
          </div>
          <p style={{ margin:0, fontSize:"13px", color:"#374151", lineHeight:1.75 }}>{prevention || "No specific prevention notes available."}</p>
        </div>
      </div>
    </div>
  );
}

export default TreatmentGuide;