import { Link } from "react-router-dom";
import DonationProgress from "./DonationProgress";

const causeLabels = {
  education: "🎓 Education",
  healthcare: "🏥 Healthcare",
  "disaster relief": "🌊 Disaster Relief",
  equipment: "🚜 Equipment",
};

function DonationCard({ campaign }) {
  const percent = Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100);

  return (
    <Link
      to={`/donations/${campaign._id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-green-100 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img
          src={campaign.photo}
          alt={campaign.farmerName}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-white/90 text-green-700 font-medium">
          {causeLabels[campaign.cause] || campaign.cause}
        </span>
        {percent >= 90 && (
          <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-amber-500 text-white font-medium">
            Almost there!
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-green-800">{campaign.farmerName}</h3>
        <p className="text-xs text-gray-400 mb-2">{campaign.location}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{campaign.story}</p>
        <DonationProgress raised={campaign.raised} goal={campaign.goal} />
      </div>
    </Link>
  );
}

export default DonationCard;