import { useState } from "react";

const categories = ["general", "crop-tips", "weather", "market", "pest-control"];

function CreatePostForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // TODO: once community.controller.js POST route exists, replace this with:
    // await axiosInstance.post("/v1/community/posts", { title, content, category })
    const newPost = {
      _id: Date.now().toString(),
      title,
      content,
      category,
      image: null,
      author: { name: "You" },
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    onCreate(newPost);
    setTitle("");
    setContent("");
    setCategory("general");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 mb-6 space-y-3">
      <input
        type="text"
        placeholder="Ask a question or share something..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <textarea
        placeholder="Add more details..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={3}
        className="w-full px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div className="flex justify-between items-center">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-green-200 text-sm capitalize"
        >
          {categories.map((c) => <option key={c} value={c}>{c.replace("-", " ")}</option>)}
        </select>
        <button type="submit" className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
          Post
        </button>
      </div>
    </form>
  );
}

export default CreatePostForm;