import { Link } from "react-router-dom";

const categoryStyle = {
  grain:       { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", icon:"🌾" },
  pulse:       { bg:"#d1fae5", text:"#065f46", border:"#6ee7b7", icon:"🫛" },
  fruit:       { bg:"#ffedd5", text:"#c2410c", border:"#fdba74", icon:"🍋" },
  vegetable:   { bg:"#dcfce7", text:"#166534", border:"#86efac", icon:"🥦" },
  spice:       { bg:"#fee2e2", text:"#991b1b", border:"#fca5a5", icon:"🌶️" },
  "cash crop": { bg:"#dbeafe", text:"#1d4ed8", border:"#93c5fd", icon:"💰" },
};

const seasonStyle = {
  rabi:   { bg:"#ede9fe", text:"#5b21b6", border:"#c4b5fd" },
  kharif: { bg:"#fef9c3", text:"#854d0e", border:"#fde047" },
  zaid:   { bg:"#cffafe", text:"#164e63", border:"#67e8f9" },
};

function CropInfoCard({ crop }) {
  const cat = categoryStyle[crop.category] || { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", icon:"🌱" };
  const sea = seasonStyle[crop.season]    || { bg:"#f3f4f6", text:"#374151", border:"#d1d5db" };

  return (
    <Link
      to={`/crop-knowledge/${crop._id}`}
      style={{ textDecoration:"none", display:"block" }}
    >
      <div
        style={{
          background:"#fff",
          borderRadius:"20px",
          border:`2px solid ${cat.border}`,
          overflow:"hidden",
          boxShadow:`0 4px 20px ${cat.border}44`,
          transition:"transform 0.2s ease, box-shadow 0.2s ease",
          cursor:"pointer",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = `0 12px 36px ${cat.border}66`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = `0 4px 20px ${cat.border}44`;
        }}
      >
        {/* Image */}
        <div style={{ position:"relative", height:"180px", overflow:"hidden" }}>
          <img
            src={crop.image}
            alt={crop.name}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          />
          {/* Gradient overlay */}
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
          }} />

          {/* Category badge on image */}
          <div style={{
            position:"absolute", top:"12px", left:"12px",
            background:"rgba(255,255,255,0.92)",
            border:`1.5px solid ${cat.border}`,
            borderRadius:"999px",
            padding:"4px 11px",
            fontSize:"11px", fontWeight:700,
            color: cat.text,
            display:"flex", alignItems:"center", gap:"5px",
            backdropFilter:"blur(4px)",
            boxShadow:"0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <span>{cat.icon}</span>
            <span style={{ textTransform:"capitalize" }}>{crop.category}</span>
          </div>

          {/* Local name on image bottom right */}
          <div style={{
            position:"absolute", bottom:"10px", right:"12px",
            color:"rgba(255,255,255,0.88)",
            fontSize:"11px", fontWeight:600,
            textShadow:"0 1px 4px rgba(0,0,0,0.5)",
          }}>
            {crop.localName}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:"18px 20px 20px" }}>

          {/* Name + Season */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px", marginBottom:"10px" }}>
            <h3 style={{
              margin:0,
              fontSize:"17px", fontWeight:800,
              color:"#111827",
              lineHeight:1.25,
              flex:1,
            }}>
              {crop.name}
            </h3>
            <span style={{
              flexShrink:0,
              background: sea.bg,
              color: sea.text,
              border:`1.5px solid ${sea.border}`,
              borderRadius:"999px",
              padding:"3px 11px",
              fontSize:"10px", fontWeight:700,
              textTransform:"capitalize",
              marginTop:"2px",
            }}>
              {crop.season}
            </span>
          </div>

          {/* Scientific name */}
          {crop.scientificName && (
            <div style={{
              fontSize:"11px", color:"#9ca3af",
              fontStyle:"italic", marginBottom:"12px",
              letterSpacing:"0.2px",
            }}>
              {crop.scientificName}
            </div>
          )}

          {/* Divider */}
          <div style={{ height:"1px", background:`linear-gradient(90deg, ${cat.border}88, transparent)`, marginBottom:"12px" }} />

          {/* Description */}
          <p style={{
            margin:0,
            fontSize:"13px",
            color:"#6b7280",
            lineHeight:1.65,
            display:"-webkit-box",
            WebkitLineClamp:2,
            WebkitBoxOrient:"vertical",
            overflow:"hidden",
          }}>
            {crop.description}
          </p>

          {/* View Details CTA */}
          <div style={{
            marginTop:"16px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div style={{ display:"flex", gap:"6px" }}>
              {crop.growingGuide?.soilType && (
                <span style={{
                  fontSize:"10px", color:"#6b7280",
                  background:"#f3f4f6", borderRadius:"6px",
                  padding:"3px 8px", fontWeight:500,
                }}>
                  🪱 {crop.growingGuide.soilType.split(",")[0]}
                </span>
              )}
            </div>
            <span style={{
              fontSize:"12px", fontWeight:700,
              color: cat.text,
              display:"flex", alignItems:"center", gap:"4px",
            }}>
              View Guide →
            </span>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div style={{
          height:"4px",
          background:`linear-gradient(90deg, ${cat.text}, ${cat.border})`,
        }} />
      </div>
    </Link>
  );
}

export default CropInfoCard;
