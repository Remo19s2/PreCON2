import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

function AdminDashboard() {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    preferredGenre: '',
    preferredLanguage: '',
    role: 'user'
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataGenerating, setDataGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Horror', 'Crime', 'Family'];
  const languages = [
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'ml', name: 'Malayalam' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleGenerateData = async () => {
    setDataGenerating(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Triggering data generation...');
      const result = await adminService.generateData();
      console.log('✅ Generation result:', result);
      
      const statsMsg = result.stats 
        ? ` (${result.stats.movies} movies, ${result.stats.users} users, ${result.stats.ratings} ratings)`
        : '';
      
      setSuccess((result.message || 'Data generated successfully!') + statsMsg);
      loadUsers();
    } catch (err) {
      console.error('❌ Error generating data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate data');
    } finally {
      setDataGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.userId || !formData.preferredGenre || !formData.preferredLanguage) {
      setError('All required fields must be filled');
      return;
    }

    setLoading(true);
    try {
      const result = await adminService.createUser(formData);
      setSuccess(result.message || 'User created successfully!');
      setFormData({ userId: '', name: '', preferredGenre: '', preferredLanguage: '', role: 'user' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const languageMap = { 'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu', 'ml': 'Malayalam' };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">👨‍💼 Admin Dashboard</h1>
          <p className="text-gray-400">Manage users and generate system data</p>
        </div>

        <div className="mb-8 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 border border-blue-700">
          <h2 className="text-2xl font-semibold text-white mb-4">🚀 Generate System Data</h2>
          <p className="text-gray-300 mb-4">Fetch movies from TMDb, generate 100 users, and create ratings.</p>
          <button
            onClick={handleGenerateData}
            disabled={dataGenerating}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {dataGenerating ? '⏳ Generating Data...' : '✨ Generate Data'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-600 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900 bg-opacity-50 border border-green-600 rounded-lg text-green-200">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Create New User</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">User ID *</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="e.g., user101"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">Name (Optional)</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="User's full name"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">Preferred Genre *</label>
                <select
                  name="preferredGenre"
                  value={formData.preferredGenre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select a genre</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2 font-medium">Preferred Language *</label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select a language</option>
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-gray-500 text-xs mt-1">
                  Admin: Full access | User: Recommendations only
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Existing Users ({users.length})</h2>
            <div className="max-h-[600px] overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No users created yet</p>
              ) : (
                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.userId} className="bg-slate-700 p-4 rounded border border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-semibold">{user.name || user.userId}</p>
                          <p className="text-gray-400 text-sm">ID: {user.userId}</p>
                        </div>
                        {user.role === 'admin' && (
                          <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">ADMIN</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                          {user.preferredGenre}
                        </span>
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          {languageMap[user.preferredLanguage] || user.preferredLanguage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
