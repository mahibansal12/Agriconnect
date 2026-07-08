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
      style={{ textDecoration:"none", display:"block" }}
    >
      <div style={{
        background:"#fff",
        borderRadius:"16px",
        padding:"20px 24px",
        border:"1.5px solid #bbf7d0",
        boxShadow:"0 2px 12px rgba(22,163,74,0.08)",
        marginBottom:"16px",
        transition:"box-shadow 0.2s ease",
        cursor:"pointer",
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow="0 6px 24px rgba(22,163,74,0.15)"}
        onMouseLeave={e => e.currentTarget.style.boxShadow="0 2px 12px rgba(22,163,74,0.08)"}
      >
        {/* Author row */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
          <div style={{
            width:"40px", height:"40px", borderRadius:"50%",
            background:"linear-gradient(135deg,#16a34a,#14532d)",
            color:"#fff", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:"14px", fontWeight:700,
            flexShrink:0,
          }}>
            {getInitials(authorName)}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ margin:0, fontSize:"14px", fontWeight:700, color:"#111827" }}>{authorName}</p>
            <p style={{ margin:0, fontSize:"11px", color:"#9ca3af" }}>{timeAgo(post.createdAt)}</p>
          </div>
          <span style={{
            padding:"4px 12px",
            borderRadius:"999px",
            fontSize:"11px",
            fontWeight:700,
            background:"#dcfce7",
            color:"#14532d",
            border:"1.5px solid #86efac",
            textTransform:"capitalize",
          }}>
            {(post.category || "general").replace("-", " ")}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          margin:"0 0 8px",
          fontSize:"16px",
          fontWeight:800,
          color:"#14532d",
          lineHeight:1.3,
        }}>
          {post.title}
        </h3>

        {/* Content */}
        <p style={{
          margin:"0 0 16px",
          fontSize:"13px",
          color:"#6b7280",
          lineHeight:1.65,
          display:"-webkit-box",
          WebkitLineClamp:2,
          WebkitBoxOrient:"vertical",
          overflow:"hidden",
        }}>
          {post.content}
        </p>

        {/* Footer */}
        <div style={{
          display:"flex",
          alignItems:"center",
          gap:"16px",
          paddingTop:"12px",
          borderTop:"1px solid #f0fdf4",
        }}>
          <span style={{ fontSize:"13px", color:"#6b7280", display:"flex", alignItems:"center", gap:"4px" }}>
            ❤️ {likeCount}
          </span>
          {commentCount > 0 && (
            <span style={{ fontSize:"13px", color:"#6b7280", display:"flex", alignItems:"center", gap:"4px" }}>
              💬 {commentCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default PostCard;