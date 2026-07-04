function WeatherStats({ stats }) {
  // visibility comes in meters from OpenWeatherMap (e.g. 10000m = 10 km)
  const visibilityKm = stats.visibility 
    ? `${(stats.visibility / 1000).toFixed(0)} km`
    : "10 km";

  // Convert wind speed from m/s to km/h (1 m/s = 3.6 km/h)
  const windSpeedKmh = stats.windSpeed 
    ? `${(stats.windSpeed * 3.6).toFixed(1)} km/h`
    : "0.0 km/h";

  const items = [
    { label:"Visibility", val: visibilityKm,               icon:"👁️",  color:"#93c5fd", bg:"#dbeafe" },
    { label:"Wind Speed", val: windSpeedKmh,                icon:"💨",  color:"#fcd34d", bg:"#fef3c7" },
    { label:"Humidity",   val: `${stats.humidity}%`,        icon:"💧",  color:"#c4b5fd", bg:"#ede9fe" },
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
