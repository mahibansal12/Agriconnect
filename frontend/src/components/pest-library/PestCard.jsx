import { Link } from "react-router-dom";

const typeColors = {
  insect: "bg-orange-100 text-orange-700",
  fungus: "bg-amber-100 text-amber-700",
  bacteria: "bg-rose-100 text-rose-700",
  virus: "bg-purple-100 text-purple-700",
  weed: "bg-lime-100 text-lime-700",
};

function PestCard({ pest }) {
  return (
    <Link
      to={`/pests/${pest._id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-green-100 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img
          src={pest.image}
          alt={pest.name}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium capitalize ${typeColors[pest.type]}`}>
          {pest.type}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">{pest.name}</h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {pest.affectedCrops.slice(0, 3).map((crop) => (
            <span key={crop} className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
              {crop}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{pest.symptoms}</p>
      </div>
    </Link>
  );
}

export default PestCard;