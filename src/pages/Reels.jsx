import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("id, created_at, user_id, reel_id, comment_text")
        .order("created_at", { ascending: true });

      if (error) throw error;
      console.log("✅ Comments fetched:", data);
      setComments(data || []);
    } catch (err) {
      console.error("❌ Error fetching comments:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setComments((prev) => prev.filter((c) => c.id !== id));
      alert("✅ Comment deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting comment:", err.message);
      alert("Failed to delete comment: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (comment) => {
    setEditing(comment.id);
    setEditText(comment.comment_text);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditText("");
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) {
      alert("Comment cannot be empty!");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .update({ comment_text: editText.trim() })
        .eq("id", id)
        .select();

      if (error) throw error;

      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, comment_text: editText.trim() } : c))
      );
      alert("✅ Comment updated successfully!");
      cancelEdit();
    } catch (err) {
      console.error("❌ Error updating comment:", err.message);
      alert("Failed to update comment: " + err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              🎬 <span>Reels</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              View all comments from your community • <span className="font-semibold text-pink-600">{comments.length} Comments</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base font-medium">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <Card className="bg-white shadow-lg rounded-xl p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Comments Yet</h3>
              <p className="text-gray-500 text-sm">Comments from your reels will appear here</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {comments.map((c, idx) => (
                <Card key={c.id} className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                          User: {c.user_id.slice(0, 8)}...
                        </span>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          Reel: {c.reel_id.slice(0, 8)}...
                        </span>
                      </div>
                      
                      {editing === c.id ? (
                        <div className="space-y-2 mb-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none resize-none"
                            rows="3"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(c.id)}
                              className="flex-1 bg-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-pink-700 transition-colors"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-400 transition-colors"
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-800 text-sm mb-2 leading-relaxed break-words">
                          {c.comment_text}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>🕐</span>
                          {new Date(c.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        
                        {editing !== c.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(c)}
                              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={deleting === c.id}
                              className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                            >
                              {deleting === c.id ? "..." : "🗑️ Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden lg:block bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                      <th className="p-4 text-left font-semibold text-sm">#</th>
                      <th className="p-4 text-left font-semibold text-sm">User ID</th>
                      <th className="p-4 text-left font-semibold text-sm">Reel ID</th>
                      <th className="p-4 text-left font-semibold text-sm">Comment</th>
                      <th className="p-4 text-left font-semibold text-sm">Created At</th>
                      <th className="p-4 text-center font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {comments.map((c, idx) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            {idx + 1}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full text-xs">
                            {c.user_id}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs">
                            {c.reel_id}
                          </span>
                        </td>
                        <td className="p-4 max-w-md">
                          {editing === c.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none resize-none"
                                rows="2"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(c.id)}
                                  className="bg-pink-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-pink-700 transition-colors"
                                >
                                  ✓ Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-400 transition-colors"
                                >
                                  ✕ Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-800 leading-relaxed">
                              {c.comment_text}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-gray-600 whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-4">
                          {editing !== c.id && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEdit(c)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                disabled={deleting === c.id}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deleting === c.id ? "..." : "🗑️ Delete"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Comments;
