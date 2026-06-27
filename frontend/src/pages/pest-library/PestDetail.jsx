import { useParams, Link } from "react-router-dom";
import { mockPests } from "../../mockdata/pestLibraryMock";
import TreatmentGuide from "../../components/pest-library/TreatmentGuide";

function PestDetail() {
  const { id } = useParams();
  const pest = mockPests.find((p) => p._id === id);

  if (!pest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-500">Pest not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <Link to="/pests" className="text-green-700 text-sm mb-4 inline-block">&larr; Back to Pest Library</Link>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100 mb-6">
        <img src={pest.image} alt={pest.name} className="w-full h-56 object-cover" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-3xl font-bold text-green-800">{pest.name}</h1>
            <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 capitalize font-medium">{pest.type}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {pest.affectedCrops.map((crop) => (
              <span key={crop} className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">{crop}</span>
            ))}
          </div>
          <p className="text-gray-700">{pest.symptoms}</p>
        </div>
      </div>

      <TreatmentGuide treatment={pest.treatment} prevention={pest.prevention} />
    </div>
  );
}

export default PestDetail;