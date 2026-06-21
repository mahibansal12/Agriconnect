function DiseaseManagement({ diseases }) {
  if (!diseases || diseases.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-3">🐛 Disease Management</h3>
      <div className="space-y-3">
        {diseases.map((d, i) => (
          <div key={i} className="border-l-4 border-red-300 pl-3">
            <p className="font-medium text-gray-800">{d.disease}</p>
            <p className="text-sm text-gray-600"><span className="text-gray-400">Prevention: </span>{d.prevention}</p>
            <p className="text-sm text-gray-600"><span className="text-gray-400">Treatment: </span>{d.treatment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiseaseManagement;