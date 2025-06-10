import React from 'react';
import { LogOut } from 'lucide-react';

const Navbar = ({ onLogout }) => {
  return (
    <div className="bg-gray-800 text-white flex justify-between items-center px-6 py-4">
      <h1 className="sm:text-md md:text-2xl font-bold">
        Title Check - File Upload
      </h1>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 text-sm bg-red-600 px-3 py-1 cursor-pointer rounded hover:bg-red-700"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};

export default Navbar;