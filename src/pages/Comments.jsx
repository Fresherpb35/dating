import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            💬 User Comments ({comments.length})
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Review all user comments below
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-3 sm:p-4 lg:p-6 shadow-md bg-white rounded-lg">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-pink-500 mb-3 sm:mb-4"></div>
                <p className="text-gray-500 text-xs sm:text-sm">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <p className="text-gray-500 text-lg sm:text-xl">💬</p>
                <p className="text-gray-500 italic text-xs sm:text-sm mt-2">No comments found.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm table-fixed">
                <thead className="bg-pink-600 text-white">
                  <tr>
                    <th className="p-2 sm:p-3 w-[10%] min-w-[40px]"># </th>
                    <th className="p-2 sm:p-3 w-[15%] min-w-[60px]">User ID</th>
                    <th className="p-2 sm:p-3 w-[15%] min-w-[60px]">Reel ID</th>
                    <th className="p-2 sm:p-3 w-[40%] min-w-[100px] sm:min-w-[150px]">Comment</th>
                    <th className="p-2 sm:p-3 w-[20%] min-w-[80px]">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`border-b hover:bg-gray-100 transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-2 sm:p-3 truncate">{idx + 1}</td>
                      <td className="p-2 sm:p-3 font-medium text-pink-600 truncate">
                        {c.user_id}
                      </td>
                      <td className="p-2 sm:p-3 font-medium text-purple-600 truncate">
                        {c.reel_id}
                      </td>
                      <td className="p-2 sm:p-3 text-gray-800 truncate max-w-[100px] sm:max-w-[150px]">
                        {c.comment_text}
                      </td>
                      <td className="p-2 sm:p-3 text-gray-500 text-xs sm:text-sm truncate">
                        {new Date(c.created_at).toLocaleDateString()}
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

export default Comments;