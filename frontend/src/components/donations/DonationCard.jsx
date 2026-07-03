import { Link } from "react-router-dom";

const causeLabels = {
  education: "🎓 Education",
  healthcare: "🏥 Healthcare",
  "disaster relief": "🌊 Disaster Relief",
  equipment: "🚜 Equipment",
};

const causeColors = {
  education:       { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
  healthcare:      { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  "disaster relief": { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc" },
  equipment:       { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
};

function DonationCard({ campaign: donation }) {
  const cause = donation.cause || "general";
  const label = causeLabels[cause] || `💚 ${cause}`;
  const colors = causeColors[cause] || { bg: "#dcfce7", text: "#166534", border: "#86efac" };

  // Format date
  const dateStr = donation.createdAt 
    ? new Date(donation.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <Link
      to={`/donations/${donation._id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-green-100 hover:-translate-y-1"
    >
      <div 
        style={{ 
          height: "120px", 
          background: `linear-gradient(135deg, ${colors.bg}, ${colors.border}88)`, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: "44px",
          position: "relative"
        }}
      >
        <span>{label.split(" ")[0]}</span>
        <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-bold bg-white/90 shadow-sm" style={{ color: colors.text }}>
          {label}
        </span>
        <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm ${
          donation.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}>
          {donation.status}
        </span>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-gray-800">
            {donation.donorName || "Anonymous Donor"}
          </h3>
          <span className="text-lg font-black text-green-700">
            ₹{donation.amount?.toLocaleString("en-IN")}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Supported {causeLabels[cause] || cause}
        </p>
        <div style={{ height: "1px", background: "#f3f4f6", margin: "12px 0" }} />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>📅 {dateStr}</span>
          <span className="font-semibold text-green-600 group-hover:translate-x-1 transition-transform">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default DonationCard;