function GrowingGuide({ guide }) {
  if (!guide) return null;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-3">🌱 Growing Guide</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><p className="text-gray-400">Soil Type</p><p className="text-gray-700 font-medium">{guide.soilType}</p></div>
        <div><p className="text-gray-400">pH Range</p><p className="text-gray-700 font-medium">{guide.phRange}</p></div>
        <div><p className="text-gray-400">Temperature</p><p className="text-gray-700 font-medium">{guide.temperature}</p></div>
        <div><p className="text-gray-400">Rainfall</p><p className="text-gray-700 font-medium">{guide.rainfall}</p></div>
      </div>
    </div>
  );
}

export default GrowingGuide;