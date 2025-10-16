import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";

const UserFavs = () => {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavs();
  }, []);

  const fetchFavs = async () => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <Card className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ⭐ User Favorites
          </h2>
          <span className="text-sm text-gray-500">
            Total: <span className="font-semibold">{favs.length}</span>
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Loading user favorites...</p>
            </div>
          </div>
        ) : favs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No user favorites found 😔</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-pink-600 text-white text-left">
                  <th className="py-3 px-4 rounded-tl-lg">#</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Target ID</th>
                  <th className="py-3 px-4 rounded-tr-lg">Created At</th>
                </tr>
              </thead>
              <tbody>
                {favs.map((f, index) => (
                  <tr
                    key={f.id}
                    className="border-b hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-2.5 px-4 text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-gray-800 truncate max-w-[200px]">
                      {f.user_id || "N/A"}
                    </td>
                    <td className="py-2.5 px-4 text-gray-700 truncate max-w-[200px]">
                      {f.target_id || "N/A"}
                    </td>
                    <td className="py-2.5 px-4 text-gray-500">
                      {f.created_at
                        ? new Date(f.created_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserFavs;
