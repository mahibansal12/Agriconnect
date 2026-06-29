import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mockPosts, mockComments } from "../../mockdata/communityMock";
import CommentSection from "../../components/community/CommentSection";

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function PostDetail() {
  const { id } = useParams();
  const post = mockPosts.find((p) => p._id === id);
  const [comments, setComments] = useState(mockComments.filter((c) => c.post === id));
  const [likes, setLikes] = useState(post?.likes || 0);
  const [liked, setLiked] = useState(false);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-500">Post not found.</p>
      </div>
    );
  }

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <Link to="/community" className="text-green-700 text-sm mb-4 inline-block">&larr; Back to community</Link>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 max-w-2xl mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
            {getInitials(post.author.name)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{post.author.name}</p>
            <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-green-800 mb-3">{post.title}</h1>
        <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>

        <button
          onClick={toggleLike}
          className={`text-sm px-3 py-1.5 rounded-full transition-colors ${liked ? "bg-red-100 text-red-600" : "bg-green-50 text-gray-600 hover:bg-green-100"}`}
        >
          ❤️ {likes}
        </button>
      </div>

      <div className="max-w-2xl">
        <CommentSection comments={comments} onAddComment={(c) => setComments([...comments, c])} />
      </div>
    </div>
  );
}

export default PostDetail;