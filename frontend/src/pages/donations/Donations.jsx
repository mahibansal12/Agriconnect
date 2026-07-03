import { useState } from "react";
import { mockCampaigns } from "../../mockdata/donationsMock";
import DonationCard from "../../components/donations/DonationCard";
import Navbar from "../../components/common/Navbar";

const tabs = ["all", "education", "healthcare", "disaster relief", "equipment"];

const tabMeta = {
  all:             { icon:"💚", label:"All",            color:"#166534", bg:"#dcfce7", border:"#86efac" },
  education:       { icon:"🎓", label:"Education",      color:"#1d4ed8", bg:"#dbeafe", border:"#93c5fd" },
  healthcare:      { icon:"🏥", label:"Healthcare",     color:"#991b1b", bg:"#fee2e2", border:"#fca5a5" },
  "disaster relief":{ icon:"🌊", label:"Disaster Relief",color:"#0c4a6e", bg:"#e0f2fe", border:"#7dd3fc" },
  equipment:       { icon:"🚜", label:"Equipment",      color:"#92400e", bg:"#fef3c7", border:"#fcd34d" },
};

function Donations() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? mockCampaigns : mockCampaigns.filter((c) => c.cause === activeTab);
  const totalRaised = mockCampaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalGoal   = mockCampaigns.reduce((sum, c) => sum + c.goal, 0);
  const overallPct  = Math.round((totalRaised / totalGoal) * 100);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 40%,#ecfdf5 80%,#f0fdfa 100%)",
      fontFamily:"'Segoe UI',system-ui,sans-serif",
    }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 35%,#166534 65%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-50px", right:"150px", width:"200px", height:"200px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"24px", flexWrap:"wrap", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"18px" }}>
            <div style={{ width:"64px", height:"64px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"18px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"30px", backdropFilter:"blur(6px)" }}>💚</div>
            <div>
              <div style={{ color:"#86efac", fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"5px" }}>AgriConnect • Donations</div>
              <h1 style={{ margin:0, color:"#fff", fontSize:"30px", fontWeight:900 }}>Support Farmers in Need</h1>
              <p style={{ margin:"7px 0 0", color:"#a7f3d0", fontSize:"14px" }}>Your contribution can change a farmer's life. Every rupee matters.</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:"20px" }}>
            {[{ val: `${mockCampaigns.length}+`, label:"Campaigns" }, { val:`₹${(totalRaised/100000).toFixed(1)}L`, label:"Raised" }, { val:`${overallPct}%`, label:"Goal Reached" }].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(134,239,172,0.3)", borderRadius:"14px", padding:"12px 20px", backdropFilter:"blur(6px)", textAlign:"center" }}>
                <div style={{ color:"#fff", fontSize:"20px", fontWeight:800 }}>{s.val}</div>
                <div style={{ color:"#6ee7b7", fontSize:"11px", fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1440px", margin:"0 auto", padding:"32px 48px 56px" }}>

        {/* Impact summary card */}
        <div style={{
          background:"#fff", borderRadius:"20px",
          border:"2px solid #bbf7d0",
          boxShadow:"0 4px 20px rgba(22,163,74,0.10)",
          padding:"24px 32px", marginBottom:"32px",
          display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"20px",
        }}>
          {[
            { icon:"📋", label:"Active Campaigns", val: mockCampaigns.length },
            { icon:"💰", label:"Total Raised",     val: `₹${totalRaised.toLocaleString("en-IN")}` },
            { icon:"🎯", label:"Total Goal",        val: `₹${totalGoal.toLocaleString("en-IN")}` },
            { icon:"📊", label:"Overall Progress",  val: `${overallPct}%` },
          ].map((item) => (
            <div key={item.label} style={{ textAlign:"center", padding:"10px" }}>
              <div style={{ fontSize:"24px", marginBottom:"6px" }}>{item.icon}</div>
              <div style={{ fontSize:"20px", fontWeight:800, color:"#14532d" }}>{item.val}</div>
              <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"3px" }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"10px", marginBottom:"28px", flexWrap:"wrap" }}>
          {tabs.map((tab) => {
            const meta = tabMeta[tab];
            const active = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                display:"flex", alignItems:"center", gap:"7px",
                padding:"9px 20px", borderRadius:"999px",
                fontSize:"13px", fontWeight:700, cursor:"pointer",
                border: active ? `2px solid ${meta.color}` : "2px solid #d1fae5",
                background: active ? meta.bg : "#fff",
                color: active ? meta.color : "#374151",
                boxShadow: active ? `0 4px 14px ${meta.border}55` : "0 1px 4px rgba(0,0,0,0.06)",
                transform: active ? "translateY(-2px)" : "scale(1)",
                transition:"all 0.18s ease", outline:"none",
              }}>
                <span>{meta.icon}</span>{meta.label}
              </button>
            );
          })}
          <span style={{ marginLeft:"auto", background:"#dcfce7", color:"#166534", border:"1.5px solid #86efac", padding:"7px 16px", borderRadius:"999px", fontSize:"12px", fontWeight:700 }}>
            💚 {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"22px" }}>
          {filtered.map((campaign) => <DonationCard key={campaign._id} campaign={campaign} />)}
        </div>
      </div>
    </div>
  );
}

export default Donations;