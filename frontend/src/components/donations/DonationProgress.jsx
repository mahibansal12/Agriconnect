function DonationProgress({ raised, goal }) {
  const percent = Math.min(Math.round((raised / goal) * 100), 100);

  return (
    <div>
      <div className="w-full h-2.5 bg-green-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-sm mt-2">
        <span className="font-semibold text-green-800">₹{raised.toLocaleString("en-IN")} raised</span>
        <span className="text-gray-500">of ₹{goal.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}

export default DonationProgress;