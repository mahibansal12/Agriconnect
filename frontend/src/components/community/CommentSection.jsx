import { useState } from "react";

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function CommentSection({ comments, onAddComment }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    // TODO: once comment.controller.js POST route exists, wire this to axiosInstance
    onAddComment({
      _id: Date.now().toString(),
      content: text,
      author: { name: "You" },
      createdAt: new Date().toISOString(),
    });
    setText("");
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
      <h3 className="text-lg font-semibold text-green-800 mb-4">{comments.length} Comments</h3>

      <div className="space-y-4 mb-4">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {getInitials(c.author.name)}
            </div>
            <div className="bg-green-50 rounded-xl px-4 py-2 flex-1">
              <p className="text-sm font-medium text-gray-800">{c.author.name}</p>
              <p className="text-sm text-gray-600">{c.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-gray-400">No comments yet. Be the first to reply.</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
          Reply
        </button>
      </form>
    </div>
  );
}

export default CommentSection;