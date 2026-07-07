import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
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
  const [donation, setDonation] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(`/v1/donations/${id}`);
        setDonation(res.data.data);
      } catch (err) {
        console.error("DonationDetail fetch error:", err);
        setError(err.response?.status === 404 ? "Donation not found." : "Failed to load donation details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDonation();
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", padding:"40px 48px", minHeight:"120px" }}>
        <div style={{ width:"160px", height:"14px", borderRadius:"8px", background:"rgba(255,255,255,0.15)", marginBottom:"14px" }} />
        <div style={{ width:"300px", height:"28px", borderRadius:"8px", background:"rgba(255,255,255,0.2)" }} />
      </div>
      <div style={{ maxWidth:"900px", margin:"40px auto", padding:"0 40px" }}>
        <div style={{ height:"300px", borderRadius:"22px", background:"linear-gradient(90deg,#f0fdf4,#dcfce7,#f0fdf4)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !donation) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"100px 20px" }}>
        <div style={{ fontSize:"56px", marginBottom:"16px" }}>💚</div>
        <p style={{ color:"#374151", fontWeight:700, fontSize:"16px", marginBottom:"8px" }}>{error || "Donation not found."}</p>
        <Link to="/donations" style={{ marginTop:"12px", display:"inline-flex", alignItems:"center", gap:"6px", color:"#166534", fontWeight:700, padding:"10px 20px", borderRadius:"12px", background:"#dcfce7", border:"1.5px solid #86efac", textDecoration:"none", fontSize:"13px" }}>
          ← Back to Donations
        </Link>
      </div>
    </div>
  );

  const cat = causeStyle[donation.cause] || causeStyle.general;
  const statusColor = {
    completed: { bg:"#dcfce7", text:"#166534", border:"#86efac", icon:"✅" },
    pending:   { bg:"#fef3c7", text:"#92400e", border:"#fcd34d", icon:"⏳" },
    failed:    { bg:"#fee2e2", text:"#991b1b", border:"#fca5a5", icon:"❌" },
  }[donation.status] || { bg:"#f3f4f6", text:"#374151", border:"#d1d5db", icon:"📄" };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ background:"linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-40px", right:"120px", width:"180px", height:"180px", borderRadius:"50%", background:"rgba(134,239,172,0.07)", pointerEvents:"none" }} />
        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"28px 40px", position:"relative", zIndex:1 }}>
          <Link to="/donations" style={{ display:"inline-flex", alignItems:"center", gap:"6px", color:"#86efac", fontSize:"13px", fontWeight:600, textDecoration:"none", marginBottom:"20px", padding:"7px 14px", borderRadius:"999px", background:"rgba(255,255,255,0.10)", border:"1.5px solid rgba(134,239,172,0.3)", backdropFilter:"blur(6px)" }}>
            ← Back to all donations
          </Link>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"56px", height:"56px", background:"rgba(255,255,255,0.12)", border:"2px solid rgba(134,239,172,0.4)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", backdropFilter:"blur(6px)" }}>
              {cat.icon}
            </div>
            <div>
              <span style={{ background:cat.bg, color:cat.text, border:`1.5px solid ${cat.border}`, borderRadius:"999px", padding:"3px 12px", fontSize:"10px", fontWeight:700, textTransform:"capitalize", display:"inline-block", marginBottom:"7px" }}>
                {cat.icon} {donation.cause}
              </span>
              <h1 style={{ margin:0, color:"#fff", fontSize:"28px", fontWeight:900 }}>
                Donation by {donation.donorName}
              </h1>
              <p style={{ margin:"5px 0 0", color:"#a7f3d0", fontSize:"13px" }}>
                ₹{donation.amount?.toLocaleString("en-IN")} contribution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 40px 56px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

          {/* Stats row */}
          <div style={{ background:"#fff", borderRadius:"22px", overflow:"hidden", border:`2px solid ${cat.border}`, boxShadow:`0 8px 32px ${cat.border}44` }}>
            <div style={{ height:"5px", background:`linear-gradient(90deg,${cat.text},${cat.border})` }} />
            <div style={{ padding:"28px 32px" }}>
              <h3 style={{ margin:"0 0 20px", fontSize:"15px", fontWeight:800, color:"#14532d" }}>💰 Donation Details</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom: donation.paymentId ? "20px" : 0 }}>
                {[
                  { label:"Amount", val:`₹${donation.amount?.toLocaleString("en-IN") || "—"}`, icon:"💰", color:"#16a34a", bg:"#dcfce7", border:"#86efac" },
                  { label:"Cause",  val:donation.cause, icon:cat.icon, color:cat.text, bg:cat.bg, border:cat.border },
                  { label:"Status", val:donation.status, icon:statusColor.icon, color:statusColor.text, bg:statusColor.bg, border:statusColor.border },
                ].map(item => (
                  <div key={item.label} style={{ background:item.bg, border:`1.5px solid ${item.border}`, borderRadius:"14px", padding:"14px", textAlign:"center" }}>
                    <div style={{ fontSize:"20px", marginBottom:"5px" }}>{item.icon}</div>
                    <div style={{ fontSize:"14px", fontWeight:800, color:item.color, textTransform:"capitalize" }}>{item.val}</div>
                    <div style={{ fontSize:"10px", color:"#9ca3af", marginTop:"2px" }}>{item.label}</div>
                  </div>
                ))}
              </div>
              {donation.paymentId && (
                <div style={{ background:"#f0fdf4", border:"1.5px solid #bbf7d0", borderRadius:"12px", padding:"12px 16px", fontSize:"12px", color:"#374151" }}>
                  <strong style={{ color:"#14532d" }}>Payment ID:</strong> {donation.paymentId}
                </div>
              )}
            </div>
          </div>

          {/* Donor info */}
          <div style={{ background:"#fff", borderRadius:"20px", border:"2px solid #bbf7d0", boxShadow:"0 4px 16px rgba(22,163,74,0.10)", padding:"24px 28px" }}>
            <h3 style={{ margin:"0 0 14px", fontSize:"15px", fontWeight:800, color:"#14532d" }}>👤 Donor Information</h3>
            {[
              { label:"Donor Name", val:donation.donorName || "Anonymous", icon:"👤" },
              { label:"Cause",      val:donation.cause,                    icon:cat.icon },
              { label:"Status",     val:donation.status,                   icon:statusColor.icon },
              ...(donation.createdAt ? [{ label:"Date", val:new Date(donation.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" }), icon:"📅" }] : []),
            ].map(item => (
              <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid #f3f4f6" }}>
                <span style={{ fontSize:"12px", color:"#9ca3af", display:"flex", alignItems:"center", gap:"6px" }}><span>{item.icon}</span>{item.label}</span>
                <span style={{ fontSize:"12px", fontWeight:700, color:"#1f2937", textTransform:"capitalize" }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* Trust note */}
          <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:"14px", padding:"14px 16px", display:"flex", alignItems:"flex-start", gap:"10px" }}>
            <span style={{ fontSize:"18px" }}>🔒</span>
            <p style={{ margin:0, fontSize:"11px", color:"#4b7a5c", lineHeight:1.6 }}>
              Donations are processed securely via Razorpay. Your payment details are encrypted and never stored on our servers.
            </p>
          </div>

          {/* Back to campaigns */}
          <div style={{ textAlign:"center" }}>
            <Link to="/donations" style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"12px 24px", borderRadius:"12px", background:"linear-gradient(135deg,#14532d,#16a34a)", color:"#fff", fontWeight:700, textDecoration:"none", fontSize:"14px", boxShadow:"0 4px 16px rgba(22,163,74,0.3)" }}>
              💚 View All Campaigns
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DonationDetail;
