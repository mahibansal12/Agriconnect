import { Link } from "react-router-dom";

function CropInfoCard({ crop }) {
  return (
    <Link
      to={`/crop-knowledge/${crop._id}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-green-100"
    >
      <img src={crop.image} alt={crop.name} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-green-800">{crop.name}</h3>
          <span className="text-xs text-gray-400">{crop.localName}</span>
        </div>
        <div className="flex gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 capitalize">{crop.category}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 capitalize">{crop.season}</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{crop.description}</p>
      </div>
    </Link>
  );
}

export default CropInfoCard;