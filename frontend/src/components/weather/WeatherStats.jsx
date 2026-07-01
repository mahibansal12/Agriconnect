function WeatherStats({ stats }) {
  const items = [
    { label:"UV Index",   val: stats.uvIndex,    icon:"☀️",  color:"#fcd34d", bg:"#fef3c7" },
    { label:"Visibility", val: stats.visibility, icon:"👁️",  color:"#93c5fd", bg:"#dbeafe" },
    { label:"Pressure",   val: stats.pressure,   icon:"🌀",  color:"#c4b5fd", bg:"#ede9fe" },
  ];
  return (
    <div style={{
      background:"#fff", borderRadius:"20px",
      border:"2px solid #bbf7d0",
      boxShadow:"0 4px 20px rgba(22,163,74,0.10)",
      padding:"22px",
      display:"flex", flexDirection:"column", gap:"14px",
    }}>
      <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#14532d" }}>📊 Additional Stats</h3>
      {items.map(item => (
        <div key={item.label} style={{
          display:"flex", alignItems:"center", gap:"14px",
          background:item.bg, borderRadius:"12px", padding:"14px 16px",
          border:`1.5px solid ${item.color}`,
        }}>
          <span style={{ fontSize:"22px" }}>{item.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"11px", color:"#9ca3af", fontWeight:500 }}>{item.label}</div>
            <div style={{ fontSize:"16px", fontWeight:800, color:"#1f2937" }}>{item.val}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WeatherStats;
