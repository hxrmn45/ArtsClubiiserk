import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, Plus, X, MoreHorizontal, Flag, Trash2, Pencil, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
      const res = await api.post(`/posts/${postId}/comments`, { content: text.trim() });
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
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-200 to-cyan-200 flex-shrink-0 flex items-center justify-center">
                <span className="text-xs font-outfit font-bold text-stone-700">
                  {c.user_name[0].toUpperCase()}
                </span>
              </div>
              <div className="bg-stone-50 rounded-xl px-3 py-2 flex-1 min-w-0">
                <p className="font-outfit font-semibold text-xs text-stone-900">{c.user_name}</p>
                <p className="font-manrope text-sm text-stone-600 mt-0.5 break-words">{c.content}</p>
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
          className="flex-1 h-9 px-3 rounded-xl border border-stone-200 bg-stone-50 font-manrope text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-colors"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-50"
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
  const menuRef = useRef(null);

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

  const handleReport = async () => {
    setMenuOpen(false);
    try {
      await api.post(`/posts/${post.id}/report`, { reason: "Inappropriate content" });
      toast.success("Post reported.");
    } catch {
      toast.error("Couldn't report post.");
    }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
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
    <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-stone-100">
        <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover" />
      </div>

      <div className="p-5">
        {/* Author & menu */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-cyan-200 flex items-center justify-center">
              <span className="text-xs font-outfit font-bold text-stone-700">
                {post.author_name[0].toUpperCase()}
              </span>
            </div>
            <span className="font-outfit font-semibold text-sm text-stone-900">{post.author_name}</span>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 w-44 z-10">
                {post.can_edit && (
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-manrope text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Post
                  </button>
                )}
                {!post.can_edit && (
                  <button
                    onClick={handleReport}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-manrope text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    <Flag className="w-4 h-4" /> Report Post
                  </button>
                )}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-manrope text-stone-400 hover:bg-stone-50 transition-colors"
                >
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        <p className="font-manrope text-sm text-stone-700 leading-relaxed mb-4">{post.caption}</p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={liking}
            className="flex items-center gap-1.5 text-sm font-outfit font-medium transition-colors disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                post.liked_by_me ? "text-red-500 fill-red-500" : "text-stone-400 hover:text-red-400"
              }`}
            />
            <span className={post.liked_by_me ? "text-red-500" : "text-stone-500"}>{post.like_count}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-outfit font-medium text-stone-500 hover:text-cyan-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comment_count}</span>
          </button>
        </div>

        {showComments && <CommentSection postId={post.id} />}
      </div>
    </div>
  );
}

function CreatePostModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ image_url: "", caption: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/posts", form);
      toast.success("Post shared!");
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-outfit font-bold text-2xl text-stone-900 mb-6">Share Your Art</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-outfit font-medium text-sm text-stone-700 mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              required
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              placeholder="https://your-image-url.com/art.jpg"
              className="w-full h-11 px-4 rounded-xl border border-stone-200 bg-stone-50 font-manrope text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
            />
          </div>
          {form.image_url && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-stone-100">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={() => {}} />
            </div>
          )}
          <div>
            <label className="block font-outfit font-medium text-sm text-stone-700 mb-1.5">Caption</label>
            <textarea
              required
              minLength={2}
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
              rows={3}
              placeholder="Tell us about your artwork…"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 font-manrope text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-orange-500 text-white font-outfit font-semibold text-sm hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "Sharing…" : "Share Artwork"}
          </button>
        </form>
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

  useEffect(() => { loadPosts(); }, []);

  const handleLike = (postId, data) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, liked_by_me: data.liked, like_count: data.like_count } : p))
    );
  };

  const handleDelete = (postId) => setPosts((prev) => prev.filter((p) => p.id !== postId));
  const handleCreated = (post) => setPosts((prev) => [post, ...prev]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-outfit font-extrabold text-4xl text-stone-900 tracking-tight">Community</h1>
          <p className="font-manrope text-stone-500 mt-1">Share your art, get inspired, connect.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 text-white font-outfit font-semibold text-sm hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-orange-100"
        >
          <Plus className="w-4 h-4" /> Share Art
        </button>
      </div>

      {loading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="break-inside-avoid bg-stone-100 rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <div className="text-4xl mb-3">🎨</div>
          <p className="font-outfit font-semibold text-lg">No art yet</p>
          <p className="font-manrope text-sm mt-1">Be the first to share something!</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="break-inside-avoid">
              <PostCard post={post} onLike={handleLike} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePostModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
