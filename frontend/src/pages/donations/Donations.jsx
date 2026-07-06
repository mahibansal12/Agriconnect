import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import DonationCampaignCard from "../../components/donations/DonationCampaignCard";
import Navbar from "../../components/common/Navbar";
import useAuth from "../../hooks/useAuth";

const tabs = ["all", "education", "healthcare", "disaster relief", "equipment", "general"];

const tabMeta = {
  all:               { icon: "💚", label: "All",            color: "#166534", bg: "#dcfce7", border: "#86efac" },
  education:         { icon: "🎓", label: "Education",      color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  healthcare:        { icon: "🏥", label: "Healthcare",     color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
  "disaster relief": { icon: "🌊", label: "Disaster Relief",color: "#0c4a6e", bg: "#e0f2fe", border: "#7dd3fc" },
  equipment:         { icon: "🚜", label: "Equipment",      color: "#92400e", bg: "#fef3c7", border: "#fcd34d" },
  general:           { icon: "💚", label: "General",        color: "#166534", bg: "#dcfce7", border: "#86efac" },
};

function Donations() {
  const [activeTab,  setActiveTab]  = useState("all");
  const [campaigns,  setCampaigns]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const { isFarmer, isBuyer, isLoggedIn } = useAuth();

  // ── Fetch approved campaigns ──────────────────────────────────────────────
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/v1/donation-requests");
      setCampaigns(res.data.data || []);
    } catch (err) {
      console.error("Campaigns fetch error:", err);
      setError("Failed to load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  // ── Client-side filter by cause ──────────────────────────────────────────
  const filtered = activeTab === "all"
    ? campaigns
    : campaigns.filter((c) => c.cause === activeTab);

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalRaised = campaigns.reduce((s, c) => s + (c.amountRaised || 0), 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#f0fdfa 100%)",
      fontFamily: "'Segoe UI',system-ui,sans-serif",
    }}>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#052e16 0%,#14532d 35%,#166534 65%,#065f46 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50px", right: "150px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(134,239,172,0.07)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ width: "64px", height: "64px", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(134,239,172,0.4)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", backdropFilter: "blur(6px)" }}>💚</div>
            <div>
              <div style={{ color: "#86efac", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "5px" }}>AgriConnect • Donations</div>
              <h1 style={{ margin: 0, color: "#fff", fontSize: "30px", fontWeight: 900 }}>Support Farmers in Need</h1>
              <p style={{ margin: "7px 0 0", color: "#a7f3d0", fontSize: "14px" }}>Your contribution can change a farmer's life. Every rupee matters.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
            {[
              { val: loading ? "—" : `${campaigns.length}+`, label: "Live Campaigns" },
              { val: loading ? "—" : `₹${(totalRaised / 100000).toFixed(1)}L`, label: "Raised" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(134,239,172,0.3)", borderRadius: "14px", padding: "12px 20px", backdropFilter: "blur(6px)", textAlign: "center" }}>
                <div style={{ color: "#fff", fontSize: "20px", fontWeight: 800 }}>{s.val}</div>
                <div style={{ color: "#6ee7b7", fontSize: "11px", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}

            {/* ── Farmer-only: Raise Campaign CTA ── */}
            {isFarmer && (
              <Link
                to="/dashboard/farmer"
                state={{ tab: "donations" }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "13px 22px", borderRadius: "14px",
                  background: "linear-gradient(135deg,#16a34a,#65A30D)",
                  color: "#fff", fontSize: "13.5px", fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 6px 22px rgba(101,163,13,0.45)",
                  border: "2px solid rgba(134,239,172,0.4)",
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                💚 Raise a Campaign
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "32px 48px 56px" }}>

        {/* Error banner */}
        {error && (
          <div style={{ marginBottom: "24px", padding: "14px 20px", borderRadius: "12px", background: "#fee2e2", border: "1.5px solid #fca5a5", color: "#991b1b", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>⚠️ {error}</span>
            <button onClick={fetchCampaigns} style={{ padding: "6px 14px", borderRadius: "8px", background: "#991b1b", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>Retry</button>
          </div>
        )}

        {/* Impact card */}
        <div style={{
          background: "#fff", borderRadius: "20px",
          border: "2px solid #bbf7d0",
          boxShadow: "0 4px 20px rgba(22,163,74,0.10)",
          padding: "24px 32px", marginBottom: "32px",
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px",
        }}>
          {[
            { icon: "📋", label: "Live Campaigns",  val: loading ? "—" : campaigns.length },
            { icon: "💰", label: "Total Raised",    val: loading ? "—" : `₹${totalRaised.toLocaleString("en-IN")}` },
            { icon: "📊", label: "Showing",         val: loading ? "—" : filtered.length },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center", padding: "10px" }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{item.icon}</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#14532d" }}>{item.val}</div>
              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "3px" }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Farmer CTA banner (only for farmers, different placement for non-logged-in) */}
        {!isLoggedIn && (
          <div style={{
            marginBottom: "28px", padding: "16px 22px",
            borderRadius: "16px", background: "linear-gradient(135deg,#052e16,#166534)",
            border: "1.5px solid #86efac", display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
          }}>
            <div>
              <p style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 15 }}>Are you a farmer in need?</p>
              <p style={{ margin: "4px 0 0", color: "#a7f3d0", fontSize: 12 }}>Login to raise a donation campaign and get support from the community.</p>
            </div>
            <Link to="/login" style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", border: "1.5px solid rgba(134,239,172,0.4)", backdropFilter: "blur(4px)" }}>
              Login / Register →
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center" }}>
          {tabs.map((tab) => {
            const meta = tabMeta[tab];
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "9px 20px", borderRadius: "999px",
                fontSize: "13px", fontWeight: 700, cursor: "pointer",
                border: active ? `2px solid ${meta.color}` : "2px solid #d1fae5",
                background: active ? meta.bg : "#fff",
                color: active ? meta.color : "#374151",
                boxShadow: active ? `0 4px 14px ${meta.border}55` : "0 1px 4px rgba(0,0,0,0.06)",
                transform: active ? "translateY(-2px)" : "scale(1)",
                transition: "all 0.18s ease", outline: "none",
              }}>
                <span>{meta.icon}</span>{meta.label}
              </button>
            );
          })}
          <span style={{ marginLeft: "auto", background: "#dcfce7", color: "#166534", border: "1.5px solid #86efac", padding: "7px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>
            💚 {loading ? "..." : filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "22px" }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} style={{ borderRadius: "20px", overflow: "hidden", background: "#fff", border: "1.5px solid #d1fae5", boxShadow: "0 2px 12px rgba(22,101,52,0.06)" }}>
                <div style={{ height: "120px", background: "linear-gradient(90deg,#f0fdf4,#dcfce7,#f0fdf4)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
                <div style={{ padding: "18px" }}>
                  <div style={{ height: "16px", borderRadius: "8px", background: "#f0fdf4", marginBottom: "10px" }} />
                  <div style={{ height: "12px", borderRadius: "8px", background: "#f0fdf4", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>💚</div>
            <p style={{ color: "#6b7280", fontWeight: 600 }}>No campaigns in this category yet.</p>
            {campaigns.length === 0 && isFarmer && (
              <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "6px" }}>
                Be the first!{" "}
                <Link to="/dashboard/farmer" style={{ color: "#166534", fontWeight: 700 }}>
                  Raise a campaign from your dashboard.
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "22px" }}>
            {filtered.map((campaign) => <DonationCampaignCard key={campaign._id} campaign={campaign} />)}
          </div>
        )}
      </div>

      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

export default Donations;