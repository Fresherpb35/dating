import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username", { ascending: true });

      if (error) {
        console.error("❌ Supabase error:", error.message);
        throw error;
      }
      console.log("✅ Profiles fetched:", data);
      setProfiles(data || []);
    } catch (err) {
      console.error("❌ Error fetching profiles:", err.message);
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
            👤 Profiles ({profiles.length})
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Browse all user profiles and their details
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
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <p className="text-gray-500 text-lg sm:text-xl">👤</p>
                <p className="text-gray-500 italic text-xs sm:text-sm mt-2">No profiles found.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm table-fixed">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-2 sm:p-3 w-[10%] min-w-[40px]">#</th>
                    <th className="p-2 sm:p-3 w-[25%] min-w-[80px]">Username</th>
                    <th className="p-2 sm:p-3 w-[30%] min-w-[100px]">Bio</th>
                    <th className="p-2 sm:p-3 w-[20%] min-w-[60px]">City</th>
                    <th className="p-2 sm:p-3 w-[25%] min-w-[60px]">Country</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`border-b hover:bg-gray-100 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-2 sm:p-3 text-gray-800 font-medium">{idx + 1}</td>
                      <td className="p-2 sm:p-3 text-purple-600 font-medium truncate max-w-[80px] sm:max-w-[120px]">
                        {p.username || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 text-gray-700 truncate max-w-[100px] sm:max-w-[150px]">
                        {p.bio || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 text-gray-700 truncate">{p.city || "N/A"}</td>
                      <td className="p-2 sm:p-3 text-gray-700 truncate">{p.country || "N/A"}</td>
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

export default Profiles;