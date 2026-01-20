import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/loans', label: '💳 Loans', icon: '💳' },
    { path: '/stress-analysis', label: '📈 Stress Analysis', icon: '📈' },
    { path: '/simulation', label: '🎯 Simulation', icon: '🎯' },
    { path: '/analytics', label: '📉 Analytics', icon: '📉' },
    { path: '/reminders', label: '⏰ Reminders', icon: '⏰' },
    { path: '/credit-score', label: '💠 Credit Score', icon: '💠' },
  ];

  // Add admin menu if user is admin
  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', label: '⚙️ Admin Panel', icon: '⚙️' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAssistantClick = () => {
    setIsAssistantOpen(true);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-950 border-r border-gray-800 transition-all duration-300 z-20 ${
          isOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">Loan Analyzer</h1>
                <p className="text-gray-400 text-xs">v1.0</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white transition-colors p-1 lg:hidden"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path || item.label}>
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left ${
                      'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={!isOpen ? item.label : ''}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {isOpen && <span className="font-medium text-sm">{item.label.split(' ')[1]}</span>}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={!isOpen ? item.label : ''}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {isOpen && <span className="font-medium text-sm">{item.label.split(' ')[1]}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          {isOpen && user && (
            <div className="px-4 py-3 bg-gray-800 rounded-lg">
              <p className="text-gray-200 text-sm font-medium truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
            title={!isOpen ? 'Logout' : ''}
          >
            <span className="text-lg">🚪</span>
            {isOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content margin adjustment */}
      <style>{`
        .sidebar-margin {
          margin-left: ${isOpen ? '16rem' : '5rem'};
          transition: margin-left 0.3s ease;
        }
        @media (max-width: 1024px) {
          .sidebar-margin {
            margin-left: 0;
          }
        }
      `}</style>


    </>
  );
};

export default Sidebar;
