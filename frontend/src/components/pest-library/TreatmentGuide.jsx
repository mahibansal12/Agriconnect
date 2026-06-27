function TreatmentGuide({ treatment, prevention }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">💊</span>
          <h3 className="text-lg font-semibold text-orange-700">Treatment</h3>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{treatment}</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🛡️</span>
          <h3 className="text-lg font-semibold text-green-700">Prevention</h3>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{prevention || "No specific prevention notes available."}</p>
      </div>
    </div>
  );
}

export default TreatmentGuide;