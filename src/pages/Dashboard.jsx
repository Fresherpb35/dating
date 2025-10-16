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
    { name: "Messages", path: "/chats", icon: MessageCircle },
    { name: "Likes", path: "/matches", icon: Heart },
    { name: "Reels", path: "/reels", icon: Video },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 p-4 flex flex-col transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-pink-600">Admin Panel</h2>
        <button className="md:hidden" onClick={toggleSidebar}>
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
              className="flex items-center gap-3 p-3 mb-2 rounded-lg hover:bg-pink-50 text-gray-700 font-medium transition-colors"
              onClick={toggleSidebar}
            >
              <Icon className="w-5 h-5 text-pink-500" />
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
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={toggleSidebar}>
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
      >
        <LogOut className="w-4 h-4" /> Logout
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
    contentDistribution: []
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
      const tables = ["users","messages","likes","comments","reels","profiles","search_profiles","user_favs"];
      const newCounts = {};
      for (let table of tables) {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
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
    const weeklyUsers = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => ({
      day,
      users: Math.floor(Math.random() * 100) + 50
    }));
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

  const COLORS = ['#ec4899', '#f472b6', '#fb7185', '#fda4af'];
  const iconMap = {
    users: Users, messages: MessageCircle, likes: Heart, comments: MessageSquare,
    reels: Video, profiles: UserCircle, search_profiles: Search, user_favs: Star
  };
  const tableRoutes = {
    users: "/users", messages: "/chats", likes: "/matches", comments: "/comments",
    reels: "/reels", profiles: "/profiles", search_profiles: "/search-profiles", user_favs: "/user-favs"
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Object.entries(counts).map(([table, count]) => {
              const Icon = iconMap[table] || Users;
              return (
                <Link key={table} to={tableRoutes[table]} className="w-full">
                  <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-pink-500 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">{table.replace("_"," ")}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{count || 0}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full">
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {/* Weekly Users Line Chart */}
            <Card className="p-4 sm:p-6 w-full">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" /> Weekly User Activity
              </h3>
              <ResponsiveContainer width="100%" height={200} className="sm:h-[300px]">
                <AreaChart data={chartData.weeklyUsers}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '10px', sm: { fontSize: '12px' } }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '10px', sm: { fontSize: '12px' } }} />
                  <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Engagement Pie Chart */}
            <Card className="p-4 sm:p-6 w-full">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" /> User Engagement Distribution
              </h3>
              <ResponsiveContainer width="100%" height={200} className="sm:h-[300px]">
                <PieChart>
                  <Pie
                    data={chartData.engagementData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {chartData.engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Content Distribution Bar Chart */}
          <Card className="p-4 sm:p-6 w-full mt-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" /> Content Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200} className="sm:h-[300px]">
              <BarChart data={chartData.contentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '10px', sm: { fontSize: '12px' } }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '10px', sm: { fontSize: '12px' } }} />
                <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#ec4899" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Activity */}
          <Card className="p-4 sm:p-6 w-full mt-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" /> Recent Users
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? recentActivity.map((user, index) => (
                <div key={user.id || index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">{user.email || 'Unknown User'}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link to={`/users/${user.id}`} className="mt-2 sm:mt-0 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-xs sm:text-sm font-medium">
                    View Profile
                  </Link>
                </div>
              )) : <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No recent activity</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
