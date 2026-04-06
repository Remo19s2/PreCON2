import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 shadow-lg border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-blue-400">
            PreCON - Movie Recommender
          </Link>
          
          <div className="flex gap-6 items-center">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
                
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                {!isAdmin() && (
                  <Link 
                    to="/recommendations" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    My Recommendations
                  </Link>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="text-gray-400 text-sm">
                    <span className="text-white">{user.name || user.userId}</span>
                    {isAdmin() && (
                      <span className="ml-2 text-xs bg-yellow-600 px-2 py-1 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
