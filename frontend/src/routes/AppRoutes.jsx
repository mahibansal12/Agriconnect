import { Routes, Route, Navigate } from "react-router-dom";


const ComingSoon = ({ name }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "100vh", gap: "12px",
    fontFamily: "sans-serif", color: "#374151",
  }}>
    <span style={{ fontSize: 48 }}>🌾</span>
    <h2 style={{ fontSize: 20, fontWeight: 600 }}>{name}</h2>
    <p style={{ color: "#6B7280", fontSize: 14 }}>This page is being built...</p>
  </div>
);

 import Login    from "../pages/auth/Login";
 import Register from "../pages/auth/Register";



import CropKnowledge       from "../pages/crop-knowledge/CropKnowledge";
import CropKnowledgeDetail from "../pages/crop-knowledge/CropKnowledgeDetail";


export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Public routes ── */}
      <Route path="/"         element={<ComingSoon name="Landing Page" />} />
      <Route path="/login"    element={<Login/>} />
      <Route path="/register" element={<Register/>} />


      {/* ── Crop knowledge (roommate) ── */}
      <Route path="/crop-knowledge"     element={<CropKnowledge />} />
      <Route path="/crop-knowledge/:id" element={<CropKnowledgeDetail />} />

      

    </Routes>
  );
}
