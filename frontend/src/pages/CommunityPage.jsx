import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, Plus, X, MoreHorizontal, Flag, Trash2, Pencil, Send } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data);
      setLoaded(true);
    } catch {
      toast.error("Couldn't load comments.");
    }
  };

  useEffect(() => { load(); }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);

    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: text.trim(),
      });

      setComments((prev) => [...prev, res.data]);
      setText("");
    } catch {
      toast.error("Couldn't post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-stone-100 pt-4 mt-4">
      {loaded && comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-200 to-cyan-200 flex items-center justify-center">
                <span className="text-xs font-outfit font-bold text-stone-700">
                  {c.user_name[0].toUpperCase()}
                </span>
              </div>

              <div className="bg-stone-50 rounded-xl px-3 py-2 flex-1">
                <p className="font-outfit font-semibold text-xs text-stone-900">
                  {c.user_name}
                </p>

                <p className="font-manrope text-sm text-stone-600 mt-0.5">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          maxLength={400}
          className="flex-1 h-9 px-3 rounded-xl border border-stone-200 bg-stone-50 text-sm"
        />

        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function PostCard({ post, onLike, onDelete }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    setLiking(true);

    try {
      const res = await api.post(`/posts/${post.id}/like`);
      onLike(post.id, res.data);
    } catch {
      toast.error("Couldn't update like.");
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api.delete(`/posts/${post.id}`);
      onDelete(post.id);
      toast.success("Post deleted.");
    } catch {
      toast.error("Couldn't delete post.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
      <div className="aspect-square overflow-hidden bg-stone-100">
        <img
          src={post.image_url}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-cyan-200 flex items-center justify-center">
              <span className="text-xs font-outfit font-bold text-stone-700">
                {post.author_name[0].toUpperCase()}
              </span>
            </div>

            <span className="font-outfit font-semibold text-sm text-stone-900">
              {post.author_name}
            </span>
          </div>

          {post.can_edit && (
            <button
              onClick={handleDelete}
              className="text-red-500 text-sm font-manrope"
            >
              Delete
            </button>
          )}
        </div>

        <p className="font-manrope text-sm text-stone-700 mb-4">
          {post.caption}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-1.5 text-sm"
          >
            <Heart
              className={`w-5 h-5 ${
                post.liked_by_me ? "text-red-500 fill-red-500" : "text-stone-400"
              }`}
            />
            {post.like_count}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm text-stone-500"
          >
            <MessageCircle className="w-5 h-5" />
            {post.comment_count}
          </button>
        </div>

        {showComments && <CommentSection postId={post.id} />}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch {
      toast.error("Couldn't load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLike = (postId, data) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked_by_me: data.liked, like_count: data.like_count }
          : p
      )
    );
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-outfit font-bold text-4xl mb-8">Community</h1>

      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
}
