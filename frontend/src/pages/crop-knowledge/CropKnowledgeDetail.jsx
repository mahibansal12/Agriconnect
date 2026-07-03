import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../../components/common/Navbar";
import GrowingGuide from "../../components/crop-knowledge/GrowingGuide";
import FertilizerGuide from "../../components/crop-knowledge/FertilizerGuide";
import IrrigationGuide from "../../components/crop-knowledge/IrrigationGuide";
import DiseaseManagement from "../../components/crop-knowledge/DiseaseManagement";
import HarvestInfo from "../../components/crop-knowledge/HarvestInfo";

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

function CropKnowledgeDetail() {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);              
  const [loading, setLoading] = useState(true);        
  const [error, setError] = useState(null);           

  useEffect(() => {                                    
    const fetchCrop = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/v1/crop-knowledge/${id}`);
        setCrop(response.data.data);
      } catch (err) {
        console.error("Error fetching crop:", err);
        setError(err.response?.data?.message || "Crop not found");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCrop();
  }, [id]);                                           

if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>🌾</div>
          <p style={{ color: "#16a34a", fontWeight: 600 }}>Loading crop details...</p>
        </div>
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0fdf4" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>❌</div>
          <p style={{ color: "#dc2626", fontWeight: 600 }}>{error || "Crop not found"}</p>
        </div>
      </div>
    );
  }

  const cat = categoryStyle[crop.category] || { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", icon:"🌱" };
  const sea = seasonStyle[crop.season]     || { bg:"#f3f4f6", text:"#374151", border:"#d1d5db" };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#f0fdfa 100%)",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
    }}>
      <Navbar />

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"32px 40px 56px" }}>

        {/* Back link */}
        <Link to="/crop-knowledge" style={{
          display:"inline-flex", alignItems:"center", gap:"6px",
          color:"#16a34a", fontSize:"13px", fontWeight:600,
          textDecoration:"none", marginBottom:"20px",
          padding:"7px 14px", borderRadius:"999px",
          background:"#dcfce7", border:"1.5px solid #86efac",
          transition:"all 0.15s",
        }}>
          ← Back to all crops
        </Link>

        {/* ── Hero Card ── */}
        <div style={{
          borderRadius:"22px",
          overflow:"hidden",
          border:`2px solid ${cat.border}`,
          boxShadow:`0 8px 40px ${cat.border}55`,
          marginBottom:"28px",
          position:"relative",
        }}>
          {/* Image */}
          <div style={{ position:"relative", height:"240px" }}>
            <img
              src={crop.image}
              alt={crop.name}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            />
            <div style={{
              position:"absolute", inset:0,
              background:"linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
            }} />

            <div style={{ position:"absolute", bottom:0, left:0, padding:"24px 28px" }}>
              <div style={{
                width:"52px", height:"52px",
                background:"rgba(255,255,255,0.18)",
                border:"2px solid rgba(255,255,255,0.35)",
                borderRadius:"14px",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"26px",
                backdropFilter:"blur(6px)",
                marginBottom:"10px",
                boxShadow:"0 2px 12px rgba(0,0,0,0.2)",
              }}>
                {cat.icon}
              </div>

              <h1 style={{
                margin:"0 0 8px",
                color:"#fff",
                fontSize:"34px", fontWeight:900,
                lineHeight:1.1,
                textShadow:"0 2px 12px rgba(0,0,0,0.4)",
              }}>
                {crop.name}
              </h1>

              <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
                <span style={{
                  padding:"4px 13px", borderRadius:"999px",
                  background: cat.bg, color: cat.text,
                  fontSize:"11px", fontWeight:700,
                  border:`1.5px solid ${cat.border}`,
                }}>
                  {cat.icon} {crop.category}
                </span>
                <span style={{
                  padding:"4px 13px", borderRadius:"999px",
                  background: sea.bg, color: sea.text,
                  fontSize:"11px", fontWeight:700,
                  border:`1.5px solid ${sea.border}`,
                  textTransform:"capitalize",
                }}>
                  {crop.season}
                </span>
              </div>

              <p style={{
                margin:0, color:"rgba(255,255,255,0.88)",
                fontSize:"13px", lineHeight:1.65,
                maxWidth:"380px",
                textShadow:"0 1px 4px rgba(0,0,0,0.3)",
              }}>
                {crop.description}
              </p>
            </div>

            <div style={{
              position:"absolute", bottom:"24px", right:"24px",
              background:"rgba(255,255,255,0.92)",
              backdropFilter:"blur(8px)",
              borderRadius:"14px",
              padding:"10px 16px",
              border:`1.5px solid ${cat.border}`,
              boxShadow:"0 4px 16px rgba(0,0,0,0.12)",
              textAlign:"center",
            }}>
              <div style={{ fontSize:"13px", fontStyle:"italic", color: cat.text, fontWeight:700 }}>
                {cat.icon} {crop.scientificName}
              </div>
              <div style={{ fontSize:"10px", color:"#9ca3af", marginTop:"3px", fontWeight:500 }}>
                Scientific Name
              </div>
            </div>
          </div>
        </div>

        {/* ── Guide Sections Grid ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px" }}>
          <GrowingGuide guide={crop.growingGuide} />
          <IrrigationGuide irrigation={crop.irrigationGuide} />
          <FertilizerGuide fertilizers={crop.fertilizerGuide} />
          <HarvestInfo harvest={crop.harvestInfo} />
        </div>

        {/* Disease full width */}
        <DiseaseManagement diseases={crop.diseaseManagement} />
      </div>
    </div>
  );
}

export default CropKnowledgeDetail;