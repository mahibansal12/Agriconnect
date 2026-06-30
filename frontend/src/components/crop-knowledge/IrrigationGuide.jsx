function IrrigationGuide({ irrigation }) {
  if (!irrigation) return null;
  return (
    <div style={{
      background:"#fff", borderRadius:"16px", padding:"20px",
      border:"2px solid #bfdbfe", boxShadow:"0 4px 16px rgba(59,130,246,0.10)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{
          width:"34px", height:"34px", borderRadius:"10px",
          background:"#dbeafe", border:"1.5px solid #93c5fd",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px",
        }}>💧</div>
        <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#1e3a8a" }}>Irrigation Guide</h3>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"12.5px", color:"#9ca3af", fontWeight:500 }}>
            <span style={{ fontSize:"12px" }}>💦</span>Number of Irrigations
          </span>
          <span style={{ fontSize:"13px", color:"#1f2937", fontWeight:700 }}>{irrigation.numberOfIrrigations}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"12.5px", color:"#9ca3af", fontWeight:500 }}>
            <span style={{ fontSize:"12px" }}>📅</span>Interval
          </span>
          <span style={{ fontSize:"13px", color:"#1f2937", fontWeight:700 }}>Every {irrigation.intervalDays} days</span>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"8px 0", gap:"12px" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"12.5px", color:"#9ca3af", fontWeight:500, flexShrink:0 }}>
            <span style={{ fontSize:"12px" }}>📍</span>Critical Stages
          </span>
          <span style={{ fontSize:"13px", color:"#1f2937", fontWeight:700, textAlign:"right" }}>{irrigation.criticalStages}</span>
        </div>
      </div>
    </div>
  );
}

export default IrrigationGuide;