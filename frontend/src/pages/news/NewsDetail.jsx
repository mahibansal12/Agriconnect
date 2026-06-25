import { useParams, Link } from "react-router-dom";
import { mockNews } from "../../mockdata/newsMock";
import { formatDate } from "../../utils/formatters";

function NewsDetail() {
  const { id } = useParams();
  const article = mockNews.find((a) => a._id === id);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-500">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-6 py-10">
      <Link to="/news" className="text-green-700 text-sm mb-4 inline-block">&larr; Back to all news</Link>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-green-100 max-w-3xl">
        <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 capitalize">{article.category}</span>
            <span className="text-xs text-gray-400">{formatDate(article.createdAt)}</span>
          </div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">{article.title}</h1>
          <p className="text-gray-700 leading-relaxed">{article.content}</p>
        </div>
      </div>
    </div>
  );
}

export default NewsDetail;