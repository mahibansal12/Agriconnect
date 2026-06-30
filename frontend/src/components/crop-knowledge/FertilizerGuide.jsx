function FertilizerGuide({ fertilizers }) {
  if (!fertilizers || fertilizers.length === 0) return null;
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
        }}>🧪</div>
        <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#14532d" }}>Fertilizer Guide</h3>
      </div>

      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
        <thead>
          <tr style={{ background:"#f0fdf4" }}>
            <th style={{ textAlign:"left", padding:"8px 10px", color:"#16a34a", fontWeight:700, fontSize:"11px", borderRadius:"8px 0 0 8px" }}>Fertilizer</th>
            <th style={{ textAlign:"left", padding:"8px 10px", color:"#16a34a", fontWeight:700, fontSize:"11px" }}>Quantity</th>
            <th style={{ textAlign:"left", padding:"8px 10px", color:"#16a34a", fontWeight:700, fontSize:"11px", borderRadius:"0 8px 8px 0" }}>Timing</th>
          </tr>
        </thead>
        <tbody>
          {fertilizers.map((f, i) => (
            <tr key={i} style={{ borderBottom: i < fertilizers.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <td style={{ padding:"10px", fontWeight:700, color:"#1f2937" }}>{f.name}</td>
              <td style={{ padding:"10px", color:"#6b7280" }}>{f.quantity}</td>
              <td style={{ padding:"10px", color:"#6b7280" }}>{f.timing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FertilizerGuide;