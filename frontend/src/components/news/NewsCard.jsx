import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatters";

const categoryStyle = {
  government: { bg:"#dbeafe", text:"#1d4ed8", border:"#93c5fd", icon:"🏛️" },
  market:     { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", icon:"📈" },
  weather:    { bg:"#e0f2fe", text:"#0c4a6e", border:"#7dd3fc", icon:"🌦️" },
  technology: { bg:"#ede9fe", text:"#4c1d95", border:"#c4b5fd", icon:"💡" },
  general:    { bg:"#d1fae5", text:"#064e3b", border:"#6ee7b7", icon:"🌾" },
};

function NewsCard({ article, featured }) {
  const cat = categoryStyle[article.category] || categoryStyle.general;

  if (featured) {
    return (
     <Link 
        to={article.isLive ? article.sourceUrl : `/news/${article._id}`}
        target={article.isLive ? "_blank" : "_self"}
        rel={article.isLive ? "noopener noreferrer" : undefined}
        style={{ textDecoration:"none", display:"block" }}
>
        <div style={{
          borderRadius:"22px", overflow:"hidden",
          border:`2px solid ${cat.border}`,
          boxShadow:`0 8px 32px ${cat.border}44`,
          display:"grid", gridTemplateColumns:"1.2fr 1fr",
          background:"#fff",
          transition:"transform 0.2s, box-shadow 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 16px 48px ${cat.border}66`; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 8px 32px ${cat.border}44`; }}
        >
          <div style={{ position:"relative", height:"260px" }}>
<img
  src={article.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format"}
  alt={article.title}
  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
  onError={(e) => {
    e.target.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format";
  }}
/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(0,0,0,0.1),transparent)" }} />
            <div style={{ position:"absolute", top:"14px", left:"14px" }}>
              <span style={{ background:"rgba(255,255,255,0.92)", border:`1.5px solid ${cat.border}`, borderRadius:"999px", padding:"4px 12px", fontSize:"11px", fontWeight:700, color:cat.text }}>
                {cat.icon} Featured
              </span>
            </div>
          </div>
          <div style={{ padding:"28px 28px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", background:cat.bg, color:cat.text, border:`1.5px solid ${cat.border}`, borderRadius:"999px", padding:"4px 12px", fontSize:"11px", fontWeight:700, marginBottom:"14px", width:"fit-content", textTransform:"capitalize" }}>
              {cat.icon} {article.category}
            </span>
            <h2 style={{ margin:"0 0 12px", fontSize:"20px", fontWeight:800, color:"#111827", lineHeight:1.3 }}>{article.title}</h2>
            <p style={{ margin:"0 0 16px", fontSize:"13px", color:"#6b7280", lineHeight:1.65, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.content}</p>
            <div style={{ fontSize:"11px", color:"#9ca3af", fontWeight:500 }}>{formatDate(article.createdAt)}</div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
  to={article.isLive ? article.sourceUrl : `/news/${article._id}`}
  target={article.isLive ? "_blank" : "_self"}
  rel={article.isLive ? "noopener noreferrer" : undefined}
  style={{ textDecoration:"none", display:"block" }}
>
      <div style={{
        borderRadius:"18px", overflow:"hidden",
        border:`2px solid ${cat.border}`,
        background:"#fff",
        boxShadow:`0 3px 14px ${cat.border}33`,
        transition:"transform 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 10px 28px ${cat.border}55`; }}
        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 3px 14px ${cat.border}33`; }}
      >
        <div style={{ position:"relative", height:"160px" }}>
          <img
  src={article.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format"}
  alt={article.title}
  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
  onError={(e) => {
    e.target.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format";
  }}
/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.3),transparent)" }} />
          <span style={{ position:"absolute", top:"10px", left:"10px", background:"rgba(255,255,255,0.92)", border:`1.5px solid ${cat.border}`, borderRadius:"999px", padding:"3px 10px", fontSize:"10px", fontWeight:700, color:cat.text, textTransform:"capitalize" }}>
            {cat.icon} {article.category}
          </span>
        </div>
        <div style={{ padding:"16px 18px 18px" }}>
          <div style={{ height:"4px", background:`linear-gradient(90deg,${cat.text},${cat.border})`, borderRadius:"4px", marginBottom:"12px" }} />
          <h3 style={{ margin:"0 0 8px", fontSize:"15px", fontWeight:800, color:"#111827", lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.title}</h3>
          <p style={{ margin:"0 0 12px", fontSize:"12px", color:"#6b7280", lineHeight:1.6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.content}</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:"11px", color:"#9ca3af" }}>{formatDate(article.createdAt)}</span>
            <span style={{ fontSize:"12px", fontWeight:700, color:cat.text }}>Read more →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default NewsCard;
