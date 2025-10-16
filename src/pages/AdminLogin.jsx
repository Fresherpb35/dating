import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Invalid credentials! Please try again.");
      console.error("Auth error:", error);
      return;
    }

    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", trimmedEmail)
      .single();

    if (adminError || !adminData) {
      setError("Access denied! You are not an admin.");
      await supabase.auth.signOut();
      return;
    }

    localStorage.setItem("adminSession", JSON.stringify(data.session));
    navigate("/");
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200">
      <div className="w-full max-w-lg lg:max-w-xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 border border-pink-200 backdrop-blur-sm">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4 shadow-lg">
              <span className="text-2xl sm:text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Admin Login
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-4">Welcome back! Please login to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none text-gray-900 placeholder-gray-400 bg-gray-50 transition-all duration-200 hover:border-pink-300 min-h-[44px] text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="admin@example.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent focus:outline-none text-gray-900 placeholder-gray-400 bg-gray-50 transition-all duration-200 hover:border-pink-300 min-h-[44px] text-sm sm:text-base pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4/6 transform -translate-y-1/2 text-xl text-gray-500 hover:text-pink-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 animate-shake">
                <p className="text-red-600 text-sm sm:text-base text-center font-medium">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 active:bg-pink-800 text-white py-3 sm:py-3.5 px-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}