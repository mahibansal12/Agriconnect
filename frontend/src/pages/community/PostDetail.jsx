import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  const { user } = useAuth();
  
  const [post, setPost]         = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [liking, setLiking]     = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <Navbar />

      <div className="max-w-2xl mx-auto">
        <Link to="/community" className="text-green-700 text-sm mb-4 inline-block hover:underline">
          &larr; Back to community
        </Link>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
              {getInitials(authorName)}
            </div>
            <div>
              <p className="font-medium text-gray-800">{authorName}</p>
              <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-bold capitalize">
              {(post.category || "general").replace("-", " ")}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-green-800 mb-3">{post.title}</h1>
          <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>

          {post.image && (
            <div className="mb-4 rounded-xl overflow-hidden max-h-96 border border-gray-100">
              <img src={post.image} alt={post.title} className="w-full object-cover" />
            </div>
          )}

          <button
            onClick={handleLike}
            disabled={liking}
            className={`text-sm px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 font-semibold ${
              userHasLiked 
                ? "bg-rose-100 text-rose-600 border border-rose-200" 
                : "bg-green-50 text-gray-600 border border-green-100 hover:bg-green-100"
            }`}
          >
            ❤️ {likeCount} {userHasLiked ? "Liked" : "Like"}
          </button>
        </div>

        <div className="max-w-2xl">
          <CommentSection postId={post._id} comments={comments} onAddComment={handleCommentAdded} />
        </div>
      </div>
    </div>
  );
}

export default PostDetail;