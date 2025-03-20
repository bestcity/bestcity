// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Camera, MonitorSmartphone, AlertTriangle, Archive, BarChart2, Users, Settings } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-brand-700' : 'hover:bg-gray-800';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center">
          <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center mr-3">
            <Camera size={20} />
          </div>
          <h1 className="text-xl font-semibold">BestCity AI</h1>
        </div>
        
        {/* Main navigation */}
        <div className="px-4 py-6 flex-1">
          <Link to="/">
            <button className={`flex items-center w-full px-3 py-3 rounded-lg mb-2 ${isActive('/')}`}>
              <Camera className="mr-3" size={20} />
              <span>Live View</span>
            </button>
          </Link>
          
          <Link to="/devices">
            <button className={`flex items-center w-full px-3 py-3 rounded-lg mb-2 ${isActive('/devices')}`}>
              <MonitorSmartphone className="mr-3" size={20} />
              <span>Devices</span>
            </button>
          </Link>
          
          {/* Add more navigation items here */}
        </div>
        
        {/* Bottom section with support */}
        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center justify-center w-full px-3 py-2 bg-gray-800 rounded-lg">
            <Users className="mr-2" size={16} />
            <span>Support</span>
          </button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;