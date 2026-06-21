function FertilizerGuide({ fertilizers }) {
  if (!fertilizers || fertilizers.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-3">🧪 Fertilizer Guide</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b">
            <th className="py-2">Fertilizer</th><th className="py-2">Quantity</th><th className="py-2">Timing</th>
          </tr>
        </thead>
        <tbody>
          {fertilizers.map((f, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2 font-medium text-gray-700">{f.name}</td>
              <td className="py-2 text-gray-600">{f.quantity}</td>
              <td className="py-2 text-gray-600">{f.timing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FertilizerGuide;