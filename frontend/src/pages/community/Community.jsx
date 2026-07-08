import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import PostCard from "../../components/community/PostCard";
import CreatePostForm from "../../components/community/CreatePostForm";
import Navbar from "../../components/common/Navbar";
import "./Community.css";
function Community() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [sortBy, setSortBy]   = useState("recent");

  // ── Fetch posts from backend ────────────────────────────────────────────
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      // GET /api/v1/community/posts — public route
      const res = await axiosInstance.get("/v1/community/posts");
      setPosts(res.data.data || []);
    } catch (err) {
      console.error("Community feed fetch error:", err);
      setError("Failed to load community discussion board.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Sort posts dynamically (recent vs popular based on like count)
  const sortedPosts = [...posts].sort((a, b) => {
    const aLikes = Array.isArray(a.likes) ? a.likes.length : Number(a.likes || 0);
    const bLikes = Array.isArray(b.likes) ? b.likes.length : Number(b.likes || 0);
    return sortBy === "popular"
      ? bLikes - aLikes
      : new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalLikes = posts.reduce((sum, p) => {
    const count = Array.isArray(p.likes) ? p.likes.length : Number(p.likes || 0);
    return sum + count;
  }, 0);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="community-page">
      <Navbar />

      <section className="community-hero">
        <div className="community-field-lines" />
        <div className="community-hero-inner">
          <div className="community-copy">
            <div className="community-eyebrow">Farmer knowledge network</div>
            <h1>Farmer Community</h1>
            <p>
              Ask practical questions, compare field experiences, and learn from
              farmers facing the same crop, pest, water, and market decisions.
            </p>
            <div className="community-actions">
              <a href="#community-board" className="community-primary">Explore posts</a>
              <span className="community-pill">Live community active</span>
            </div>
          </div>

          <aside className="community-panel">
            <div className="community-panel-label">Community pulse</div>
            <div className="community-big">{loading ? "—" : posts.length}</div>
            <p>Active discussions across crop tips, pest control, irrigation, and markets.</p>
            <div className="community-mini-grid">
              <div><strong>{loading ? "—" : totalLikes}</strong><span>Likes</span></div>
              <div><strong>5</strong><span>Topics</span></div>
              <div><strong>Live</strong><span>Status</span></div>
            </div>
          </aside>
        </div>
      </section>

      <main id="community-board" className="community-main">
        {/* Error banner */}
        {error && (
          <div style={{ marginBottom:"24px", padding:"14px 20px", borderRadius:"12px", background:"#fee2e2", border:"1.5px solid #fca5a5", color:"#991b1b", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
            <span style={{ fontWeight:600, fontSize:"14px" }}>⚠️ {error}</span>
            <button onClick={fetchPosts} style={{ padding:"6px 14px", borderRadius:"8px", background:"#991b1b", color:"#fff", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>
              Retry
            </button>
          </div>
        )}

        <section className="community-stats">
          {[
            ["Crop Tips", "Practical advice from field experience", "🌱"],
            ["Pest Alerts", "Discuss symptoms and treatments early", "🛡️"],
            ["Market Talk", "Share local price and buyer updates", "📊"],
          ].map(([title, text, icon]) => (
            <div className="community-stat" key={title}>
              <span>{icon}</span>
              <div><strong>{title}</strong><small>{text}</small></div>
            </div>
          ))}
        </section>

        <div className="community-layout">
          <section className="community-feed">
            <div className="community-section-head">
              <div>
                <h2>Discussion Board</h2>
                <p>{loading ? "..." : sortedPosts.length} farmer questions and shared experiences</p>
              </div>
              <div className="community-tabs">
                {["recent", "popular"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={sortBy === s ? "active" : ""}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(n => (
                  <div key={n} className="bg-white rounded-2xl p-5 border border-green-100 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : sortedPosts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 20px" }}>
                <div style={{ fontSize:"52px", marginBottom:"12px" }}>💬</div>
                <p style={{ color:"#6b7280", fontWeight:600 }}>No discussions yet.</p>
                <p style={{ color:"#9ca3af", fontSize:"13px", marginTop:"6px" }}>
                  Be the first to post a question on the board!
                </p>
              </div>
            ) : (
              <div className="community-posts">
                {sortedPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </section>

          <aside className="community-compose">
            <h2>Start a Discussion</h2>
            <p>Post a clear question with crop, location, and problem details for better answers.</p>
            <CreatePostForm onCreate={handlePostCreated} />
           <div className="community-guidelines">
            {[
            "Respect other community members and keep answers helpful.",
              ].map((g, i) => (
            <div className="community-guideline" key={i}>
            <span>💡</span>
            <p>{g}</p>
            </div>
             ))}
          </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Community;
