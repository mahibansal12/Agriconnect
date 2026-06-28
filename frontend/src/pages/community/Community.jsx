import { useState } from "react";
import { mockPosts, mockComments } from "../../mockdata/communityMock";
import PostCard from "../../components/community/PostCard";
import CreatePostForm from "../../components/community/CreatePostForm";

function Community() {
  const [posts, setPosts] = useState(mockPosts);
  const [sortBy, setSortBy] = useState("recent");

  const getCommentCount = (postId) => mockComments.filter((c) => c.post === postId).length;

  const sortedPosts = [...posts].sort((a, b) =>
    sortBy === "popular" ? b.likes - a.likes : new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-green-800">Farmer Community</h1>
      </div>
      <p className="text-gray-600 mb-6">Ask questions, share knowledge, and grow together.</p>

      <CreatePostForm onCreate={(newPost) => setPosts([newPost, ...posts])} />

      <div className="flex gap-2 mb-6">
        {["recent", "popular"].map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              sortBy === s ? "bg-green-700 text-white" : "bg-white text-gray-600 border border-green-200 hover:bg-green-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-w-2xl">
        {sortedPosts.map((post) => (
          <PostCard key={post._id} post={post} commentCount={getCommentCount(post._id)} />
        ))}
      </div>
    </div>
  );
}

export default Community;