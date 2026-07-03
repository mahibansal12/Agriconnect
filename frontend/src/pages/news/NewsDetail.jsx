import { useParams, Link } from "react-router-dom";
import { mockNews } from "../../mockdata/newsMock";
import { formatDate } from "../../utils/formatters";
import Navbar from "../../components/common/Navbar";

const categoryStyle = {
  government: { bg:"#dbeafe", text:"#1d4ed8", border:"#93c5fd", icon:"🏛️" },
  market:     { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", icon:"📈" },
  weather:    { bg:"#e0f2fe", text:"#0c4a6e", border:"#7dd3fc", icon:"🌦️" },
  technology: { bg:"#ede9fe", text:"#4c1d95", border:"#c4b5fd", icon:"💡" },
  general:    { bg:"#d1fae5", text:"#064e3b", border:"#6ee7b7", icon:"🌾" },
};

function NewsDetail() {
  const { id } = useParams();
  const article = mockNews.find((a) => a._id === id);

  if (!article) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0fdf4" }}>
      <p style={{ color:"#6b7280" }}>Article not found.</p>
    </div>
  );

  const cat = categoryStyle[article.category] || categoryStyle.general;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      <Navbar />

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-50px", right:"120px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"28px 40px", position:"relative", zIndex:1 }}>
          <Link to="/news" style={{ display:"inline-flex", alignItems:"center", gap:"6px", color:"#86efac", fontSize:"13px", fontWeight:600, textDecoration:"none", marginBottom:"20px", padding:"7px 14px", borderRadius:"999px", background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(134,239,172,0.3)", backdropFilter:"blur(6px)" }}>
            ← Back to all news
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
            <span style={{ background:cat.bg, color:cat.text, border:`1.5px solid ${cat.border}`, borderRadius:"999px", padding:"4px 14px", fontSize:"11px", fontWeight:700, textTransform:"capitalize" }}>
              {cat.icon} {article.category}
            </span>
            <span style={{ color:"#6ee7b7", fontSize:"12px" }}>{formatDate(article.createdAt)}</span>
          </div>
          <h1 style={{ margin:0, color:"#fff", fontSize:"26px", fontWeight:900, lineHeight:1.3, maxWidth:"700px" }}>{article.title}</h1>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 40px 56px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"28px", alignItems:"start" }}>

          {/* Article card */}
          <div style={{ background:"#fff", borderRadius:"22px", overflow:"hidden", border:`2px solid ${cat.border}`, boxShadow:`0 8px 32px ${cat.border}44` }}>
            <div style={{ position:"relative", height:"300px" }}>
              <img src={article.image} alt={article.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.25),transparent)" }} />
            </div>
            <div style={{ padding:"28px 32px" }}>
              <div style={{ height:"4px", background:`linear-gradient(90deg,${cat.text},${cat.border})`, borderRadius:"4px", marginBottom:"20px" }} />
              <p style={{ margin:0, fontSize:"15px", color:"#374151", lineHeight:1.85 }}>{article.content}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {/* Meta card */}
            <div style={{ background:"#fff", borderRadius:"18px", border:"2px solid #bbf7d0", boxShadow:"0 4px 16px rgba(22,163,74,0.10)", padding:"20px" }}>
              <h3 style={{ margin:"0 0 14px", fontSize:"14px", fontWeight:800, color:"#14532d" }}>📋 Article Info</h3>
              {[
                { label:"Category", val: article.category, icon:"🏷️" },
                { label:"Published", val: formatDate(article.createdAt), icon:"📅" },
              ].map(item => (
                <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f3f4f6" }}>
                  <span style={{ fontSize:"12px", color:"#9ca3af", display:"flex", alignItems:"center", gap:"6px" }}><span>{item.icon}</span>{item.label}</span>
                  <span style={{ fontSize:"12px", fontWeight:700, color:"#1f2937", textTransform:"capitalize" }}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* Back button */}
            <Link to="/news" style={{ display:"block", textDecoration:"none", background:"linear-gradient(135deg,#14532d,#166534)", color:"#fff", borderRadius:"14px", padding:"14px 20px", textAlign:"center", fontSize:"13px", fontWeight:700, boxShadow:"0 4px 16px rgba(22,163,74,0.3)" }}>
              ← Browse More News
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsDetail;