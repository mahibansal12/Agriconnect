function WeatherCard({ current, location }) {
  const isDescriptionUrl = current.icon?.startsWith("http");

  return (
    <div style={{
      background:"linear-gradient(135deg,#14532d,#166534,#065f46)",
      borderRadius:"20px", padding:"28px",
      border:"2px solid #22c55e",
      boxShadow:"0 8px 32px rgba(22,163,74,0.25)",
      color:"#fff", position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:"-30px", right:"-20px", width:"150px", height:"150px", borderRadius:"50%", background:"rgba(134,239,172,0.08)", pointerEvents:"none" }} />
      <div style={{ position:"relative", zIndex:1 }}>
        <p style={{ margin:"0 0 2px", color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase" }}>Weather Today</p>
        <p style={{ margin:"0 0 20px", color:"#a7f3d0", fontSize:"14px" }}>📍 {location || current.city}</p>

        <div style={{ display:"flex", alignItems:"center", gap:"20px", marginBottom:"24px" }}>
          {isDescriptionUrl ? (
            <img src={current.icon} alt={current.description} style={{ width:"80px", height:"80px", filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }} />
          ) : (
            <span style={{ fontSize:"70px", lineHeight:1 }}>☀️</span>
          )}
          <div>
            <p style={{ margin:0, fontSize:"52px", fontWeight:900, lineHeight:1 }}>{current.temperature}°C</p>
            <p style={{ margin:"4px 0 0", color:"#a7f3d0", fontSize:"15px", textTransform:"capitalize" }}>{current.description}</p>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", borderTop:"1px solid rgba(134,239,172,0.25)", paddingTop:"20px" }}>
          {[
            { label:"Humidity", val:`${current.humidity}%`, icon:"💧" },
            { label:"Wind",     val:`${current.windSpeed} km/h`, icon:"💨" },
            { label:"Feels Like", val:`${current.feelsLike}°C`, icon:"🌡️" },
          ].map(item => (
            <div key={item.label} style={{ background:"rgba(255,255,255,0.08)", borderRadius:"12px", padding:"12px", textAlign:"center" }}>
              <div style={{ fontSize:"18px", marginBottom:"4px" }}>{item.icon}</div>
              <div style={{ fontSize:"15px", fontWeight:700 }}>{item.val}</div>
              <div style={{ fontSize:"10px", color:"#86efac", marginTop:"2px" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
