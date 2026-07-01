import { useState } from "react";

const presetAmounts = [500, 1000, 2500, 5000];

function DonationForm({ campaignName }) {
  const [amount, setAmount] = useState(1000);
  const [donorName, setDonorName] = useState("");

  const handleDonate = (e) => {
    e.preventDefault();
    alert(`Simulated donation of ₹${amount} to ${campaignName} (payment gateway not wired up yet).`);
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

        {/* Donor name */}
        <div style={{ marginBottom:"20px" }}>
          <label style={{ fontSize:"12px", color:"#6b7280", fontWeight:600, display:"block", marginBottom:"6px" }}>Your Name <span style={{ color:"#d1d5db" }}>(optional)</span></label>
          <input
            type="text"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="For receipt"
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

        {/* Donate button */}
        <button
          onClick={handleDonate}
          style={{
            width:"100%", padding:"15px",
            background:"linear-gradient(135deg,#14532d,#16a34a)",
            color:"#fff", border:"none", borderRadius:"12px",
            fontSize:"15px", fontWeight:800, cursor:"pointer",
            boxShadow:"0 6px 20px rgba(22,163,74,0.35)",
            transition:"transform 0.15s, box-shadow 0.15s",
            fontFamily:"inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(22,163,74,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(22,163,74,0.35)"; }}
        >
          Donate ₹{amount} →
        </button>
      </div>
    </div>
  );
}


export default DonationForm;