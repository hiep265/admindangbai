import React from 'react';
import { Share2, Settings, Bell, User, Users, Home, DollarSign, LogOut, Lightbulb } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  connectedCount: number;
  totalPosts: number;
}

export const Header: React.FC<HeaderProps> = ({ connectedCount, totalPosts }) => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Clickable to home */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Share2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Social Media</h1>
              <p className="text-xs text-gray-500">Unified Social Media Manager</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home size={16} />
              Home
            </Link>

            <Link
              to="/solution"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/solution') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Lightbulb size={16} />
              Solution
            </Link>

            <Link
              to="/pricing"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/pricing') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <DollarSign size={16} />
              Pricing
            </Link>

            {/* Authenticated-only navigation */}
            {isAuthenticated && (
              <>
                <Link
                  to="/posts"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/posts') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Share2 size={16} />
                  Posts
                </Link>
                
                <Link
                  to="/accounts"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/accounts') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users size={16} />
                  Accounts
                  {connectedCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {connectedCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Right side - Stats & Actions */}
          <div className="flex items-center space-x-4">
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  {/* User Profile Section */}
                  <div className="flex items-center gap-3">
                    {/* User Avatar & Info */}
                    <Link to="/profile" className="hidden sm:flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{user?.full_name}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user?.full_name?.charAt(0).toUpperCase()}
                      </div>
                    </Link>
                    {/* Mobile Avatar Only */}
                    <Link to="/profile" className="sm:hidden w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:bg-blue-600 transition-colors">
                      {user?.full_name?.charAt(0).toUpperCase()}
                    </Link>
                    {/* Logout Button */}
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                      title="Đăng xuất"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Login/Register buttons for non-authenticated users */}
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium rounded-lg hover:bg-gray-100"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <Link
              to="/"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home size={20} />
            </Link>

            <Link
              to="/solution"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/solution') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Lightbulb size={20} />
            </Link>

            <Link
              to="/pricing"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/pricing') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <DollarSign size={20} />
            </Link>

            {/* Authenticated-only mobile navigation */}
            {isAuthenticated && (
              <>
                <Link
                  to="/posts"
                  className={`p-2 rounded-lg transition-colors ${
                    isActive('/posts') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Share2 size={20} />
                </Link>
                
                <Link
                  to="/accounts"
                  className={`p-2 rounded-lg transition-colors relative ${
                    isActive('/accounts') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} />
                  {connectedCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {connectedCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};