import { Link } from "react-router-dom";

function SchemeCard({ scheme }) {
  return (
    <Link
      to={`/schemes/${scheme._id}`}
      className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-green-100"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-green-800">{scheme.title}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 capitalize whitespace-nowrap">
          {scheme.category}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{scheme.description}</p>
      <p className="text-sm text-green-700 font-medium">{scheme.benefits.split(",")[0]}</p>
    </Link>
  );
}

export default SchemeCard;