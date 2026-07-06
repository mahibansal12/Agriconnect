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

import Landing         from "../pages/Landing";
import FarmerDashboard from "../pages/dashboard/FarmerDashboard";

import Marketplace from "../pages/marketplace/Marketplace";
import CropDetail  from "../pages/marketplace/CropDetail";
import AddListing  from "../pages/marketplace/AddListing";
import PrivateRoute from '../components/common/PrivateRoute';
import RoleRoute    from '../components/common/RoleRoute';

import MandiRates from "../pages/MandiRates";

import CropRecommendation  from "../pages/recommendations/CropRecommendation";
import WaterBasedRecommendation from "../pages/recommendations/WaterBasedRecommendation";
import SeedRecommendation  from "../pages/recommendations/SeedRecommendation";
import Calculators         from "../pages/Calculators";

import AdminRoutes from './AdminRoutes';
import FarmerRoutes from './FarmerRoutes';
import BuyerRoutes from './BuyerRoutes';

import AIAssistant from "../pages/AIAssistant";


import CropKnowledge       from "../pages/crop-knowledge/CropKnowledge";
import CropKnowledgeDetail from "../pages/crop-knowledge/CropKnowledgeDetail";
import Weather              from "../pages/Weather";
import News from "../pages/news/News";
import NewsDetail from "../pages/news/NewsDetail";
import Schemes from "../pages/schemes/Schemes";
import SchemeDetail from "../pages/schemes/SchemeDetail";
import Donations from "../pages/donations/Donations";
import DonationDetail from "../pages/donations/DonationDetail";
import CampaignDetail from "../pages/donations/CampaignDetail";
import PestLibrary from "../pages/pest-library/PestLibrary";
import PestDetail from "../pages/pest-library/PestDetail";
import ShopFinder from "../pages/ShopFinder";
import Community from "../pages/community/Community";
import PostDetail from "../pages/community/PostDetail";
import CropCalendarPage from "../pages/CropCalendarPage";


export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Public routes ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login"    element={<Login/>} />
      <Route path="/register" element={<Register/>} />

      {/* ── Marketplace ── */}
      <Route path="/marketplace"        element={<Marketplace />} />
      <Route path="/marketplace/:id"    element={<CropDetail />} />
      <Route path="/marketplace/add"    element={<AddListing />} />
      <Route path="/marketplace/edit/:id" element={<AddListing />} />

      <Route path="/mandi" element={<MandiRates />} />
      <Route
        path="/dashboard/farmer"
        element={
        <PrivateRoute>
          <RoleRoute role="farmer">
            <FarmerDashboard />
          </RoleRoute>
        </PrivateRoute>
        }
      />

      <Route path="/recommendations/crop"  element={<CropRecommendation />}   />
      <Route path="/recommendations/water" element={<WaterBasedRecommendation />} />
      <Route path="/recommendations/seed"  element={<SeedRecommendation />}   />
      <Route path="/calculators"           element={<Calculators />}          />

      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/farmer/*" element={<FarmerRoutes />} />
      <Route path="/buyer/*" element={<BuyerRoutes />} />

      <Route path="/ai-assistant" element={<AIAssistant />} />
      {/* ── Crop knowledge */}
      <Route path="/crop-knowledge"     element={<CropKnowledge />} />
      <Route path="/crop-knowledge/:id" element={<CropKnowledgeDetail />} />

      {/* ── Weather  ── */}
      <Route path="/weather" element={<Weather />} />

      {/* ── News  ── */}
      <Route path="/news" element={<News />} />
      <Route path="/news/:id" element={<NewsDetail />} /> 
        
      {/* ── Schemes  ── */}
      <Route path="/schemes" element={<Schemes />} />
      <Route path="/schemes/:id" element={<SchemeDetail />} />  

      {/* ── Donations ── */}
      <Route path="/donations" element={<Donations />} />
      <Route path="/donations/campaign/:id" element={<CampaignDetail />} />
      <Route path="/donations/:id" element={<DonationDetail />} />

      {/* ── Pest library (roommate) ── */}
      <Route path="/pests" element={<PestLibrary />} />
      <Route path="/pests/:id" element={<PestDetail />} />

      {/* ── Shop finder ── */}
      <Route path="/shops" element={<ShopFinder />} />

      {/* ── Community ── */}
      <Route path="/community" element={<Community />} />
      <Route path="/community/:id" element={<PostDetail />} />

      {/* ── Crop Calendar ── */}
      <Route path="/calendar" element={<CropCalendarPage />} />
      

      {/* ── Catch all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
  );
}
