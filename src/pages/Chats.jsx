import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Chats = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  // 🟢 Fetch Messages
  async function fetchMessages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("✅ Messages fetched:", data);
      setMessages(data || []);
    } catch (err) {
      console.error("❌ Error fetching messages:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔴 Delete Message
  async function handleDelete(id) {
    const confirmDelete = confirm("Are you sure you want to delete this message?");
    if (!confirmDelete) return;

    setDeleting(true);
    const { error } = await supabase.from("messages").delete().eq("id", id);
    setDeleting(false);

    if (error) {
      console.error("❌ Error deleting message:", error);
      alert("Failed to delete message!");
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      alert("Message deleted successfully!");
    }
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 max-w-7xl mx-auto text-center">
          💬 Chats ({messages.length})
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-pink-500 mb-3 sm:mb-4"></div>
              <p className="text-gray-500 text-xs sm:text-sm">Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full"
                >
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <img
                      src={msg.user_image || "https://via.placeholder.com/40"}
                      alt={msg.username || "User"}
                      className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-pink-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">
                        {msg.username || "Unknown"}
                      </p>
                      <p className="text-gray-700 mt-1 text-xs sm:text-sm lg:text-base line-clamp-2">
                        {msg.text}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 sm:mt-2 block">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm"
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <p className="text-gray-500 text-lg sm:text-xl">💬</p>
              <p className="text-gray-500 italic text-xs sm:text-sm mt-2">No messages found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
