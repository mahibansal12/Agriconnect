function IrrigationGuide({ irrigation }) {
  if (!irrigation) return null;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-3">💧 Irrigation Guide</h3>
      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
        <div><p className="text-gray-400">Number of Irrigations</p><p className="text-gray-700 font-medium">{irrigation.numberOfIrrigations}</p></div>
        <div><p className="text-gray-400">Interval</p><p className="text-gray-700 font-medium">Every {irrigation.intervalDays} days</p></div>
      </div>
      <p className="text-gray-400 text-sm">Critical Stages</p>
      <p className="text-gray-700 text-sm font-medium">{irrigation.criticalStages}</p>
    </div>
  );
}

export default IrrigationGuide;