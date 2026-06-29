import { useState } from "react";
import { mockCampaigns } from "../../mockdata/donationsMock";
import DonationCard from "../../components/donations/DonationCard";

const tabs = ["all", "education", "healthcare", "disaster relief", "equipment"];

function Donations() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? mockCampaigns : mockCampaigns.filter((c) => c.cause === activeTab);
  const totalRaised = mockCampaigns.reduce((sum, c) => sum + c.raised, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <h1 className="text-3xl font-bold text-green-800 mb-1">Support Farmers in Need</h1>
      <p className="text-gray-600 mb-6">Your contribution can change a farmer's life.</p>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 mb-8 flex flex-wrap gap-8">
        <div><p className="text-2xl font-bold text-green-700">{mockCampaigns.length}+</p><p className="text-sm text-gray-500">Active Campaigns</p></div>
        <div><p className="text-2xl font-bold text-green-700">₹{totalRaised.toLocaleString("en-IN")}</p><p className="text-sm text-gray-500">Total Raised</p></div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-green-700 text-white" : "bg-white text-gray-600 border border-green-200 hover:bg-green-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((campaign) => <DonationCard key={campaign._id} campaign={campaign} />)}
      </div>
    </div>
  );
}

export default Donations;