import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import CommentSection from "../../components/community/CommentSection";
import Navbar from "../../components/common/Navbar";
import useAuth from "../../hooks/useAuth";

function getInitials(name) {
  if (!name) return "👤";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost]         = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [liking, setLiking]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch post details and comments ────────────────────────────────────
  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      // GET /api/v1/community/posts/:id
      const res = await axiosInstance.get(`/v1/community/posts/${id}`);
      const payload = res.data.data;
      setPost(payload.post);
      setComments(payload.comments || []);
    } catch (err) {
      console.error("PostDetail fetch error:", err);
      setError(err.response?.status === 404 ? "Post not found." : "Failed to load post details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPostDetails();
  }, [id]);

  // ── Like toggle ──────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!post) return;
    try {
      setLiking(true);
      // POST /api/v1/community/posts/:id/like
      const res = await axiosInstance.post(`/v1/community/posts/${id}/like`);
      if (res.data?.success) {
        const payload = res.data.data;
        setPost(prev => {
          if (!prev) return null;
          let newLikes = [...(prev.likes || [])];
          if (user) {
            // payload.alreadyLiked is true if the post is now liked
            if (payload.alreadyLiked) {
              if (!newLikes.includes(user._id)) newLikes.push(user._id);
            } else {
              newLikes = newLikes.filter(uid => uid.toString() !== user._id.toString());
            }
          }
          return { ...prev, likes: newLikes };
        });
      }
    } catch (err) {
      console.error("Like toggle error:", err);
      if (err.response?.status === 401) {
        alert("Please login to like this post.");
      } else {
        alert(err.response?.data?.message || "Failed to process like.");
      }
    } finally {
      setLiking(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prev => [...prev, newComment]);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(c => c._id !== commentId));
  };

  // ── Delete post (author only — backend re-checks this too) ─────────────
  const handleDeletePost = async () => {
    if (!post) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      setDeleting(true);
      // DELETE /api/v1/community/posts/:id
      await axiosInstance.delete(`/v1/community/posts/${id}`);
      navigate("/community");
    } catch (err) {
      console.error("Delete post error:", err);
      alert(err.response?.data?.message || "Failed to delete post.");
      setDeleting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#f0fdf4", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="bg-white rounded-2xl p-6 border border-green-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-20 bg-gray-200 rounded mb-4" />
        </div>
      </div>
    </div>
  );

  // ── Error state ──────────────────────────────────────────────────────────
  if (error || !post) return (
    <div style={{ minHeight:"100vh", background:"#f0fdf4", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center p-20">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-gray-500 font-bold mb-4">{error || "Post not found."}</p>
        <Link to="/community" className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
          &larr; Back to community
        </Link>
      </div>
    </div>
  );

  const authorName = post.author?.name || "Anonymous";
  const likeCount  = Array.isArray(post.likes) ? post.likes.length : Number(post.likes || 0);
  const userHasLiked = user && Array.isArray(post.likes) && post.likes.includes(user._id);
  const userIsAuthor = user && post.author?._id && user._id.toString() === post.author._id.toString();

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#f0fdf4 0%,#f7fef9 50%,#ecfdf5 100%)", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth:"760px", margin:"0 auto", padding:"32px 24px 60px" }}>

        {/* Back link */}
        <Link to="/community" style={{ display:"inline-flex", alignItems:"center", gap:"6px", color:"#16a34a", fontSize:"13px", fontWeight:700, textDecoration:"none", marginBottom:"24px", padding:"8px 16px", borderRadius:"999px", background:"#dcfce7", border:"1.5px solid #86efac" }}>
          ← Back to community
        </Link>

        {/* Post card */}
        <div style={{ background:"#fff", borderRadius:"20px", padding:"28px 32px", border:"2px solid #bbf7d0", boxShadow:"0 4px 20px rgba(22,163,74,0.10)", marginBottom:"24px" }}>

          {/* Author row */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
            <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:"linear-gradient(135deg,#16a34a,#14532d)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", fontWeight:700, flexShrink:0 }}>
              {getInitials(authorName)}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, fontSize:"15px", fontWeight:700, color:"#111827" }}>{authorName}</p>
              <p style={{ margin:0, fontSize:"12px", color:"#9ca3af" }}>
                {new Date(post.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
              </p>
            </div>
            <span style={{ padding:"5px 14px", borderRadius:"999px", fontSize:"12px", fontWeight:700, background:"#dcfce7", color:"#14532d", border:"1.5px solid #86efac", textTransform:"capitalize" }}>
              {(post.category || "general").replace("-", " ")}
            </span>
            {userIsAuthor && (
              <button
                onClick={handleDeletePost}
                disabled={deleting}
                title="Delete post"
                style={{ display:"flex", alignItems:"center", gap:"6px", padding:"5px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:700, background:"#fef2f2", color:"#dc2626", border:"1.5px solid #fecaca", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1 }}
              >
                🗑️ {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>

          {/* Title */}
          <h1 style={{ margin:"0 0 14px", fontSize:"24px", fontWeight:900, color:"#14532d", lineHeight:1.3 }}>
            {post.title}
          </h1>

          {/* Content */}
          <p style={{ margin:"0 0 20px", fontSize:"15px", color:"#374151", lineHeight:1.8 }}>
            {post.content}
          </p>

          {/* Image if any */}
          {post.image && (
            <div style={{ marginBottom:"20px", borderRadius:"14px", overflow:"hidden", border:"1px solid #e5e7eb" }}>
              <img src={post.image} alt={post.title} style={{ width:"100%", objectFit:"cover", maxHeight:"360px" }} />
            </div>
          )}

          {/* Divider */}
          <div style={{ height:"1px", background:"linear-gradient(90deg,#bbf7d0,transparent)", marginBottom:"16px" }} />

          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={liking}
            style={{
              display:"inline-flex", alignItems:"center", gap:"8px",
              padding:"10px 20px", borderRadius:"999px",
              background: userHasLiked ? "#fee2e2" : "#f0fdf4",
              color: userHasLiked ? "#dc2626" : "#6b7280",
              border: userHasLiked ? "1.5px solid #fca5a5" : "1.5px solid #bbf7d0",
              fontSize:"13px", fontWeight:700, cursor:"pointer",
              transition:"all 0.2s ease",
            }}
          >
            ❤️ {likeCount} {userHasLiked ? "Liked" : "Like"}
          </button>
        </div>

        {/* Comments */}
        <CommentSection
          postId={post._id}
          comments={comments}
          onAddComment={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      </div>
    </div>
  );
}

export default PostDetail;