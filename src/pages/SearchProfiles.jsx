import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";

const SearchProfiles = () => {
  const [searchProfiles, setSearchProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearchProfiles();
  }, []);

  const fetchSearchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("search_profiles")
        .select("id, username, bio, image_url, is_verified")
        .order("username", { ascending: true });

      if (error) throw error;
      console.log("✅ Fetched profiles:", data);
      setSearchProfiles(data || []);
    } catch (err) {
      console.error("❌ Error fetching search_profiles:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            🔍 Search Profiles ({searchProfiles.length})
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Browse all available profiles and their details
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-3 sm:p-4 lg:p-6 shadow-md bg-white rounded-lg">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-purple-500 mb-3 sm:mb-4"></div>
                <p className="text-gray-500 text-xs sm:text-sm">Loading profiles...</p>
              </div>
            ) : searchProfiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <p className="text-gray-500 text-lg sm:text-xl">🔍</p>
                <p className="text-gray-500 italic text-xs sm:text-sm mt-2">No profiles found.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm table-fixed">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-2 sm:p-3 w-[10%] min-w-[40px]">#</th>
                    <th className="p-2 sm:p-3 w-[15%] min-w-[60px]">Profile</th>
                    <th className="p-2 sm:p-3 w-[20%] min-w-[80px]">Username</th>
                    <th className="p-2 sm:p-3 w-[15%] min-w-[60px]">City</th>
                    <th className="p-2 sm:p-3 w-[15%] min-w-[60px]">Country</th>
                    <th className="p-2 sm:p-3 w-[25%] min-w-[100px]">Bio</th>
                  </tr>
                </thead>
                <tbody>
                  {searchProfiles.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`border-b hover:bg-gray-100 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-2 sm:p-3 text-gray-800 font-medium">{idx + 1}</td>
                      <td className="p-2 sm:p-3">
                        <img
                          src={p.image_url || "https://via.placeholder.com/40"}
                          alt={p.username || "Unknown"}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-purple-300"
                        />
                      </td>
                      <td className="p-2 sm:p-3 flex items-center space-x-2">
                        <span className="font-semibold text-gray-800 truncate max-w-[80px] sm:max-w-[120px]">
                          {p.username || "Unknown"}
                        </span>
                        {p.is_verified && (
                          <span className="text-blue-500" title="Verified">✔️</span>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-gray-700 truncate">{p.city || "N/A"}</td>
                      <td className="p-2 sm:p-3 text-gray-700 truncate">{p.country || "N/A"}</td>
                      <td className="p-2 sm:p-3 text-gray-700 truncate max-w-[100px] sm:max-w-[150px]">
                        {p.bio || "No bio"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SearchProfiles;