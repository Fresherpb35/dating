import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";
import { MessageSquare, RefreshCw, Download, Search, Edit2, Trash2, User, Video, Calendar, TrendingUp, Filter, X, Check } from 'lucide-react';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("id, created_at, user_id, reel_id, comment_text")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("✅ Comments fetched:", data);
      setComments(data || []);
    } catch (err) {
      console.error("❌ Error fetching comments:", err.message);
      alert("Failed to fetch comments: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
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
    setIsEditing(false);
  };

  const handleEdit = async (id) => {
    if (!editText.trim()) {
      alert("Comment cannot be empty!");
      return;
    }

    setIsEditing(true);
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
    } finally {
      setIsEditing(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredComments, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comments_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const filteredComments = comments
    .filter(c =>
      c.comment_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reel_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return 0;
    });

  // Calculate stats
  const todayComments = comments.filter(c => {
    const commentDate = new Date(c.created_at).toDateString();
    const today = new Date().toDateString();
    return commentDate === today;
  }).length;

  const uniqueUsers = new Set(comments.map(c => c.user_id)).size;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2">
                  Reel Comments
                  <span className="text-lg sm:text-xl text-pink-600">({filteredComments.length})</span>
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Manage and moderate all user comments
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchComments}
                disabled={loading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-pink-300 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin text-pink-500" : "text-gray-600"} />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Refresh</span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                <Download size={18} />
                <span className="hidden sm:inline text-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Total Comments", value: comments.length, icon: MessageSquare, color: "from-pink-500 to-rose-500" },
            { label: "Today", value: todayComments, icon: Calendar, color: "from-blue-500 to-cyan-500" },
            { label: "Unique Users", value: uniqueUsers, icon: User, color: "from-purple-500 to-pink-500" },
            { label: "This Week", value: comments.filter(c => {
              const commentDate = new Date(c.created_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return commentDate >= weekAgo;
            }).length, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className="text-white" size={20} />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search comments, users, reel IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base font-medium">Loading comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <Card className="bg-white shadow-lg rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? "No matching comments" : "No Comments Yet"}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm ? "Try adjusting your search" : "Comments from your reels will appear here"}
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredComments.map((c, idx) => (
                <Card key={c.id} className="bg-white shadow-md rounded-2xl p-5 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        #{idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-700 bg-pink-100 px-3 py-1.5 rounded-full">
                          <User size={12} />
                          {c.user_id.slice(0, 8)}...
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">
                          <Video size={12} />
                          {c.reel_id.slice(0, 8)}...
                        </span>
                      </div>
                      {editing === c.id ? (
                        <div className="space-y-3 mb-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                            rows="3"
                            disabled={isEditing}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(c.id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
                              disabled={isEditing}
                            >
                              <Check size={16} />
                              {isEditing ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                              disabled={isEditing}
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-800 text-sm mb-3 leading-relaxed break-words bg-gray-50 p-3 rounded-xl">
                          {c.comment_text}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(c.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {editing !== c.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(c)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={deleting === c.id}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-medium px-2 py-1 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              {deleting === c.id ? "..." : "Delete"}
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
            <Card className="hidden lg:block bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                      <th className="p-4 text-left font-semibold text-sm uppercase tracking-wide">#</th>
                      <th className="p-4 text-left font-semibold text-sm uppercase tracking-wide">User ID</th>
                      <th className="p-4 text-left font-semibold text-sm uppercase tracking-wide">Reel ID</th>
                      <th className="p-4 text-left font-semibold text-sm uppercase tracking-wide">Comment</th>
                      <th className="p-4 text-left font-semibold text-sm uppercase tracking-wide">Created At</th>
                      <th className="p-4 text-center font-semibold text-sm uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredComments.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`border-b border-gray-100 hover:bg-pink-50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {idx + 1}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-pink-500" />
                            <span className="font-medium text-pink-700 bg-pink-50 px-3 py-1.5 rounded-full text-xs">
                              {c.user_id}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Video size={16} className="text-purple-500" />
                            <span className="font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full text-xs">
                              {c.reel_id}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 max-w-md">
                          {editing === c.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full border-2 border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                                rows="2"
                                disabled={isEditing}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(c.id)}
                                  className="flex items-center gap-1 bg-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
                                  disabled={isEditing}
                                >
                                  <Check size={14} />
                                  {isEditing ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                                  disabled={isEditing}
                                >
                                  <X size={14} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-xl">
                              {c.comment_text}
                            </p>
                          )}
                        </td>
                        <td className="p-4 text-gray-600 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="font-medium">
                              {new Date(c.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(c.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          {editing !== c.id && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEdit(c)}
                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm"
                              >
                                <Edit2 size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                disabled={deleting === c.id}
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              >
                                <Trash2 size={14} />
                                {deleting === c.id ? "..." : "Delete"}
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

            {/* Pagination Info */}
            <div className="mt-6 flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-bold text-gray-800">{filteredComments.length}</span> of{" "}
                <span className="font-bold text-gray-800">{comments.length}</span> comments
              </p>
              <p className="text-xs text-gray-500">
                {searchTerm && <span className="text-pink-600 font-medium">Filtered results</span>}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Comments;
