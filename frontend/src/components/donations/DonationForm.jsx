import { useState } from "react";

const presetAmounts = [500, 1000, 2500, 5000];

function DonationForm({ campaignName }) {
  const [amount, setAmount] = useState(1000);
  const [donorName, setDonorName] = useState("");

  const handleDonate = (e) => {
    e.preventDefault();
    // TODO: once Razorpay + backend route are ready, replace this with:
    // const order = await axiosInstance.post("/donations/create-order", { amount, cause: campaignName })
    // then open Razorpay checkout with order.id
    alert(`Simulated donation of ₹${amount} to ${campaignName} (payment gateway not wired up yet).`);
  };

  return (
    <form onSubmit={handleDonate} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 space-y-4">
      <h3 className="text-lg font-semibold text-green-800">Make a Donation</h3>

      <div className="grid grid-cols-4 gap-2">
        {presetAmounts.map((amt) => (
          <button
            type="button"
            key={amt}
            onClick={() => setAmount(amt)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              amount === amt ? "bg-green-700 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            ₹{amt}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm text-gray-500 block mb-1">Custom amount (₹)</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500 block mb-1">Your Name</label>
        <input
          type="text"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Optional, for receipt"
          className="w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <button type="submit" className="w-full py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors">
        Donate ₹{amount}
      </button>
    </form>
  );
}

export default DonationForm;