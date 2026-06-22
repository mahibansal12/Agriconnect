import { Routes, Route, Navigate } from "react-router-dom";

// ─── Placeholder component ─────────────────────────────────────
// Used for pages not built yet — remove one by one as you build pages
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

// ─── Import real pages as you build them ──────────────────────
 import Login    from "../pages/auth/Login";
 import Register from "../pages/auth/Register";

// Week 2 — YOU build these
// import Landing         from "../pages/Landing";
// import FarmerDashboard from "../pages/dashboard/FarmerDashboard";

// Week 3 — YOU build these
// import Marketplace from "../pages/marketplace/Marketplace";
// import CropDetail  from "../pages/marketplace/CropDetail";
// import AddListing  from "../pages/marketplace/AddListing";

// Week 4 — YOU build these
// import MandiRates from "../pages/MandiRates";

// Week 5 — YOU build these
// import CropRecommendation  from "../pages/recommendations/CropRecommendation";
// import WaterBasedSuggestion from "../pages/recommendations/WaterBasedSuggestion";
// import SeedRecommendation  from "../pages/recommendations/SeedRecommendation";
// import Calculators         from "../pages/Calculators";

// Week 6 — YOU build these
// import AIAssistant from "../pages/AIAssistant";

// ─── ROOMMATE pages (import when roommate finishes them) ───────
import CropKnowledge       from "../pages/crop-knowledge/CropKnowledge";
import CropKnowledgeDetail from "../pages/crop-knowledge/CropKnowledgeDetail";
// import Weather             from "../pages/Weather";
// import News                from "../pages/news/News";
// import NewsDetail          from "../pages/news/NewsDetail";
// import Schemes             from "../pages/schemes/Schemes";
// import SchemeDetail        from "../pages/schemes/SchemeDetail";
// import ShopFinder          from "../pages/ShopFinder";
// import Donations           from "../pages/donations/Donations";
// import DonationDetail      from "../pages/donations/DonationDetail";
// import PestLibrary         from "../pages/pest-library/PestLibrary";
// import PestDetail          from "../pages/pest-library/PestDetail";
// import Community           from "../pages/community/Community";
// import PostDetail          from "../pages/community/PostDetail";
// import CropCalendarPage    from "../pages/CropCalendarPage";
// import BuyerDashboard      from "../pages/dashboard/BuyerDashboard";
// import AdminDashboard      from "../pages/dashboard/AdminDashboard";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Public routes ── */}
      <Route path="/"         element={<ComingSoon name="Landing Page" />} />
      <Route path="/login"    element={<ComingSoon name="Login" />} />
      <Route path="/register" element={<ComingSoon name="Register" />} />

      {/* ── Marketplace ── */}
      <Route path="/marketplace"        element={<ComingSoon name="Marketplace" />} />
      <Route path="/marketplace/:id"    element={<ComingSoon name="Crop Detail" />} />
      <Route path="/marketplace/add"    element={<ComingSoon name="Add Listing" />} />

      {/* ── Mandi rates ── */}
      <Route path="/mandi" element={<ComingSoon name="Mandi Rates" />} />

      {/* ── Crop knowledge (roommate) ── */}
      <Route path="/crop-knowledge"     element={<ComingSoon name="Crop Knowledge" />} />
      <Route path="/crop-knowledge/:id" element={<ComingSoon name="Crop Detail" />} />

      {/* ── Recommendations ── */}
      <Route path="/recommendations/crop"  element={<ComingSoon name="Crop Recommendation" />} />
      <Route path="/recommendations/water" element={<ComingSoon name="Water-Based Suggestion" />} />
      <Route path="/recommendations/seed"  element={<ComingSoon name="Seed Recommendation" />} />

      {/* ── Weather (roommate) ── */}
      <Route path="/weather" element={<ComingSoon name="Weather Dashboard" />} />

      {/* ── News (roommate) ── */}
      <Route path="/news"     element={<ComingSoon name="Agriculture News" />} />
      <Route path="/news/:id" element={<ComingSoon name="News Detail" />} />

      {/* ── Schemes (roommate) ── */}
      <Route path="/schemes"     element={<ComingSoon name="Government Schemes" />} />
      <Route path="/schemes/:id" element={<ComingSoon name="Scheme Detail" />} />

      {/* ── Shop finder (roommate) ── */}
      <Route path="/shops" element={<ComingSoon name="Nearby Shops" />} />

      {/* ── Donations (roommate) ── */}
      <Route path="/donations"     element={<ComingSoon name="Donations" />} />
      <Route path="/donations/:id" element={<ComingSoon name="Donation Detail" />} />

      {/* ── Calculators ── */}
      <Route path="/calculators" element={<ComingSoon name="Calculators" />} />

      {/* ── Pest library (roommate) ── */}
      <Route path="/pests"     element={<ComingSoon name="Pest Library" />} />
      <Route path="/pests/:id" element={<ComingSoon name="Pest Detail" />} />

      {/* ── Crop calendar (roommate) ── */}
      <Route path="/calendar" element={<ComingSoon name="Crop Calendar" />} />

      {/* ── Community (roommate) ── */}
      <Route path="/community"     element={<ComingSoon name="Community Forum" />} />
      <Route path="/community/:id" element={<ComingSoon name="Post Detail" />} />

      {/* ── AI Assistant ── */}
      <Route path="/ai-assistant" element={<ComingSoon name="AI Farming Assistant" />} />

      {/* ── Dashboards ── */}
      <Route path="/farmer/dashboard" element={<ComingSoon name="Farmer Dashboard" />} />
      <Route path="/buyer/dashboard"  element={<ComingSoon name="Buyer Dashboard" />} />
      <Route path="/admin/dashboard"  element={<ComingSoon name="Admin Dashboard" />} />

      {/* ── Catch all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
