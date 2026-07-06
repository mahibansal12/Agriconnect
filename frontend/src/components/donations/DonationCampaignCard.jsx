import { Link } from "react-router-dom";

const causeColors = {
  education:         { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd", icon: "🎓" },
  healthcare:        { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", icon: "🏥" },
  "disaster relief": { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc", icon: "🌊" },
  equipment:         { bg: "#fef3c7", text: "#92400e", border: "#fcd34d", icon: "🚜" },
  general:           { bg: "#dcfce7", text: "#166534", border: "#86efac", icon: "💚" },
};

function DonationCampaignCard({ campaign }) {
  const cause = campaign.cause || "general";
  const colors = causeColors[cause] || causeColors.general;
  const icon = colors.icon;
  const pct = campaign.targetAmount > 0
    ? Math.min(100, Math.round((campaign.amountRaised / campaign.targetAmount) * 100))
    : 0;

  return (
    <Link
      to={`/donations/campaign/${campaign._id}`}
      style={{
        display: "block",
        background: "#fff",
        borderRadius: "20px",
        border: `2px solid ${colors.border}`,
        boxShadow: `0 4px 20px ${colors.border}55`,
        overflow: "hidden",
        textDecoration: "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 30px ${colors.border}77`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${colors.border}55`; }}
    >
      {/* Header band */}
      <div style={{
        height: "120px",
        background: `linear-gradient(135deg, ${colors.bg}, ${colors.border}88)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "46px", position: "relative",
      }}>
        <span>{icon}</span>
        <span style={{
          position: "absolute", top: 10, left: 10,
          fontSize: 10, fontWeight: 700, padding: "3px 10px",
          borderRadius: 999, background: "rgba(255,255,255,0.92)",
          color: colors.text, textTransform: "capitalize",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
        }}>
          {icon} {cause}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{ margin: "0 0 5px", fontSize: 14, fontWeight: 800, color: "#1f2937", lineHeight: 1.3 }}>
          {campaign.title}
        </h3>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#9ca3af" }}>
          by {campaign.farmer?.name || campaign.farmerName || "Farmer"}
        </p>
        {campaign.description && (
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
          }}>
            {campaign.description}
          </p>
        )}

        {/* Progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginBottom: 5 }}>
            <span style={{ fontWeight: 700, color: colors.text }}>₹{(campaign.amountRaised || 0).toLocaleString("en-IN")} raised</span>
            <span>of ₹{campaign.targetAmount?.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: "#f3f4f6", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: `linear-gradient(90deg, ${colors.text}, ${colors.border})`,
              borderRadius: 999, transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{pct}%</div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid #f3f4f6", paddingTop: 10,
        }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            📅 {new Date(campaign.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>Donate →</span>
        </div>
      </div>
    </Link>
  );
}

export default DonationCampaignCard;
