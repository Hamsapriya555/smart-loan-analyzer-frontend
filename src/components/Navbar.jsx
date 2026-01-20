import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <nav className="bg-white text-gray-800 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + Title */}
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏠📈</span>
            <Link to="/dashboard" className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition">
              Smart Loan & Debt Stress Analyzer
            </Link>
          </div>

          {/* Center: Navigation */}
          {user && (
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
              <Link to="/loans" className="hover:text-blue-600 transition">My Loans</Link>
              <Link to="/simulation" className="hover:text-blue-600 transition">Simulation</Link>
              <Link to="/analysis" className="hover:text-blue-600 transition">Stress Analysis</Link>
              <Link to="/admin" className="hover:text-blue-600 transition">Admin Panel</Link>
            </div>
          )}

          {/* Right: User Greeting + Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hello, {user.name || 'John'}!</span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
