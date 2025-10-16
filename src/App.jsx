import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Matches from "./pages/Matches";
import AdminLogin from "./pages/AdminLogin";
import Chats from "./pages/Chats";
import Comments from "./pages/Comments";
import Reels from "./pages/Reels";
import Profiles from "./pages/Profiles";
import SearchProfiles from "./pages/SearchProfiles";
import UserFavs from "./pages/UserFavs";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const storedSession = localStorage.getItem("adminSession");
    if (storedSession) setSession(JSON.parse(storedSession));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session)
        localStorage.setItem("adminSession", JSON.stringify(session));
      else localStorage.removeItem("adminSession");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin setSession={setSession} />} />
      {session ? (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/comments" element={<Comments />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/search-profiles" element={<SearchProfiles />} />
          <Route path="/user-favs" element={<UserFavs />} />
        </>
      ) : (
        <Route path="*" element={<AdminLogin setSession={setSession} />} />
      )}
    </Routes>
  );
}

export default App;
