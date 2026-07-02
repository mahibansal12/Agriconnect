import { useState } from "react";
import { mockPosts, mockComments } from "../../mockdata/communityMock";
import PostCard from "../../components/community/PostCard";
import CreatePostForm from "../../components/community/CreatePostForm";
import Navbar from "../../components/common/Navbar";

function Community() {
  const [posts, setPosts] = useState(mockPosts);
  const [sortBy, setSortBy] = useState("recent");

  const getCommentCount = (postId) => mockComments.filter((c) => c.post === postId).length;

  const sortedPosts = [...posts].sort((a, b) =>
    sortBy === "popular" ? b.likes - a.likes : new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalComments = mockComments.length;
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

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
              <span className="community-pill">Demo community active</span>
            </div>
          </div>

          <aside className="community-panel">
            <div className="community-panel-label">Community pulse</div>
            <div className="community-big">{posts.length}</div>
            <p>Active discussions across crop tips, pest control, irrigation, and markets.</p>
            <div className="community-mini-grid">
              <div><strong>{totalLikes}</strong><span>Likes</span></div>
              <div><strong>{totalComments}</strong><span>Replies</span></div>
              <div><strong>5</strong><span>Topics</span></div>
            </div>
          </aside>
        </div>
      </section>

      <main id="community-board" className="community-main">
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
                <p>{sortedPosts.length} farmer questions and shared experiences</p>
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

            <div className="community-posts">
              {sortedPosts.map((post) => (
                <PostCard key={post._id} post={post} commentCount={getCommentCount(post._id)} />
              ))}
            </div>
          </section>

          <aside className="community-compose">
            <h2>Start a Discussion</h2>
            <p>Post a clear question with crop, location, and problem details for better answers.</p>
            <CreatePostForm onCreate={(newPost) => setPosts([newPost, ...posts])} />
            <div className="community-guidelines">
              {[
                "Mention crop and growth stage.",
                "Add weather or soil context.",
                "Share what treatment you already tried.",
              ].map((item) => (
                <div key={item}><span>✓</span>{item}</div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        .community-page { min-height: 100vh; background: linear-gradient(135deg, #EAF7FF 0%, #FFF8E6 46%, #EFFBEF 100%); }
        .community-hero { position: relative; overflow: hidden; min-height: 420px; background: linear-gradient(90deg, rgba(7,41,18,0.88), rgba(18,85,28,0.72), rgba(14,165,233,0.36)), radial-gradient(circle at 82% 16%, rgba(255,205,83,0.95) 0 8%, rgba(255,173,46,0.24) 9% 22%, transparent 34%), linear-gradient(180deg, #74C7F2 0%, #BDEBFF 31%, #FFE19A 45%, #79B54A 46%, #236E2A 100%); }
        .community-field-lines { position: absolute; left: -8%; right: -8%; top: 45%; bottom: -30%; opacity: 0.82; background: repeating-linear-gradient(104deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 58px), repeating-linear-gradient(76deg, rgba(8,69,22,0.30) 0 3px, transparent 3px 70px); transform: perspective(520px) rotateX(58deg); transform-origin: top; }
        .community-hero-inner { position: relative; z-index: 1; width: min(100% - 48px, 1280px); min-height: 420px; margin: 0 auto; padding: 58px 0 66px; display: grid; grid-template-columns: minmax(0, 1fr) 420px; align-items: center; gap: 72px; }
        .community-copy h1 { margin: 0; color: #fff; font-size: clamp(42px, 5vw, 66px); line-height: 1.05; font-weight: 900; letter-spacing: 0; }
        .community-copy p { max-width: 670px; margin: 20px 0 0; color: rgba(255,255,255,0.88); font-size: 18px; line-height: 1.8; }
        .community-eyebrow { display: inline-flex; margin-bottom: 20px; padding: 6px 14px; border: 1px solid rgba(255,226,139,0.48); border-radius: 6px; background: rgba(255,248,220,0.16); color: #FFE7A3; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
        .community-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 32px; }
        .community-primary { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; padding: 0 24px; border-radius: 8px; background: linear-gradient(135deg, #F59E0B, #EF4444); color: #fff; font-weight: 900; text-decoration: none; box-shadow: 0 14px 30px rgba(239,68,68,0.24); }
        .community-pill { min-height: 38px; display: inline-flex; align-items: center; padding: 0 16px; border-radius: 999px; border: 1px solid rgba(255,235,167,0.72); color: #fff; background: rgba(255,255,255,0.08); font-weight: 800; font-size: 13px; }
        .community-panel { border: 1px solid rgba(179,229,252,0.42); border-radius: 14px; padding: 22px; color: #fff; background: rgba(9,68,76,0.42); box-shadow: 0 20px 50px rgba(10,45,30,0.22); backdrop-filter: blur(6px); }
        .community-panel-label { color: #B3E5FC; font-size: 12px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
        .community-big { margin-top: 18px; font-size: 54px; line-height: 1; color: #FFE082; font-weight: 900; }
        .community-panel p { color: rgba(255,255,255,0.76); line-height: 1.6; }
        .community-mini-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 18px; }
        .community-mini-grid div { min-height: 74px; border-radius: 10px; background: rgba(255,255,255,0.12); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .community-mini-grid strong { color: #fff; font-size: 20px; }
        .community-mini-grid span { margin-top: 4px; color: rgba(255,255,255,0.68); font-size: 12px; }
        .community-main { width: min(100% - 48px, 1280px); margin: 0 auto; padding: 32px 0 72px; }
        .community-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 22px; }
        .community-stat { display: flex; align-items: center; gap: 14px; border: 1px solid #D8E8C8; border-radius: 14px; background: rgba(255,255,255,0.9); padding: 18px; box-shadow: 0 18px 40px rgba(45,92,30,0.08); }
        .community-stat span { font-size: 28px; }
        .community-stat strong { display: block; color: #0A2E0C; font-size: 17px; }
        .community-stat small { color: #4B7A5C; font-size: 13px; }
        .community-layout { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(340px, 0.9fr); gap: 22px; align-items: start; }
        .community-section-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 16px; }
        .community-section-head h2 { margin: 0; color: #0A2E0C; font-size: 24px; font-weight: 900; }
        .community-section-head p { margin: 5px 0 0; color: #4B7A5C; font-size: 14px; }
        .community-tabs { display: inline-flex; border: 1px solid #BBF7D0; border-radius: 999px; padding: 4px; background: #fff; }
        .community-tabs button { border: 0; background: transparent; border-radius: 999px; padding: 8px 14px; color: #166534; font-size: 13px; font-weight: 900; text-transform: capitalize; cursor: pointer; }
        .community-tabs button.active { background: #16A34A; color: #fff; }
        .community-posts { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }
        .community-compose { border: 1px solid #BAE6FD; border-radius: 14px; background: linear-gradient(135deg, #F0F9FF, #FFFBEB); padding: 22px; box-shadow: 0 18px 40px rgba(45,92,30,0.08); }
        .community-compose h2 { margin: 0; color: #0A2E0C; font-size: 22px; font-weight: 900; }
        .community-compose > p { margin: 7px 0 16px; color: #4B7A5C; line-height: 1.6; font-size: 14px; }
        .community-compose form { box-shadow: none !important; margin-bottom: 14px !important; border-radius: 12px !important; }
        .community-guidelines { display: flex; flex-direction: column; gap: 9px; }
        .community-guidelines div { display: flex; align-items: center; gap: 8px; color: #166534; font-size: 13px; font-weight: 800; }
        .community-guidelines span { width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; background: #16A34A; font-size: 12px; }
        @media (max-width: 1100px) { .community-posts { grid-template-columns: 1fr; } }
        @media (max-width: 980px) { .community-hero-inner, .community-layout { grid-template-columns: 1fr; } .community-panel { max-width: 520px; } .community-stats { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .community-hero-inner, .community-main { width: min(100% - 32px, 1280px); } .community-copy h1 { font-size: 38px; } .community-copy p { font-size: 16px; } .community-mini-grid { grid-template-columns: 1fr; } .community-section-head { align-items: flex-start; flex-direction: column; } }
      `}</style>
    </div>
  );
}

export default Community;
