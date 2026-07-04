import { Link } from "react-router-dom";

const categoryColors = {
  general: "bg-gray-100 text-gray-600",
  "crop-tips": "bg-green-100 text-green-700",
  weather: "bg-blue-100 text-blue-700",
  market: "bg-amber-100 text-amber-700",
  "pest-control": "bg-rose-100 text-rose-700",
};

function getInitials(name) {
  if (!name) return "👤";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function PostCard({ post }) {
  const authorName = post.author?.name || "Anonymous";
  const likeCount  = Array.isArray(post.likes) ? post.likes.length : Number(post.likes || 0);

  // If backend returns populated comments count
  const commentCount = post.commentCount || (Array.isArray(post.comments) ? post.comments.length : 0);

  return (
    <Link
      to={`/community/${post._id}`}
      className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-green-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
          {getInitials(authorName)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{authorName}</p>
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
        <span className={`ml-auto text-xs px-2 py-1 rounded-full capitalize ${categoryColors[post.category] || "bg-gray-100"}`}>
          {(post.category || "general").replace("-", " ")}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-green-800 mb-1">{post.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>❤️ {likeCount}</span>
        {commentCount > 0 && <span>💬 {commentCount}</span>}
      </div>
    </Link>
  );
}

export default PostCard;