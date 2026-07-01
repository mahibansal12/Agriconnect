function DonationProgress({ raised, goal }) {
  const percent = Math.min(Math.round((raised / goal) * 100), 100);
  return (
    <div>
      <div style={{ height:"10px", background:"#f0fdf4", borderRadius:"999px", overflow:"hidden", border:"1px solid #bbf7d0" }}>
        <div style={{ height:"100%", width:`${percent}%`, background:"linear-gradient(90deg,#16a34a,#22c55e)", borderRadius:"999px", transition:"width 0.5s ease" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:"8px" }}>
        <span style={{ fontSize:"13px", fontWeight:800, color:"#166534" }}>₹{raised.toLocaleString("en-IN")} raised</span>
        <span style={{ fontSize:"13px", color:"#9ca3af" }}>of ₹{goal.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}

export default DonationProgress;