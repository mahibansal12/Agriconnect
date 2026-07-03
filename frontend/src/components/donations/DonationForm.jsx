import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const presetAmounts = [500, 1000, 2500, 5000];

function DonationForm({ campaignName }) {
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDonate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      
      // Simulate a Razorpay/gateway payment ID for demonstration
      const simulatedPaymentId = "pay_" + Math.random().toString(36).substring(2, 12).toUpperCase();

      // Send POST request to /api/v1/donations (verifyJWT route)
      const res = await axiosInstance.post("/v1/donations", {
        amount: Number(amount),
        cause: campaignName || "General Support",
        paymentId: simulatedPaymentId
      });

      if (res.data?.success) {
        setSuccess(true);
        // Refresh page after a brief delay to show the updated transactions list
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error("Donation creation error:", err);
      // Prompt user to log in if auth token is missing or expired
      if (err.response?.status === 401) {
        setError("Please login to make a donation.");
      } else {
        setError(err.response?.data?.message || "Failed to process donation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background:"#fff", borderRadius:"22px", overflow:"hidden", border:"2px solid #bbf7d0", boxShadow:"0 8px 32px rgba(22,163,74,0.12)" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#14532d,#166534)", padding:"18px 22px" }}>
        <h3 style={{ margin:0, color:"#fff", fontSize:"16px", fontWeight:800 }}>💚 Make a Donation</h3>
        <p style={{ margin:"4px 0 0", color:"#a7f3d0", fontSize:"12px" }}>Supporting {campaignName}</p>
      </div>

      <div style={{ padding:"22px" }}>
        {/* Preset amounts */}
        <p style={{ margin:"0 0 10px", fontSize:"12px", color:"#9ca3af", fontWeight:600 }}>SELECT AMOUNT</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginBottom:"16px" }}>
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={loading || success}
              onClick={() => setAmount(amt)}
              style={{
                padding:"10px 4px",
                borderRadius:"10px",
                fontSize:"13px", fontWeight:700,
                cursor:"pointer", border:"none", outline:"none",
                transition:"all 0.15s",
                background: amount === amt ? "linear-gradient(135deg,#14532d,#16a34a)" : "#f0fdf4",
                color: amount === amt ? "#fff" : "#166534",
                boxShadow: amount === amt ? "0 3px 10px rgba(22,163,74,0.3)" : "none",
                border: amount === amt ? "2px solid transparent" : "2px solid #bbf7d0",
              }}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{ marginBottom:"14px" }}>
          <label style={{ fontSize:"12px", color:"#6b7280", fontWeight:600, display:"block", marginBottom:"6px" }}>Custom Amount (₹)</label>
          <input
            type="number"
            min="1"
            disabled={loading || success}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{
              width:"100%", boxSizing:"border-box",
              padding:"11px 14px", borderRadius:"10px",
              border:"2px solid #bbf7d0", fontSize:"14px",
              outline:"none", fontFamily:"inherit", color:"#1f2937",
              transition:"border 0.2s",
            }}
            onFocus={e => e.target.style.border="2px solid #16a34a"}
            onBlur={e => e.target.style.border="2px solid #bbf7d0"}
          />
        </div>

        {/* Error message */}
        {error && (
          <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: 600, marginBottom: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div style={{ color: "#16a34a", fontSize: "12px", fontWeight: 700, marginBottom: "14px" }}>
            🎉 Donation successful! Thank you for your support.
          </div>
        )}

        {/* Donate button */}
        <button
          onClick={handleDonate}
          disabled={loading || success}
          style={{
            width:"100%", padding:"15px",
            background: loading || success ? "#cbd5e1" : "linear-gradient(135deg,#14532d,#16a34a)",
            color:"#fff", border:"none", borderRadius:"12px",
            fontSize:"15px", fontWeight:800, cursor: loading || success ? "not-allowed" : "pointer",
            boxShadow: loading || success ? "none" : "0 6px 20px rgba(22,163,74,0.35)",
            transition:"transform 0.15s, box-shadow 0.15s",
            fontFamily:"inherit",
          }}
          onMouseEnter={e => { if (!loading && !success) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(22,163,74,0.45)"; } }}
          onMouseLeave={e => { if (!loading && !success) { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(22,163,74,0.35)"; } }}
        >
          {loading ? "Processing..." : success ? "Completed ✅" : `Donate ₹${amount} →`}
        </button>
      </div>
    </div>
  );
}

export default DonationForm;