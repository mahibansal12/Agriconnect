function ForecastCard({ day }) {
  return (
    <div style={{
      background:"#fff", borderRadius:"14px", padding:"14px 10px",
      textAlign:"center",
      border:"2px solid #bbf7d0",
      boxShadow:"0 2px 10px rgba(22,163,74,0.08)",
      transition:"transform 0.18s, box-shadow 0.18s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(22,163,74,0.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 10px rgba(22,163,74,0.08)"; }}
    >
      <p style={{ margin:"0 0 8px", color:"#16a34a", fontSize:"11px", fontWeight:700 }}>{day.day}</p>
      <p style={{ margin:"0 0 8px", fontSize:"28px", lineHeight:1 }}>{day.icon}</p>
      <p style={{ margin:0, fontSize:"13px" }}>
        <span style={{ fontWeight:800, color:"#1f2937" }}>{day.high}°</span>
        <span style={{ color:"#9ca3af" }}>/{day.low}°</span>
      </p>
    </div>
  );
}

export default ForecastCard;
