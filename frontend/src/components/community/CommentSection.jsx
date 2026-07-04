import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

function getInitials(name) {
  if (!name) return "👤";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function CommentSection({ postId, comments = [], onAddComment }) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      // POST /api/v1/community/posts/:id/comments
      const res = await axiosInstance.post(`/v1/community/posts/${postId}/comments`, {
        content: text.trim()
      });

      if (res.data?.success) {
        onAddComment(res.data.data);
        setText("");
      }
    } catch (err) {
      console.error("Create comment error:", err);
      if (err.response?.status === 401) {
        setError("Please login to post a comment.");
      } else {
        setError(err.response?.data?.message || "Failed to submit comment.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-4">{comments.length} Comments</h3>

      <div className="space-y-4 mb-4">
        {comments.map((c) => {
          const authorName = c.author?.name || "Anonymous";
          return (
            <div key={c._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {getInitials(authorName)}
              </div>
              <div className="bg-green-50 rounded-xl px-4 py-2 flex-1">
                <p className="text-sm font-medium text-gray-800">{authorName}</p>
                <p className="text-sm text-gray-600">{c.content}</p>
              </div>
            </div>
          );
        })}
        {comments.length === 0 && <p className="text-sm text-gray-400">No comments yet. Be the first to reply.</p>}
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-bold mb-3">
          ⚠️ {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-300"
        >
          {loading ? "Posting..." : "Reply"}
        </button>
      </form>
    </div>
  );
}

export default CommentSection;