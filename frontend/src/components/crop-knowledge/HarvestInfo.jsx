function HarvestInfo({ harvest }) {
  if (!harvest) return null;
  return (
    <div style={{
      background:"#fff", borderRadius:"16px", padding:"20px",
      border:"2px solid #fde68a", boxShadow:"0 4px 16px rgba(245,158,11,0.10)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{
          width:"34px", height:"34px", borderRadius:"10px",
          background:"#fef3c7", border:"1.5px solid #fcd34d",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px",
        }}>🌾</div>
        <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#92400e" }}>Harvesting</h3>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f3f4f6", gap:"12px" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"12.5px", color:"#9ca3af", fontWeight:500, flexShrink:0 }}>
            <span style={{ fontSize:"12px" }}>⏰</span>Harvest Time
          </span>
          <span style={{ fontSize:"13px", color:"#1f2937", fontWeight:700, textAlign:"right" }}>{harvest.harvestTime}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0" }}>
          <span style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"12.5px", color:"#9ca3af", fontWeight:500 }}>
            <span style={{ fontSize:"12px" }}>📊</span>Yield Estimate
          </span>
          <span style={{ fontSize:"13px", color:"#1f2937", fontWeight:700 }}>{harvest.yieldEstimate}</span>
        </div>
      </div>
    </div>
  );
}

export default HarvestInfo;