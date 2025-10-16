import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";
import CustomLineChart from "../components/Charts/LineChart";
import toast, { Toaster } from "react-hot-toast"; // Optional: for notifications

const Matches = () => {
  const [likesData, setLikesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchLikes();
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchLikes();
      else setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchLikes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("✅ Fetched likes from Supabase:", data);
      setLikesData(data || []);
    } catch (err) {
      console.error("❌ Error fetching likes:", err.message, err.code);
      setError(`Failed to fetch likes: ${err.message} (Code: ${err.code || "Unknown"})`);
      toast.error(`Failed to fetch likes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Convert likes to daily counts
  const dailyCounts = Array(7).fill(0); // Sun-Sat
  likesData.forEach((like) => {
    if (like.created_at) {
      const day = new Date(like.created_at).getDay(); // 0=Sun, 6=Sat
      dailyCounts[day]++;
    }
  });

  const chartData = dailyCounts.map((value, index) => ({
    name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
    value,
    index: index + 1, // For black # numbering in tooltip
  }));

  // Total likes count
  const totalLikes = likesData.length;

  async function handleLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      toast.success("Logged in successfully!");
      fetchLikes();
    } catch (err) {
      console.error("❌ Login error:", err.message);
      setError(`Login failed: ${err.message}`);
      toast.error(`Login failed: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setLikesData([]);
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("❌ Logout error:", err.message);
      setError(`Logout failed: ${err.message}`);
      toast.error(`Logout failed: ${err.message}`);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center p-3">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-md">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center">
            📊 Admin Login
          </h2>
          {error && <p className="text-red-500 text-xs sm:text-sm mb-3 text-center">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className={`w-full px-4 py-2 rounded-lg text-xs sm:text-sm text-white transition ${
                authLoading
                  ? "bg-pink-300 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {authLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-3">
            Need help? Contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
              📊 Likes Per Day ({totalLikes} total)
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Weekly overview of user likes and matches
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-700 transition text-xs sm:text-sm flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              <button
                onClick={fetchLikes}
                className="text-red-600 text-xs sm:text-sm hover:underline mt-1"
              >
                Retry
              </button>
            </div>
          )}
          
          <Card className="p-3 sm:p-4 lg:p-6 shadow-md bg-white rounded-lg">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-pink-500 mb-3 sm:mb-4"></div>
                <p className="text-gray-500 text-xs sm:text-sm">Loading likes data...</p>
              </div>
            ) : chartData.length > 0 && totalLikes > 0 ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Likes</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalLikes}</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Daily Average</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {Math.round(totalLikes / 7)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Peak Day</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {Math.max(...dailyCounts)} likes
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Active Days</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {dailyCounts.filter(count => count > 0).length}/{7}
                    </p>
                  </div>
                </div>

                {/* Chart Container */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Weekly Likes Trend</h3>
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleDateString()} - Last 7 days
                    </span>
                  </div>
                  <div className="h-64 sm:h-80">
                    <CustomLineChart 
                      data={chartData} 
                      dataKey="value"
                      strokeColor="#ec4899"
                      gradientColors={['#ec4899', '#f472b6']}
                      tooltipTitle="Day"
                      xAxisLabel="Day of Week"
                      yAxisLabel="Likes"
                    />
                  </div>
                </div>

                {/* Day-by-day breakdown */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">Daily Breakdown</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left font-medium text-gray-700">#</th>
                          <th className="p-3 text-left font-medium text-gray-700">Day</th>
                          <th className="p-3 text-left font-medium text-gray-700">Likes</th>
                          <th className="p-3 text-left font-medium text-gray-700">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((day, idx) => (
                          <tr key={day.name} className="border-b hover:bg-gray-50 transition">
                            <td className="p-3 text-gray-800 font-medium">{idx + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  day.value > 0 ? 'bg-pink-500' : 'bg-gray-300'
                                }`}></div>
                                <span className="text-gray-700">{day.name}</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-gray-800">{day.value}</td>
                            <td className="p-3">
                              <span className={`text-sm ${
                                day.value === Math.max(...chartData.map(d => d.value))
                                  ? 'text-pink-600 font-semibold'
                                  : 'text-gray-600'
                              }`}>
                                {totalLikes > 0 ? `${((day.value / totalLikes) * 100).toFixed(1)}%` : '0%'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-400">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Like Data</h3>
                <p className="text-gray-500 text-xs sm:text-sm mb-4">
                  No likes found in the database. Users haven't made any matches yet.
                </p>
                <button
                  onClick={fetchLikes}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition text-xs sm:text-sm"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Matches;