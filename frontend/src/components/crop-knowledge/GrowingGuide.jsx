function GrowingGuide({ guide }) {
  if (!guide) return null;
  const rows = [
    { label: "Soil Type", value: guide.soilType, icon: "🪱" },
    { label: "pH Range", value: guide.phRange, icon: "⚗️" },
    { label: "Temperature", value: guide.temperature, icon: "🌡️" },
    { label: "Rainfall", value: guide.rainfall, icon: "🌧️" },
  ];
  return (
    <div style={{
      background:"#fff", borderRadius:"16px", padding:"20px",
      border:"2px solid #bbf7d0", boxShadow:"0 4px 16px rgba(34,197,94,0.10)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
        <div style={{
          width:"34px", height:"34px", borderRadius:"10px",
          background:"#dcfce7", border:"1.5px solid #86efac",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px",
        }}>🌱</div>
        <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#14532d" }}>Growing Guide</h3>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {rows.map((r) => (
          <div key={r.label} style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"8px 0", borderBottom:"1px solid #f3f4f6",
          }}>
            <span style={{ display:"flex", alignItems:"center", gap:"7px", fontSize:"12.5px", color:"#9ca3af", fontWeight:500 }}>
              <span style={{ fontSize:"12px" }}>{r.icon}</span>{r.label}
            </span>
            <span style={{ fontSize:"13px", color:"#1f2937", fontWeight:700 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GrowingGuide;