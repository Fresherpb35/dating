import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";
import { Star, RefreshCw, Download, Search, Eye, Trash2, User, Heart, Calendar, TrendingUp, Users } from 'lucide-react';

const UserFavs = () => {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFav, setSelectedFav] = useState(null);

  useEffect(() => {
    fetchFavs();
  }, []);

  const fetchFavs = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching data from Supabase...");
      const { data, error } = await supabase
        .from("user_favs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("✅ Supabase user_favs data:", data);
      setFavs(data || []);
    } catch (err) {
      console.error("❌ Error fetching user_favs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this favorite?")) {
      try {
        const { error } = await supabase
          .from("user_favs")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        setFavs(prev => prev.filter(f => f.id !== id));
        console.log("✅ Favorite deleted");
      } catch (err) {
        console.error("❌ Error deleting favorite:", err.message);
        alert("Failed to delete favorite");
      }
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredFavs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user_favorites_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const filteredFavs = favs.filter(f =>
    f.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.target_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const todayFavs = favs.filter(f => {
    const favDate = new Date(f.created_at).toDateString();
    const today = new Date().toDateString();
    return favDate === today;
  }).length;

  const uniqueUsers = new Set(favs.map(f => f.user_id)).size;
  const thisWeekFavs = favs.filter(f => {
    const favDate = new Date(f.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return favDate >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex flex-col">
      <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="text-white" size={28} fill="white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center gap-2">
                  User Favorites
                  <span className="text-lg sm:text-xl text-yellow-600">({filteredFavs.length})</span>
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Track and manage user favorite profiles
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchFavs}
                disabled={loading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-yellow-300 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin text-yellow-500" : "text-gray-600"} />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Refresh</span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                <Download size={18} />
                <span className="hidden sm:inline text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: "Total Favorites", value: favs.length, icon: Star, color: "from-yellow-500 to-orange-500" },
              { label: "Today", value: todayFavs, icon: Calendar, color: "from-blue-500 to-cyan-500" },
              { label: "Unique Users", value: uniqueUsers, icon: Users, color: "from-purple-500 to-pink-500" },
              { label: "This Week", value: thisWeekFavs, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
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
              placeholder="Search by user ID or target ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all shadow-sm text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <Card className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-0 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-yellow-500 mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base font-medium">Loading user favorites...</p>
              </div>
            ) : filteredFavs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-800 text-lg sm:text-xl font-semibold mb-2">No favorites found</p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {searchTerm ? "Try adjusting your search" : "No favorites in database yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <tr>
                      <th className="py-3 sm:py-4 px-4 font-semibold uppercase tracking-wide">#</th>
                      <th className="py-3 sm:py-4 px-4 font-semibold uppercase tracking-wide">User ID</th>
                      <th className="py-3 sm:py-4 px-4 font-semibold uppercase tracking-wide">Target ID</th>
                      <th className="py-3 sm:py-4 px-4 font-semibold uppercase tracking-wide hidden lg:table-cell">Created At</th>
                      <th className="py-3 sm:py-4 px-4 font-semibold uppercase tracking-wide text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFavs.map((f, index) => (
                      <tr
                        key={f.id}
                        className={`border-b border-gray-100 hover:bg-yellow-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-3 sm:py-4 px-4">
                          <span className="font-bold text-gray-700">{index + 1}</span>
                        </td>
                        <td className="py-3 sm:py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                              <User size={16} />
                            </div>
                            <span className="font-medium text-yellow-700 font-mono text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">
                              {f.user_id || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Heart size={16} className="text-pink-500 flex-shrink-0" fill="currentColor" />
                            <span className="font-medium text-pink-600 font-mono text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">
                              {f.target_id || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">
                              {f.created_at ? new Date(f.created_at).toLocaleDateString() : "-"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {f.created_at ? new Date(f.created_at).toLocaleTimeString() : ""}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedFav(f)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                              title="View details"
                            >
                              <Eye size={18} className="text-gray-600 group-hover:text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                              title="Remove favorite"
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
          {filteredFavs.length > 0 && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-xl sm:rounded-2xl p-4 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-bold text-gray-800">{filteredFavs.length}</span> of{" "}
                <span className="font-bold text-gray-800">{favs.length}</span> favorites
              </p>
              <p className="text-xs text-gray-500">
                {searchTerm && <span className="text-yellow-600 font-medium">Filtered results</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Favorite Details */}
      {selectedFav && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFav(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Star className="text-white" size={24} fill="white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Favorite Details</h3>
              </div>
              <button
                onClick={() => setSelectedFav(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Favorite ID</label>
                <p className="mt-1 text-gray-800 font-mono bg-gray-50 p-3 rounded-xl">{selectedFav.id}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">User ID</label>
                <div className="mt-1 flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                  <User size={16} className="text-yellow-500" />
                  <p className="text-gray-800 font-mono">{selectedFav.user_id || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Target ID (Favorited Profile)</label>
                <div className="mt-1 flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                  <Heart size={16} className="text-pink-500" fill="currentColor" />
                  <p className="text-gray-800 font-mono">{selectedFav.target_id || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Created At</label>
                <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-xl">
                  {selectedFav.created_at ? new Date(selectedFav.created_at).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedFav(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedFav.id);
                  setSelectedFav(null);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Remove Favorite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFavs;
