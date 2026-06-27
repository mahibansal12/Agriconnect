import { useParams, Link } from "react-router-dom";
import { mockCampaigns } from "../../mockdata/donationsMock";
import DonationProgress from "../../components/donations/DonationProgress";
import DonationForm from "../../components/donations/DonationForm";

function DonationDetail() {
  const { id } = useParams();
  const campaign = mockCampaigns.find((c) => c._id === id);

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-500">Campaign not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <Link to="/donations" className="text-green-700 text-sm mb-4 inline-block">&larr; Back to all campaigns</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100">
          <img src={campaign.photo} alt={campaign.farmerName} className="w-full h-72 object-cover" />
          <div className="p-6">
            <h1 className="text-2xl font-bold text-green-800">{campaign.farmerName}</h1>
            <p className="text-sm text-gray-400 mb-4">{campaign.location}</p>
            <DonationProgress raised={campaign.raised} goal={campaign.goal} />
            <p className="text-gray-700 mt-5 leading-relaxed">{campaign.story}</p>
          </div>
        </div>

        <div>
          <DonationForm campaignName={campaign.farmerName} />
        </div>
      </div>
    </div>
  );
}

export default DonationDetail;