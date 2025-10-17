import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, MessageCircle, Heart, MessageSquare, Video, 
  UserCircle, Search, Star, TrendingUp, LogOut, Menu, X 
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from "recharts";
import { supabase } from "../lib/supabase";
import Card from "../components/Card";

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: Users },
    { name: "Users", path: "/users", icon: UserCircle },
    { name: "Chats", path: "/chats", icon: MessageCircle },
    { name: "Likes", path: "/matches", icon: Heart },
    { name: "Reels", path: "/reels", icon: Video },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-full sm:w-64 bg-white border-r border-gray-200 p-3 sm:p-4 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static md:flex md:min-w-[14rem] md:max-w-[14rem]`}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600">Admin Panel</h2>
        <button
          className="md:hidden"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <nav className="flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 mb-2 rounded-lg hover:bg-pink-50 text-gray-700 font-medium transition-colors text-xs sm:text-sm md:text-base"
              onClick={toggleSidebar}
              aria-label={`Navigate to ${item.name}`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

// Navbar Component
const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("adminSession");
    navigate("/admin-login");
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          className="md:hidden"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>
        <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">
          Dashboard Overview
        </h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Log out"
      >
        <LogOut className="w-4 h-4 sm:w-4 sm:h-4" /> Logout
      </button>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({
    weeklyUsers: [],
    engagementData: [],
    contentDistribution: [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchCounts();
    fetchRecentActivity();
  }, []);

  useEffect(() => {
    if (Object.keys(counts).length > 0) generateChartData();
  }, [counts]);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const tables = [
        "users",
        "messages",
        "likes",
        "comments",
        "reels",
        "profiles",
        "search_profiles",
        "user_favs",
      ];
      const newCounts = {};
      for (let table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        if (error) throw error;
        newCounts[table] = count;
      }
      setCounts(newCounts);
    } catch (err) {
      console.error("Error fetching counts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: recentUsers } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentActivity(recentUsers || []);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  };

  const generateChartData = () => {
    const weeklyUsers = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day) => ({
        day,
        users: Math.floor(Math.random() * 100) + 50,
      })
    );
    const engagementData = [
      { name: "Messages", value: counts.messages || 0 },
      { name: "Likes", value: counts.likes || 0 },
      { name: "Comments", value: counts.comments || 0 },
      { name: "Favorites", value: counts.user_favs || 0 },
    ];
    const contentDistribution = [
      { name: "Profiles", value: counts.profiles || 0 },
      { name: "Reels", value: counts.reels || 0 },
      { name: "Searches", value: counts.search_profiles || 0 },
    ];
    setChartData({ weeklyUsers, engagementData, contentDistribution });
  };

  const COLORS = ["#ec4899", "#f472b6", "#fb7185", "#fda4af"];
  const iconMap = {
    users: Users,
    messages: MessageCircle,
    likes: Heart,
    comments: MessageSquare,
    reels: Video,
    profiles: UserCircle,
    search_profiles: Search,
    user_favs: Star,
  };
  const tableRoutes = {
    users: "/users",
    messages: "/chats",
    likes: "/matches",
    comments: "/comments",
    reels: "/reels",
    profiles: "/profiles",
    search_profiles: "/search-profiles",
    user_favs: "/user-favs",
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-100 w-full">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-t-4 border-b-4 border-pink-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-pink-100 w-full">
      <div className="flex flex-col md:flex-row w-full">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          <Navbar toggleSidebar={toggleSidebar} />

          <div className="flex-1 flex flex-col px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 gap-3 sm:gap-4 md:gap-6 w-full">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full">
              {Object.entries(counts).map(([table, count]) => {
                const Icon = iconMap[table] || Users;
                return (
                  <Link
                    key={table}
                    to={tableRoutes[table]}
                    className="w-full"
                    aria-label={`View ${table.replace("_", " ")} details`}
                  >
                    <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-pink-600 bg-white p-2 sm:p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {table.replace("_", " ")}
                          </p>
                          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">
                            {count || 0}
                          </p>
                        </div>
                        <div className="p-1 sm:p-2 md:p-3 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-pink-600" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 w-full">
              {/* Weekly Users Chart */}
              <Card className="p-2 sm:p-3 md:p-4 w-full lg:w-1/2 bg-white">
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-pink-600" /> Weekly User Activity
                </h3>
                <ResponsiveContainer width="100%" height={150} className="sm:h-[180px] md:h-[200px] lg:h-[250px]">
                  <AreaChart data={chartData.weeklyUsers}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="day"
                      stroke="#9ca3af"
                      style={{ fontSize: "9px" }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: "9px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontSize: "10px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#ec4899"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Engagement Pie Chart */}
              <Card className="p-2 sm:p-3 md:p-4 w-full lg:w-1/2 bg-white">
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-2">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-pink-600" /> User Engagement Distribution
                </h3>
                <ResponsiveContainer width="100%" height={150} className="sm:h-[180px] md:h-[200px] lg:h-[250px]">
                  <PieChart>
                    <Pie
                      data={chartData.engagementData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      sm:outerRadius={60}
                      md:outerRadius={70}
                      lg:outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={true}
                    >
                      {chartData.engagementData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontSize: "10px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Content Distribution Chart */}
            <Card className="p-2 sm:p-3 md:p-4 w-full mt-2 sm:mt-3 md:mt-4 bg-white">
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-2">
                <Video className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-pink-600" /> Content Distribution
              </h3>
              <ResponsiveContainer width="100%" height={150} className="sm:h-[180px] md:h-[200px] lg:h-[250px]">
                <BarChart data={chartData.contentDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    style={{ fontSize: "9px" }}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "9px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "10px",
                    }}
                  />
                  <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Recent Activity */}
            <Card className="p-2 sm:p-3 md:p-4 w-full mt-2 sm:mt-3 md:mt-4 bg-white">
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-pink-600" /> Recent Users
              </h3>
              <div className="flex flex-col gap-2 sm:gap-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((user, index) => (
                    <div
                      key={user.id || index}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 md:p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] sm:text-xs md:text-sm">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">
                            {user.email || "Unknown User"}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/users/${user.id}`}
                        className="mt-2 sm:mt-0 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-[10px] sm:text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-400"
                        aria-label={`View profile of ${user.email || "Unknown User"}`}
                      >
                        View Profile
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4 sm:py-6 text-xs sm:text-sm">
                    No recent activity
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
