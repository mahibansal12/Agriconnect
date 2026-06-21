function HarvestInfo({ harvest }) {
  if (!harvest) return null;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-3">🌾 Harvesting</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><p className="text-gray-400">Harvest Time</p><p className="text-gray-700 font-medium">{harvest.harvestTime}</p></div>
        <div><p className="text-gray-400">Yield Estimate</p><p className="text-gray-700 font-medium">{harvest.yieldEstimate}</p></div>
      </div>
    </div>
  );
}

export default HarvestInfo;