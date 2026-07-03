import { useParams, Link } from "react-router-dom";
import { mockCampaigns } from "../../mockdata/donationsMock";
import DonationProgress from "../../components/donations/DonationProgress";
import DonationForm from "../../components/donations/DonationForm";
import Navbar from "../../components/common/Navbar";

const causeStyle = {
  education:        { bg:"#dbeafe", text:"#1d4ed8", border:"#93c5fd", icon:"🎓" },
  healthcare:       { bg:"#fee2e2", text:"#991b1b", border:"#fca5a5", icon:"🏥" },
  "disaster relief":{ bg:"#e0f2fe", text:"#0c4a6e", border:"#7dd3fc", icon:"🌊" },
  equipment:        { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", icon:"🚜" },
  general:          { bg:"#dcfce7", text:"#166534", border:"#86efac", icon:"💚" },
};

function DonationDetail() {
  const { id } = useParams();
  const campaign = mockCampaigns.find((c) => c._id === id);

  if (!campaign) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0fdf4" }}>
      <p style={{ color:"#6b7280" }}>Campaign not found.</p>
    </div>
  );

  const cat = causeStyle[campaign.cause] || causeStyle.general;
  const pct = Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      <Navbar />

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-40px", right:"120px", width:"180px", height:"180px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"28px 40px", position:"relative", zIndex:1 }}>
          <Link to="/donations" style={{ display:"inline-flex", alignItems:"center", gap:"6px", color:"#86efac", fontSize:"13px", fontWeight:600, textDecoration:"none", marginBottom:"20px", padding:"7px 14px", borderRadius:"999px", background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(134,239,172,0.3)", backdropFilter:"blur(6px)" }}>
            ← Back to all campaigns
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"56px", height:"56px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", backdropFilter:"blur(6px)" }}>
              {cat.icon}
            </div>
            <div>
              <span style={{ background:cat.bg, color:cat.text, border:`1.5px solid ${cat.border}`, borderRadius:"999px", padding:"3px 12px", fontSize:"10px", fontWeight:700, textTransform:"capitalize", display:"inline-block", marginBottom:"7px" }}>
                {cat.icon} {campaign.cause}
              </span>
              <h1 style={{ margin:0, color:"#fff", fontSize:"28px", fontWeight:900 }}>{campaign.farmerName}</h1>
              <p style={{ margin:"5px 0 0", color:"#a7f3d0", fontSize:"13px" }}>📍 {campaign.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 40px 56px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:"28px", alignItems:"start" }}>

          {/* Left — campaign detail */}
          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

            {/* Photo + story */}
            <div style={{ background:"#fff", borderRadius:"22px", overflow:"hidden", border:`2px solid ${cat.border}`, boxShadow:`0 8px 32px ${cat.border}44` }}>
              <div style={{ position:"relative", height:"300px" }}>
                <img src={campaign.photo} alt={campaign.farmerName} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.45),transparent)" }} />
                <div style={{ position:"absolute", bottom:"16px", left:"20px" }}>
                  <h2 style={{ margin:0, color:"#fff", fontSize:"22px", fontWeight:800, textShadow:"0 2px 8px rgba(0,0,0,0.4)" }}>{campaign.farmerName}</h2>
                  <p style={{ margin:"4px 0 0", color:"rgba(255,255,255,0.85)", fontSize:"13px" }}>📍 {campaign.location}</p>
                </div>
              </div>
              <div style={{ padding:"24px 28px" }}>
                <div style={{ height:"4px", background:`linear-gradient(90deg,${cat.text},${cat.border})`, borderRadius:"4px", marginBottom:"20px" }} />
                <h3 style={{ margin:"0 0 10px", fontSize:"15px", fontWeight:800, color:"#14532d" }}>📖 Their Story</h3>
                <p style={{ margin:0, fontSize:"14px", color:"#374151", lineHeight:1.85 }}>{campaign.story}</p>
              </div>
            </div>

            {/* Progress card */}
            <div style={{ background:"#fff", borderRadius:"20px", border:"2px solid #bbf7d0", boxShadow:"0 4px 16px rgba(22,163,74,0.10)", padding:"24px 28px" }}>
              <h3 style={{ margin:"0 0 16px", fontSize:"15px", fontWeight:800, color:"#14532d" }}>📊 Campaign Progress</h3>

              {/* Big progress bar */}
              <div style={{ height:"14px", background:"#f0fdf4", borderRadius:"999px", overflow:"hidden", border:"1px solid #bbf7d0", marginBottom:"10px" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#16a34a,#22c55e)", borderRadius:"999px", transition:"width 0.5s ease" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
                <span style={{ fontSize:"14px", fontWeight:800, color:"#166534" }}>₹{campaign.raised.toLocaleString("en-IN")} raised</span>
                <span style={{ fontSize:"14px", color:"#9ca3af" }}>of ₹{campaign.goal.toLocaleString("en-IN")} goal</span>
              </div>

              {/* Stats row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
                {[
                  { label:"Raised",    val:`₹${campaign.raised.toLocaleString("en-IN")}`, icon:"💰", color:"#16a34a", bg:"#dcfce7", border:"#86efac" },
                  { label:"Goal",      val:`₹${campaign.goal.toLocaleString("en-IN")}`,   icon:"🎯", color:"#1d4ed8", bg:"#dbeafe", border:"#93c5fd" },
                  { label:"Progress",  val:`${pct}%`,                                      icon:"📈", color:"#92400e", bg:"#fef3c7", border:"#fcd34d" },
                ].map(item => (
                  <div key={item.label} style={{ background:item.bg, border:`1.5px solid ${item.border}`, borderRadius:"14px", padding:"14px", textAlign:"center" }}>
                    <div style={{ fontSize:"20px", marginBottom:"5px" }}>{item.icon}</div>
                    <div style={{ fontSize:"15px", fontWeight:800, color:item.color }}>{item.val}</div>
                    <div style={{ fontSize:"10px", color:"#9ca3af", marginTop:"2px" }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — donation form */}
          <div style={{ position:"sticky", top:"24px" }}>
            <DonationForm campaignName={campaign.farmerName} />

            {/* Trust note */}
            <div style={{ marginTop:"14px", background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:"14px", padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:"10px" }}>
              <span style={{ fontSize:"18px" }}>🔒</span>
              <p style={{ margin:0, fontSize:"11px", color:"#4b7a5c", lineHeight:1.6 }}>
                Donations are processed securely. This is a simulated payment — no real transaction will occur until the payment gateway is connected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonationDetail;
