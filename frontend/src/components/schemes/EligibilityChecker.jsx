import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  { value: "subsidy",   label: "Income Support / Subsidy",     icon: "💰" },
  { value: "loan",      label: "Loans / Credit",               icon: "🏦" },
  { value: "insurance", label: "Crop Insurance",               icon: "🛡️" },
  { value: "training",  label: "Training / Skill Development", icon: "📚" },
  { value: "other",     label: "Other Support",                icon: "📋" },
];

const categoryStyle = {
  subsidy:   { bg:"#dcfce7", text:"#166534", border:"#86efac", icon:"💰" },
  loan:      { bg:"#dbeafe", text:"#1d4ed8", border:"#93c5fd", icon:"🏦" },
  insurance: { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", icon:"🛡️" },
  training:  { bg:"#ede9fe", text:"#5b21b6", border:"#c4b5fd", icon:"📚" },
  other:     { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", icon:"📋" },
};

// schemes prop is the live array fetched from the backend by the parent Schemes.jsx
function EligibilityChecker({ schemes = [] }) {
  const [needType, setNeedType] = useState("");
  const [checked, setChecked]   = useState(false);

  const matchingSchemes = schemes.filter((s) => s.category === needType);

  const handleCheck = (e) => {
    e.preventDefault();
    setChecked(true);
  };

  const cat = categoryStyle[needType];

  return (
    <div style={{
      background: "#fff",
      borderRadius: "20px",
      border: "2px solid #bbf7d0",
      boxShadow: "0 4px 20px rgba(22,163,74,0.10)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
        borderBottom: "1.5px solid #bbf7d0",
        padding: "18px 24px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{
          width:"38px", height:"38px", borderRadius:"12px",
          background:"#16a34a", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:"18px",
          boxShadow:"0 3px 10px rgba(22,163,74,0.3)",
        }}>🔍</div>
        <div>
          <h3 style={{ margin:0, fontSize:"15px", fontWeight:800, color:"#14532d" }}>Check Your Eligibility</h3>
          <p style={{ margin:"2px 0 0", fontSize:"12px", color:"#4b7a5c" }}>Find schemes you may qualify for</p>
        </div>
      </div>

      <div style={{ padding:"22px 24px" }}>

        {/* Category buttons */}
        <p style={{ margin:"0 0 12px", fontSize:"11px", color:"#9ca3af", fontWeight:700, letterSpacing:"1px", textTransform:"uppercase" }}>
          What kind of support are you looking for?
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", marginBottom:"20px" }}>
          {categories.map((c) => {
            const active = needType === c.value;
            const sty = categoryStyle[c.value];
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => { setNeedType(c.value); setChecked(false); }}
                style={{
                  display:"flex", alignItems:"center", gap:"7px",
                  padding:"10px 18px", borderRadius:"999px",
                  fontSize:"13px", fontWeight:700, cursor:"pointer",
                  transition:"all 0.18s ease", outline:"none",
                  border: active ? `2px solid ${sty.text}` : "2px solid #d1fae5",
                  background: active ? sty.bg : "#fff",
                  color: active ? sty.text : "#374151",
                  boxShadow: active ? `0 4px 14px ${sty.border}66` : "0 1px 4px rgba(0,0,0,0.06)",
                  transform: active ? "translateY(-2px)" : "scale(1)",
                }}
              >
                <span>{c.icon}</span>{c.label}
              </button>
            );
          })}
        </div>

        {/* Check button */}
        <button
          onClick={handleCheck}
          disabled={!needType}
          style={{
            width:"100%", padding:"13px",
            background: needType ? "linear-gradient(135deg,#14532d,#16a34a)" : "#e5e7eb",
            color: needType ? "#fff" : "#9ca3af",
            border:"none", borderRadius:"12px",
            fontSize:"14px", fontWeight:800,
            cursor: needType ? "pointer" : "not-allowed",
            boxShadow: needType ? "0 4px 16px rgba(22,163,74,0.3)" : "none",
            transition:"all 0.2s", fontFamily:"inherit",
            marginBottom:"16px",
          }}
        >
          {needType ? `Check ${categories.find(c => c.value === needType)?.icon || ""} ${categories.find(c => c.value === needType)?.label} Schemes` : "Select a category above to check"}
        </button>

        {/* Results */}
        {checked && (
          <div>
            {matchingSchemes.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0", color:"#9ca3af" }}>
                <div style={{ fontSize:"36px", marginBottom:"8px" }}>🔍</div>
                <p style={{ margin:0, fontWeight:600, color:"#6b7280" }}>No schemes found for this category right now.</p>
                <p style={{ margin:"4px 0 0", fontSize:"12px" }}>Check back later or try a different category.</p>
              </div>
            ) : (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
                  <span style={{ fontSize:"12px", color:"#4b7a5c", fontWeight:600 }}>✅ You may be eligible for {matchingSchemes.length} scheme{matchingSchemes.length !== 1 ? "s" : ""}:</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {matchingSchemes.map((s) => (
                    <Link
                      key={s._id}
                      to={`/schemes/${s._id}`}
                      style={{ textDecoration:"none", display:"block" }}
                    >
                      <div style={{
                        background: cat ? cat.bg : "#f0fdf4",
                        border: `1.5px solid ${cat ? cat.border : "#86efac"}`,
                        borderRadius:"14px", padding:"14px 16px",
                        transition:"transform 0.15s, box-shadow 0.15s",
                        display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 18px ${cat ? cat.border : "#86efac"}66`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                      >
                        <div>
                          <p style={{ margin:"0 0 3px", fontWeight:800, color:"#1f2937", fontSize:"14px" }}>{s.title}</p>
                          <p style={{ margin:0, fontSize:"12px", color:"#6b7280" }}>{s.benefits.split(",")[0]}</p>
                        </div>
                        <span style={{ fontSize:"13px", fontWeight:700, color: cat ? cat.text : "#166534", flexShrink:0 }}>View →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <p style={{ margin:"16px 0 0", fontSize:"11px", color:"#9ca3af", lineHeight:1.6 }}>
          ⚠️ This is a simplified eligibility check based on scheme category. Always confirm exact eligibility on the official scheme page.
        </p>
      </div>
    </div>
  );
}

export default EligibilityChecker;