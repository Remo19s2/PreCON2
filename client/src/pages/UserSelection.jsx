import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';

function UserSelection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    navigate(`/recommendations/${userId}`);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const languageMap = {
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ml': 'Malayalam'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-4 text-center">
        Select a User
      </h1>
      <p className="text-gray-400 text-center mb-8">
        Choose a user to get personalized movie recommendations
      </p>

      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Search by name or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center text-white text-xl py-20">
          Loading users...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filteredUsers.map(user => (
            <div
              key={user.userId}
              onClick={() => handleUserSelect(user.userId)}
              className="bg-slate-800 p-6 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700 hover:border-blue-500"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 text-2xl">
                👤
              </div>
              <h3 className="text-white font-semibold text-center mb-2">
                {user.name}
              </h3>
              <p className="text-gray-400 text-sm text-center mb-1">
                ID: {user.userId}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-gray-500 mb-1">Preferences:</p>
                <div className="flex flex-col gap-1">
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded text-center">
                    {user.preferredGenre}
                  </span>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded text-center">
                    {languageMap[user.preferredLanguage] || user.preferredLanguage}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          No users found
        </div>
      )}
    </div>
  );
}

export default UserSelection;
