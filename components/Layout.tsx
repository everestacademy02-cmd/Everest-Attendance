import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'fa-chart-line' },
    { path: '/admin/staff', label: 'Manage Staff', icon: 'fa-users' },
    { path: '/admin/attendance', label: 'Attendance', icon: 'fa-clipboard-list' },
    { path: '/admin/settings', label: 'Settings', icon: 'fa-cogs' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-xl font-bold">Everest Academy</h2>
          <p className="text-xs text-blue-300 mt-1">Surya Nagar, Alwar</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded transition ${
                location.pathname === item.path ? 'bg-blue-800 text-white shadow' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="bg-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-xs">AD</div>
            <div className="text-sm">
              <div className="font-semibold">{user?.username}</div>
              <div className="text-xs text-blue-300">Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm md:hidden p-4 flex justify-between items-center z-20">
           <h1 className="font-bold text-primary">Everest Admin</h1>
           <button onClick={handleLogout}><i className="fas fa-sign-out-alt text-gray-600"></i></button>
        </header>

        {/* Mobile Nav (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-30">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center p-2 text-xs ${location.pathname === item.path ? 'text-primary font-bold' : 'text-gray-500'}`}
            >
              <i className={`fas ${item.icon} text-lg mb-1`}></i>
              {item.label.split(' ')[0]}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};
