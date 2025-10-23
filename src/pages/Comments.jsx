import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";
import { MessageSquare, RefreshCw, Download, Search, Eye, Trash2, User, Video, Calendar, TrendingUp } from 'lucide-react';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("id, created_at, user_id, reel_id, comment_text")
        .order("created_at", { ascending: false });

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
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        setComments(prev => prev.filter(c => c.id !== id));
        console.log("✅ Comment deleted");
      } catch (err) {
        console.error("❌ Error deleting comment:", err.message);
        alert("Failed to delete comment");
      }
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

  const filteredComments = comments.filter(c =>
    c.comment_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.reel_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const todayComments = comments.filter(c => {
    const commentDate = new Date(c.created_at).toDateString();
    const today = new Date().toDateString();
    return commentDate === today;
  }).length;

  const uniqueUsers = new Set(comments.map(c => c.user_id)).size;

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col">
      {/* Enhanced Header */}
      <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center gap-2">
                  User Comments
                  <span className="text-lg sm:text-xl text-pink-600">({filteredComments.length})</span>
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Review and manage all user comments
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
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                <Download size={18} />
                <span className="hidden sm:inline text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
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

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search comments, users, reel IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-sm text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-0 sm:p-0 shadow-lg bg-white rounded-xl sm:rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base font-medium">Loading comments...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-800 text-lg sm:text-xl font-semibold mb-2">No comments found</p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {searchTerm ? "Try adjusting your search" : "No comments in database yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                    <tr>
                      <th className="p-3 sm:p-4 font-semibold uppercase tracking-wide">#</th>
                      <th className="p-3 sm:p-4 font-semibold uppercase tracking-wide">User ID</th>
                      <th className="p-3 sm:p-4 font-semibold uppercase tracking-wide hidden md:table-cell">Reel ID</th>
                      <th className="p-3 sm:p-4 font-semibold uppercase tracking-wide">Comment</th>
                      <th className="p-3 sm:p-4 font-semibold uppercase tracking-wide hidden lg:table-cell">Created At</th>
                      <th className="p-3 sm:p-4 font-semibold uppercase tracking-wide text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComments.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`border-b border-gray-100 hover:bg-pink-50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-3 sm:p-4">
                          <span className="font-bold text-gray-700">{idx + 1}</span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                              <User size={16} />
                            </div>
                            <span className="font-medium text-pink-600 font-mono text-xs sm:text-sm truncate">
                              {c.user_id}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Video size={16} className="text-purple-500 flex-shrink-0" />
                            <span className="font-medium text-purple-600 font-mono text-xs sm:text-sm truncate">
                              {c.reel_id}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 max-w-xs">
                          <p className="text-gray-800 line-clamp-2">{c.comment_text}</p>
                        </td>
                        <td className="p-3 sm:p-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{new Date(c.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleTimeString()}</p>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedComment(c)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                              title="View details"
                            >
                              <Eye size={18} className="text-gray-600 group-hover:text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Delete comment"
                            >
                              <Trash2 size={18} className="text-gray-600 group-hover:text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Pagination Info */}
          {filteredComments.length > 0 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-bold text-gray-800">{filteredComments.length}</span> of{" "}
                <span className="font-bold text-gray-800">{comments.length}</span> comments
              </p>
              <p className="text-xs text-gray-500">
                {searchTerm && <span className="text-pink-600 font-medium">Filtered results</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Comment Details */}
      {selectedComment && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedComment(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Comment Details</h3>
              <button
                onClick={() => setSelectedComment(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">User ID</label>
                <div className="mt-1 flex items-center gap-2">
                  <User size={16} className="text-pink-500" />
                  <p className="text-gray-800 font-mono">{selectedComment.user_id}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Reel ID</label>
                <div className="mt-1 flex items-center gap-2">
                  <Video size={16} className="text-purple-500" />
                  <p className="text-gray-800 font-mono">{selectedComment.reel_id}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Comment</label>
                <p className="mt-1 text-gray-800 bg-gray-50 p-4 rounded-xl">{selectedComment.comment_text}</p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Created At</label>
                <p className="mt-1 text-gray-800">
                  {new Date(selectedComment.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedComment(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedComment.id);
                  setSelectedComment(null);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Delete Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;
