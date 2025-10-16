import { Home, Users, Heart, MessageCircle, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 bg-love-accent text-white rounded fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>
      <div className={`w-64 h-screen bg-love-pink p-4 fixed top-0 left-0 z-40 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <nav>
          <ul className="space-y-2">
            <li>
              <NavLink to="/active-users" className={({ isActive }) => `flex items-center p-2 rounded ${isActive ? 'bg-love-accent text-white' : 'text-gray-600'}`}>
                <Home className="mr-2" size={20} />
                Active Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/users" className={({ isActive }) => `flex items-center p-2 rounded ${isActive ? 'bg-love-accent text-white' : 'text-gray-600'}`}>
                <Users className="mr-2" size={20} />
                Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/matches" className={({ isActive }) => `flex items-center p-2 rounded ${isActive ? 'bg-love-accent text-white' : 'text-gray-600'}`}>
                <Heart className="mr-2" size={20} />
                Matches
              </NavLink>
            </li>
            <li>
              <NavLink to="/chats" className={({ isActive }) => `flex items-center p-2 rounded ${isActive ? 'bg-love-accent text-white' : 'text-gray-600'}`}>
                <MessageCircle className="mr-2" size={20} />
                Chats
              </NavLink>
            </li>
            <li>
              <NavLink to="/subscriptions" className={({ isActive }) => `flex items-center p-2 rounded ${isActive ? 'bg-love-accent text-white' : 'text-gray-600'}`}>
                <Settings className="mr-2" size={20} />
                Subscriptions
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" className={({ isActive }) => `flex items-center p-2 rounded ${isActive ? 'bg-love-accent text-white' : 'text-gray-600'}`}>
                <Settings className="mr-2" size={20} />
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;