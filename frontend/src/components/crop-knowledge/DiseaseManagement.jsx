function DiseaseManagement({ diseases }) {
  if (!diseases || diseases.length === 0) return null;
  return (
    <div style={{
      background:"#fff", borderRadius:"16px", padding:"20px",
      border:"2px solid #fecaca", boxShadow:"0 4px 16px rgba(239,68,68,0.10)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
        <div style={{
          width:"34px", height:"34px", borderRadius:"10px",
          background:"#fee2e2", border:"1.5px solid #fca5a5",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px",
        }}>🛡️</div>
        <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#991b1b" }}>Disease Management</h3>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
        {diseases.map((d, i) => (
          <div key={i} style={{
            borderLeft:"4px solid #f87171",
            background:"#fef2f2",
            borderRadius:"0 10px 10px 0",
            padding:"12px 16px",
          }}>
            <p style={{ margin:"0 0 6px", fontWeight:800, color:"#1f2937", fontSize:"13.5px", display:"flex", alignItems:"center", gap:"6px" }}>
              ⚠️ {d.disease}
            </p>
            <p style={{ margin:"0 0 4px", fontSize:"12.5px", color:"#166534" }}>
              <span style={{ color:"#9ca3af", fontWeight:600 }}>Prevention: </span>{d.prevention}
            </p>
            <p style={{ margin:0, fontSize:"12.5px", color:"#b91c1c" }}>
              <span style={{ color:"#9ca3af", fontWeight:600 }}>Treatment: </span>{d.treatment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiseaseManagement;