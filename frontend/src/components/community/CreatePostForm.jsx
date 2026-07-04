import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const categories = ["general", "crop-tips", "weather", "market", "pest-control"];

function CreatePostForm({ onCreate }) {
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Create a form data or json body. The backend accepts multipart form (multer) for image upload,
      // but if no image is selected, standard json works. Let's send json.
      const res = await axiosInstance.post("/v1/community/posts", {
        title: title.trim(),
        content: content.trim(),
        category,
      });

      if (res.data?.success) {
        onCreate(res.data.data);
        setTitle("");
        setContent("");
        setCategory("general");
      }
    } catch (err) {
      console.error("Create post error:", err);
      if (err.response?.status === 401) {
        setError("Please login to start a discussion.");
      } else {
        setError(err.response?.data?.message || "Failed to create post.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 mb-6 space-y-3">
      <input
        type="text"
        placeholder="Ask a question or share something..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={loading}
        className="w-full px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <textarea
        placeholder="Add more details..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        disabled={loading}
        rows={3}
        className="w-full px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {error && (
        <p className="text-xs text-rose-600 font-bold">
          ⚠️ {error}
        </p>
      )}

      <div className="flex justify-between items-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="px-3 py-2 rounded-lg border border-green-200 text-sm capitalize"
        >
          {categories.map((c) => <option key={c} value={c}>{c.replace("-", " ")}</option>)}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-300"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

export default CreatePostForm;