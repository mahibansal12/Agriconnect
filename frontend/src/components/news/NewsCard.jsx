import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatters";

function NewsCard({ article }) {
  return (
    <Link
      to={`/news/${article._id}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-green-100"
    >
      <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 capitalize">
            {article.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(article.createdAt)}</span>
        </div>
        <h3 className="text-lg font-semibold text-green-800 leading-snug">{article.title}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.content}</p>
      </div>
    </Link>
  );
}

export default NewsCard;