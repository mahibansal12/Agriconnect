import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../../components/common/Navbar";
import useAuth from "../../hooks/useAuth";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const causeStyle = {
  education: { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd", icon: "🎓" },
  healthcare: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", icon: "🏥" },
  "disaster relief": { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc", icon: "🌊" },
  equipment: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d", icon: "🚜" },
  general: { bg: "#dcfce7", text: "#166534", border: "#86efac", icon: "💚" },
};

const presetAmounts = [500, 1000, 2500, 5000];

function CampaignDetail() {
  const { id } = useParams();
  const { user, isFarmer, isBuyer, isLoggedIn } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Donation form state
  const [amount, setAmount] = useState(1000);
  const [donating, setDonating] = useState(false);
  const [donErr, setDonErr] = useState(null);
  const [donOk, setDonOk] = useState(false);

  // ── Fetch campaign ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(`/v1/donation-requests/${id}`);
        setCampaign(res.data.data);
      } catch (err) {
        console.error("CampaignDetail fetch error:", err);
        setError(err.response?.status === 404 ? "Campaign not found." : "Failed to load campaign details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCampaign();
  }, [id]);

  // ── Is this campaign owner? ───────────────────────────────────────────────
  const isOwner = campaign && user && (
    campaign.farmer?._id === user._id ||
    campaign.farmer === user._id
  );

  const remainingAmount = campaign ? Math.max(0, campaign.targetAmount - (campaign.amountRaised || 0)) : 0;

  // ── Donate handler ────────────────────────────────────────────────────────
  const handleDonate = async (e) => {
    e.preventDefault();
    setDonErr(null);
    setDonOk(false);
    if (amount <= 0) { setDonErr("Please enter a valid amount."); return; }
    if (amount > remainingAmount) {
      setDonErr(`The donation amount exceeds the remaining campaign target. Maximum donation allowed is ₹${remainingAmount.toLocaleString("en-IN")}.`);
      return;
    }
    try {
      setDonating(true);

      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) throw new Error("Failed to load payment gateway. Check your internet connection.");

      // 2. Create pending donation & Razorpay order
      const { data: orderData } = await axiosInstance.post("/v1/donations", {
        amount: Number(amount),
        cause: campaign.cause,
        campaignId: campaign._id,
      });

      const { donation, razorpayOrderId, amount: rzpAmount, currency, key } = orderData.data;

      // 3. Open Razorpay Modal
      const rzpOptions = {
        key,
        amount: rzpAmount,
        currency: currency ?? "INR",
        name: "AgriConnect",
        description: `Donation to Campaign: ${campaign.title}`,
        image: "/favicon.svg",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await axiosInstance.post("/v1/donations/verify-payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              donationId: donation._id,
            });

            setDonOk(true);
            // Refresh campaign data to show updated amountRaised
            const updated = await axiosInstance.get(`/v1/donation-requests/${id}`);
            setCampaign(updated.data.data);
          } catch (verifyErr) {
            setDonErr("Payment received but donation verification failed. Please contact support.");
          } finally {
            setDonating(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => setDonating(false),
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } catch (err) {
      console.error("Donation error:", err);
      if (err.response?.status === 401) setDonErr("Please login to donate.");
      else setDonErr(err.response?.data?.message || err.message || "Failed to process donation.");
      setDonating(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ background: "linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", padding: "40px 48px", minHeight: "120px" }}>
        <div style={{ width: "160px", height: "14px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", marginBottom: "14px" }} />
        <div style={{ width: "300px", height: "28px", borderRadius: "8px", background: "rgba(255,255,255,0.2)" }} />
      </div>
      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 40px" }}>
        <div style={{ height: "300px", borderRadius: "22px", background: "linear-gradient(90deg,#f0fdf4,#dcfce7,#f0fdf4)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !campaign) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 20px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>💚</div>
        <p style={{ color: "#374151", fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{error || "Campaign not found."}</p>
        <Link to="/donations" style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", color: "#166534", fontWeight: 700, padding: "10px 20px", borderRadius: "12px", background: "#dcfce7", border: "1.5px solid #86efac", textDecoration: "none", fontSize: "13px" }}>
          ← Back to Donations
        </Link>
      </div>
    </div>
  );

  const cat = causeStyle[campaign.cause] || causeStyle.general;
  const pct = campaign.targetAmount > 0
    ? Math.min(100, Math.round((campaign.amountRaised / campaign.targetAmount) * 100))
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#052e16 0%,#14532d 40%,#166534 70%,#065f46 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "120px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(134,239,172,0.07)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 40px", position: "relative", zIndex: 1 }}>
          <Link to="/donations" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#86efac", fontSize: "13px", fontWeight: 600, textDecoration: "none", marginBottom: "20px", padding: "7px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(134,239,172,0.3)", backdropFilter: "blur(6px)" }}>
            ← Back to all campaigns
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(134,239,172,0.4)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", backdropFilter: "blur(6px)" }}>
              {cat.icon}
            </div>
            <div>
              <span style={{ background: cat.bg, color: cat.text, border: `1.5px solid ${cat.border}`, borderRadius: "999px", padding: "3px 12px", fontSize: "10px", fontWeight: 700, textTransform: "capitalize", display: "inline-block", marginBottom: "7px" }}>
                {cat.icon} {campaign.cause}
              </span>
              <h1 style={{ margin: 0, color: "#fff", fontSize: "28px", fontWeight: 900 }}>{campaign.title}</h1>
              <p style={{ margin: "5px 0 0", color: "#a7f3d0", fontSize: "13px" }}>
                by {campaign.farmer?.name || campaign.farmerName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 40px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "28px", alignItems: "start" }}>

          {/* ── Left: Campaign details ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Main info */}
            <div style={{ background: "#fff", borderRadius: "22px", border: `2px solid ${cat.border}`, boxShadow: `0 8px 32px ${cat.border}44`, overflow: "hidden" }}>
              <div style={{ height: "5px", background: `linear-gradient(90deg,${cat.text},${cat.border})` }} />
              <div style={{ padding: "28px 32px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 800, color: "#14532d" }}>💰 Campaign Progress</h3>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "20px" }}>
                  {[
                    { label: "Target", val: `₹${campaign.targetAmount?.toLocaleString("en-IN")}`, icon: "🎯", color: "#166534", bg: "#dcfce7", border: "#86efac" },
                    { label: "Raised", val: `₹${(campaign.amountRaised || 0).toLocaleString("en-IN")}`, icon: "💰", color: cat.text, bg: cat.bg, border: cat.border },
                    { label: "Funded", val: `${pct}%`, icon: "📊", color: "#0369A1", bg: "#dbeafe", border: "#93c5fd" },
                  ].map(item => (
                    <div key={item.label} style={{ background: item.bg, border: `1.5px solid ${item.border}`, borderRadius: "14px", padding: "14px", textAlign: "center" }}>
                      <div style={{ fontSize: "20px", marginBottom: "5px" }}>{item.icon}</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: item.color }}>{item.val}</div>
                      <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
                    <span>Progress</span><span style={{ fontWeight: 700, color: cat.text }}>{pct}%</span>
                  </div>
                  <div style={{ height: "10px", borderRadius: "999px", background: "#f0fdf4", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${cat.text},${cat.border})`, borderRadius: "999px", transition: "width 0.5s ease" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {campaign.description && (
              <div style={{ background: "#fff", borderRadius: "20px", border: "2px solid #bbf7d0", boxShadow: "0 4px 16px rgba(22,163,74,0.10)", padding: "24px 28px" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 800, color: "#14532d" }}>📝 About this Campaign</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: 1.7 }}>{campaign.description}</p>
              </div>
            )}

            {/* Farmer Info */}
            <div style={{ background: "#fff", borderRadius: "20px", border: "2px solid #bbf7d0", boxShadow: "0 4px 16px rgba(22,163,74,0.10)", padding: "24px 28px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 800, color: "#14532d" }}>👤 Farmer Information</h3>
              {[
                { label: "Name", val: campaign.farmer?.name || campaign.farmerName, icon: "👤" },
                { label: "Cause", val: campaign.cause, icon: cat.icon },
                { label: "Date", val: new Date(campaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), icon: "📅" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: "12px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "6px" }}><span>{item.icon}</span>{item.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1f2937", textTransform: "capitalize" }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Donation form ── */}
          <div style={{ position: "sticky", top: "24px" }}>

            {/* If campaign owner → can't donate */}
            {isOwner ? (
              <div style={{ background: "#fff", borderRadius: "22px", border: "2px solid #bbf7d0", overflow: "hidden", boxShadow: "0 8px 32px rgba(22,163,74,0.12)" }}>
                <div style={{ background: "linear-gradient(135deg,#14532d,#166534)", padding: "18px 22px" }}>
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 800 }}>💚 Your Campaign</h3>
                </div>
                <div style={{ padding: "28px 22px", textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌾</div>
                  <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#14532d", fontSize: "15px" }}>This is your campaign</p>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px", lineHeight: 1.5 }}>You cannot donate to your own campaign. Share it with others so they can support you!</p>
                </div>
              </div>
            ) : !isLoggedIn ? (
              // Not logged in
              <div style={{ background: "#fff", borderRadius: "22px", border: "2px solid #bbf7d0", overflow: "hidden", boxShadow: "0 8px 32px rgba(22,163,74,0.12)" }}>
                <div style={{ background: "linear-gradient(135deg,#14532d,#166534)", padding: "18px 22px" }}>
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 800 }}>💚 Make a Donation</h3>
                  <p style={{ margin: "4px 0 0", color: "#a7f3d0", fontSize: "12px" }}>Supporting {campaign.title}</p>
                </div>
                <div style={{ padding: "28px 22px", textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔐</div>
                  <p style={{ margin: "0 0 16px", color: "#374151", fontSize: "14px", fontWeight: 600 }}>Please login to donate</p>
                  <Link to="/login" style={{ display: "block", padding: "13px", borderRadius: "12px", background: "linear-gradient(135deg,#14532d,#16a34a)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
                    Login to Donate →
                  </Link>
                </div>
              </div>
            ) : remainingAmount <= 0 ? (
              // Target Achieved card
              <div style={{ background: "#fff", borderRadius: "22px", overflow: "hidden", border: "2px solid #86efac", boxShadow: "0 8px 32px rgba(22,163,74,0.12)" }}>
                <div style={{ background: "linear-gradient(135deg,#14532d,#166534)", padding: "18px 22px", textAlign: "center" }}>
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 800 }}>🎉 Target Achieved!</h3>
                </div>
                <div style={{ padding: "28px 22px", textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏆</div>
                  <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#14532d", fontSize: "15px" }}>Goal Successfully Reached!</p>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px", lineHeight: 1.5 }}>
                    This campaign has successfully reached its target goal of ₹{campaign.targetAmount?.toLocaleString("en-IN")}.
                    Thank you so much to all the donors for your incredible support!
                  </p>
                </div>
              </div>
            ) : (
              // Logged in and not owner → show form
              <div style={{ background: "#fff", borderRadius: "22px", overflow: "hidden", border: "2px solid #bbf7d0", boxShadow: "0 8px 32px rgba(22,163,74,0.12)" }}>
                <div style={{ background: "linear-gradient(135deg,#14532d,#166534)", padding: "18px 22px" }}>
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 800 }}>💚 Make a Donation</h3>
                  <p style={{ margin: "4px 0 0", color: "#a7f3d0", fontSize: "12px" }}>Supporting: {campaign.title}</p>
                </div>
                <div style={{ padding: "22px" }}>
                  {/* Remaining needed note */}
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "8px 12px", marginBottom: "14px", fontSize: "11px", fontWeight: 700, color: "#166534", display: "flex", justifyContent: "space-between" }}>
                    <span>Remaining Needed:</span>
                    <span>₹{remainingAmount.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Preset amounts */}
                  <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>SELECT AMOUNT</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" }}>
                    {presetAmounts.map((amt) => {
                      const isDisabled = donating || donOk || amt > remainingAmount;
                      return (
                        <button key={amt} type="button" disabled={isDisabled} onClick={() => setAmount(amt)} style={{
                          padding: "10px 4px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                          cursor: isDisabled ? "not-allowed" : "pointer", border: "none", outline: "none", transition: "all 0.15s",
                          background: amount === amt ? "linear-gradient(135deg,#14532d,#16a34a)" : amt > remainingAmount ? "#f1f5f9" : "#f0fdf4",
                          color: amount === amt ? "#fff" : amt > remainingAmount ? "#94a3b8" : "#166534",
                          boxShadow: amount === amt ? "0 3px 10px rgba(22,163,74,0.3)" : "none",
                          borderWidth: 2, borderStyle: "solid", borderColor: amount === amt ? "transparent" : amt > remainingAmount ? "#e2e8f0" : "#bbf7d0",
                        }}>₹{amt}</button>
                      );
                    })}
                  </div>
                  {/* Custom amount */}
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: "6px" }}>Custom Amount (₹)</label>
                    <input type="number" min="1" max={remainingAmount} disabled={donating || donOk} value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: "10px", border: "2px solid #bbf7d0", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#1f2937" }}
                    />
                  </div>
                  {donErr && <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: 600, marginBottom: "14px" }}>⚠️ {donErr}</div>}
                  {donOk && <div style={{ color: "#16a34a", fontSize: "12px", fontWeight: 700, marginBottom: "14px" }}>🎉 Donation successful! Thank you for your support.</div>}
                  <button onClick={handleDonate} disabled={donating || donOk} style={{
                    width: "100%", padding: "15px",
                    background: donating || donOk ? "#cbd5e1" : "linear-gradient(135deg,#14532d,#16a34a)",
                    color: "#fff", border: "none", borderRadius: "12px",
                    fontSize: "15px", fontWeight: 800, cursor: donating || donOk ? "not-allowed" : "pointer",
                    boxShadow: donating || donOk ? "none" : "0 6px 20px rgba(22,163,74,0.35)",
                    fontFamily: "inherit",
                  }}>
                    {donating ? "Processing..." : donOk ? "Completed ✅" : `Donate ₹${amount} →`}
                  </button>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignDetail;
