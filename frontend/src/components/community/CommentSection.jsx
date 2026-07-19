import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import useAuth from "../../hooks/useAuth";

function getInitials(name) {
  if (!name) return "👤";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function CommentSection({ postId, comments = [], onAddComment, onCommentDeleted }) {
  const { user } = useAuth();
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  // ── Delete comment (comment's own author only — backend re-checks this too) ──
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      setDeletingId(commentId);
      // DELETE /api/v1/community/posts/:postId/comments/:commentId
      await axiosInstance.delete(`/v1/community/posts/${postId}/comments/${commentId}`);
      onCommentDeleted?.(commentId);
    } catch (err) {
      console.error("Delete comment error:", err);
      alert(err.response?.data?.message || "Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ background:"#fff", borderRadius:"20px", padding:"24px 28px", border:"2px solid #bbf7d0", boxShadow:"0 4px 20px rgba(22,163,74,0.08)" }}>

      {/* Header */}
      <h3 style={{ margin:"0 0 20px", fontSize:"18px", fontWeight:800, color:"#14532d" }}>
        💬 {comments.length} Comments
      </h3>

      {/* Comments list */}
      <div style={{ display:"flex", flexDirection:"column", gap:"14px", marginBottom:"20px" }}>
        {comments.length === 0 ? (
          <p style={{ fontSize:"13px", color:"#9ca3af", textAlign:"center", padding:"20px 0" }}>
            No comments yet. Be the first to reply.
          </p>
        ) : (
          comments.map((c) => {
            const authorName = c.author?.name || "Anonymous";
            const isCommentAuthor = user && c.author?._id && user._id.toString() === c.author._id.toString();
            return (
              <div key={c._id} style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#16a34a,#14532d)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700, flexShrink:0 }}>
                  {getInitials(authorName)}
                </div>
                <div style={{ flex:1, background:"#f0fdf4", borderRadius:"14px", padding:"12px 16px", border:"1px solid #bbf7d0" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px" }}>
                    <p style={{ margin:"0 0 4px", fontSize:"13px", fontWeight:700, color:"#111827" }}>{authorName}</p>
                    {isCommentAuthor && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        disabled={deletingId === c._id}
                        title="Delete comment"
                        style={{ background:"none", border:"none", padding:"2px 4px", fontSize:"12px", color:"#dc2626", cursor: deletingId === c._id ? "not-allowed" : "pointer", opacity: deletingId === c._id ? 0.5 : 1, flexShrink:0 }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p style={{ margin:0, fontSize:"13px", color:"#374151", lineHeight:1.6 }}>{c.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize:"12px", color:"#dc2626", fontWeight:700, marginBottom:"12px" }}>
          ⚠️ {error}
        </p>
      )}

      {/* Divider */}
      <div style={{ height:"1px", background:"linear-gradient(90deg,#bbf7d0,transparent)", marginBottom:"16px" }} />

      {/* Comment input */}
      <form onSubmit={handleSubmit} style={{ display:"flex", gap:"10px" }}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          style={{ flex:1, padding:"12px 16px", borderRadius:"12px", border:"1.5px solid #bbf7d0", fontSize:"14px", outline:"none", fontFamily:"inherit" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding:"12px 22px", borderRadius:"12px", background:"linear-gradient(135deg,#16a34a,#14532d)", color:"#fff", border:"none", fontSize:"13px", fontWeight:700, cursor:"pointer" }}
        >
          {loading ? "Posting..." : "Reply"}
        </button>
      </form>
    </div>
  );
}

export default CommentSection;