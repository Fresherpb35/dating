import { Bell, Settings } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="bg-white p-4 shadow-md flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
        <span className="text-2xl font-bold text-love-accent">❤️ LoveLink</span>
        <input
          type="text"
          placeholder="Search..."
          className="ml-2 p-2 rounded border border-gray-300 w-full md:w-64"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Bell className="text-gray-600" size={20} />
        <Settings className="text-gray-600" size={20} />
      </div>
    </div>
  );
};

export default Navbar;