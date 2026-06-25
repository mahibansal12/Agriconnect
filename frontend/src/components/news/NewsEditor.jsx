import { useState } from "react";

const categories = ["government", "market", "weather", "technology", "general"];

function NewsEditor({ existingArticle = null, onSave }) {
  const [title, setTitle] = useState(existingArticle?.title || "");
  const [category, setCategory] = useState(existingArticle?.category || "general");
  const [image, setImage] = useState(existingArticle?.image || "");
  const [content, setContent] = useState(existingArticle?.content || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const articleData = { title, category, image, content };

    // TODO: once admin auth + backend route exist, replace this with:
    // await axiosInstance.post("/news", articleData) for new, or .put for edit
    console.log("Article data (not yet sent to backend):", articleData);

    if (onSave) onSave(articleData);
    alert("Article saved locally (backend connection not wired up yet).");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 space-y-4">
      <h3 className="text-lg font-semibold text-green-800">
        {existingArticle ? "Edit Article" : "Create New Article"}
      </h3>

      <div>
        <label className="text-sm text-gray-500 block mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500 block mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 capitalize"
        >
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-500 block mb-1">Image URL</label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div>
        <label className="text-sm text-gray-500 block mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <button type="submit" className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
        Save Article
      </button>
    </form>
  );
}

export default NewsEditor;