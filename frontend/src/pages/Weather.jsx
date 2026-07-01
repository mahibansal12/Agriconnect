import { useWeather } from "../hooks/useWeather";
import WeatherCard from "../components/weather/WeatherCard";
import ForecastCard from "../components/weather/ForecastCard";
import WeatherStats from "../components/weather/WeatherStats";

function Weather() {
  const { weather, loading, error } = useWeather("Jaipur, Rajasthan");

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#f0fdf4,#dcfce7)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"48px", marginBottom:"14px" }}>🌤️</div>
        <p style={{ color:"#16a34a", fontWeight:600, fontSize:"16px" }}>Loading weather data...</p>
      </div>
    </div>
  );
  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0fdf4" }}>
      <p style={{ color:"#dc2626" }}>{error}</p>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#e0f2fe 100%)",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
    }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 35%,#166534 65%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-50px", right:"150px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px", display:"flex", alignItems:"center", gap:"18px", position:"relative", zIndex:1 }}>
          <div style={{ width:"64px", height:"64px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"30px", backdropFilter:"blur(6px)" }}>🌤️</div>
          <div>
            <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"5px" }}>AgriConnect • Weather</div>
            <h1 style={{ margin:0, color:"#fff", fontSize:"30px", fontWeight:900 }}>Weather Dashboard</h1>
            <p style={{ margin:"7px 0 0", color:"#a7f3d0", fontSize:"14px" }}>Stay updated with current and upcoming weather for your farm.</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px 56px" }}>

        {/* Current + Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"24px", marginBottom:"28px" }}>
          <WeatherCard current={weather.current} location={weather.location} />
          <WeatherStats stats={weather.stats} />
        </div>

        {/* 7-Day Forecast */}
        <div style={{
          background:"#fff", borderRadius:"20px",
          border:"2px solid #bbf7d0",
          boxShadow:"0 4px 20px rgba(22,163,74,0.10)",
          padding:"22px 24px",
        }}>
          <h2 style={{ margin:"0 0 18px", fontSize:"17px", fontWeight:800, color:"#14532d", display:"flex", alignItems:"center", gap:"8px" }}>
            📅 7-Day Forecast
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"12px" }}>
            {weather.forecast.map((day, i) => <ForecastCard key={i} day={day} />)}
          </div>
        </div>

        {/* Farm tip banner */}
        <div style={{
          marginTop:"24px",
          background:"linear-gradient(135deg,#dcfce7,#d1fae5)",
          border:"2px solid #86efac",
          borderRadius:"18px",
          padding:"18px 24px",
          display:"flex", alignItems:"center", gap:"16px",
        }}>
          <div style={{ fontSize:"28px" }}>🌱</div>
          <div>
            <p style={{ margin:0, fontWeight:700, color:"#14532d", fontSize:"14px" }}>Farming Tip</p>
            <p style={{ margin:"4px 0 0", color:"#4b7a5c", fontSize:"13px" }}>
              Check rain chances before scheduling irrigation — avoid overwatering when rainfall is above 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Weather;