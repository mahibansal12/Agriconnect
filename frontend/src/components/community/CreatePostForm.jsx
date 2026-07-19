import { useState, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";

const categories = ["general", "crop-tips", "weather", "market", "pest-control"];

function CreatePostForm({ onCreate }) {
  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [category, setCategory] = useState("general");
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const fileRef                 = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // use FormData if image is selected, else plain JSON
      if (image) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("content", content.trim() || " ");
        formData.append("category", category);
        formData.append("image", image);

        const res = await axiosInstance.post("/v1/community/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.success) {
          onCreate(res.data.data);
          setTitle(""); setContent(""); setCategory("general");
          setImage(null); setPreview(null);
        }
      } else {
        const res = await axiosInstance.post("/v1/community/posts", {
          title: title.trim(),
          content: content.trim() || " ",
          category,
        });
        if (res.data?.success) {
          onCreate(res.data.data);
          setTitle(""); setContent(""); setCategory("general");
        }
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
    <form
      onSubmit={handleSubmit}
      style={{ background:"#fff", borderRadius:"16px", border:"1.5px solid #bbf7d0", padding:"20px 24px", marginBottom:"16px" }}
    >
      {/* Title input */}
      <input
        type="text"
        placeholder="Ask a question or share something..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={loading}
        style={{ width:"100%", padding:"12px 16px", fontSize:"14px", borderRadius:"10px", border:"1.5px solid #bbf7d0", outline:"none", marginBottom:"10px", fontFamily:"inherit", boxSizing:"border-box" }}
      />

      {/* Details textarea — optional */}
      <textarea
        placeholder="Add more details... (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        rows={4}
        style={{ width:"100%", padding:"12px 16px", fontSize:"14px", borderRadius:"10px", border:"1.5px solid #bbf7d0", outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box", marginBottom:"10px" }}
      />

      {/* Image preview */}
      {preview && (
        <div style={{ position:"relative", marginBottom:"10px", display:"inline-block" }}>
          <img
            src={preview}
            alt="preview"
            style={{ width:"100%", maxHeight:"200px", objectFit:"cover", borderRadius:"10px", border:"1.5px solid #bbf7d0" }}
          />
          <button
            type="button"
            onClick={removeImage}
            style={{ position:"absolute", top:"8px", right:"8px", background:"rgba(0,0,0,0.6)", color:"#fff", border:"none", borderRadius:"50%", width:"24px", height:"24px", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize:"12px", color:"#dc2626", fontWeight:700, marginBottom:"10px" }}>
          ⚠️ {error}
        </p>
      )}

      {/* Bottom row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>

          {/* Category select */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            style={{ padding:"8px 12px", borderRadius:"8px", border:"1.5px solid #bbf7d0", fontSize:"13px", fontFamily:"inherit", cursor:"pointer" }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c.replace("-", " ")}</option>
            ))}
          </select>

          {/* Image upload button */}
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={handleImageChange}
            style={{ display:"none" }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            style={{ padding:"8px 14px", borderRadius:"8px", border:"1.5px solid #bbf7d0", background:"#f0fdf4", color:"#16a34a", fontSize:"13px", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:"5px" }}
          >
            📷 {image ? "Change Photo" : "Add Photo"}
          </button>
        </div>

        {/* Post button */}
        <button
          type="submit"
          disabled={loading}
          style={{ padding:"10px 24px", borderRadius:"10px", background:"linear-gradient(135deg,#16a34a,#14532d)", color:"#fff", border:"none", fontSize:"14px", fontWeight:700, cursor:"pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}

export default CreatePostForm;