import { useParams, Link } from "react-router-dom";
import { mockCrops } from "../../mockdata/cropKnowledgeMock";
import GrowingGuide from "../../components/crop-knowledge/GrowingGuide";
import FertilizerGuide from "../../components/crop-knowledge/FertilizerGuide";
import IrrigationGuide from "../../components/crop-knowledge/IrrigationGuide";
import DiseaseManagement from "../../components/crop-knowledge/DiseaseManagement";
import HarvestInfo from "../../components/crop-knowledge/HarvestInfo";

function CropKnowledgeDetail() {
  const { id } = useParams();
  const crop = mockCrops.find((c) => c._id === id);

  if (!crop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-500">Crop not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-6 py-10">
      <Link to="/crop-knowledge" className="text-green-700 text-sm mb-4 inline-block">&larr; Back to all crops</Link>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100 mb-6">
        <img src={crop.image} alt={crop.name} className="w-full h-56 object-cover" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-green-800">{crop.name}</h1>
            <span className="text-gray-400 italic">{crop.scientificName}</span>
          </div>
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 capitalize">{crop.category}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 capitalize">{crop.season}</span>
          </div>
          <p className="text-gray-600">{crop.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GrowingGuide guide={crop.growingGuide} />
        <IrrigationGuide irrigation={crop.irrigationGuide} />
        <FertilizerGuide fertilizers={crop.fertilizerGuide} />
        <HarvestInfo harvest={crop.harvestInfo} />
      </div>

      <div className="mt-6">
        <DiseaseManagement diseases={crop.diseaseManagement} />
      </div>
    </div>
  );
}

export default CropKnowledgeDetail;