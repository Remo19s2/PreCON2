import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recommendationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';

function Recommendations() {
  const { userId: paramUserId } = useParams();
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = paramUserId || currentUser?.userId;

  useEffect(() => {
    if (isAdmin()) {
      navigate('/admin');
      return;
    }

    if (userId) {
      loadData();
    }
  }, [userId, isAdmin, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading recommendations for:', userId);
      const recData = await recommendationService.getRecommendations(userId, 12);
      
      console.log('📊 Received data:', recData);
      
      if (recData.needsData) {
        setError('No movie data available yet. Please ask the admin to generate data using the "Generate Data" button.');
        setRecommendations([]);
      } else {
        setRecommendations(recData.recommendations);
        console.log(`✅ Loaded ${recData.recommendations.length} recommendations`);
      }
    } catch (err) {
      console.error('❌ Error loading recommendations:', err);
      if (err.response?.status === 404) {
        setError('User not found. Please contact admin.');
      } else {
        setError(err.response?.data?.message || 'Failed to load recommendations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const languageMap = {
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'ml': 'Malayalam'
  };

  if (isAdmin()) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {currentUser && (
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Recommendations for {currentUser.name || currentUser.userId}
              </h1>
              <div className="flex gap-3">
                <span className="text-sm bg-purple-600 text-white px-3 py-1 rounded">
                  Prefers: {currentUser.preferredGenre}
                </span>
                <span className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                  Language: {languageMap[currentUser.preferredLanguage] || currentUser.preferredLanguage}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-white text-xl py-20">
          Generating personalized recommendations...
        </div>
      ) : error ? (
        <div className="bg-slate-800 rounded-lg p-12 text-center border border-red-600">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Recommendations</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Recommendations Yet</h2>
          <p className="text-gray-400 mb-6">
            We don't have enough data to generate personalized recommendations yet.
            <br />
            Please ask the administrator to generate movie data.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              🎯 Top Picks for You
            </h2>
            <p className="text-gray-400">
              Based on your preferences and similar users' ratings
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((movie, idx) => (
              <div key={movie._id} className="relative">
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-black z-10">
                  {idx + 1}
                </div>
                <MovieCard movie={movie} showScores={true} />
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              How we recommend
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-green-400 font-semibold mb-2">Content-Based (60%)</div>
                <p className="text-gray-400">
                  Matches your genre and language preferences
                </p>
              </div>
              <div>
                <div className="text-blue-400 font-semibold mb-2">Collaborative (40%)</div>
                <p className="text-gray-400">
                  Based on ratings from similar users
                </p>
              </div>
              <div>
                <div className="text-purple-400 font-semibold mb-2">Hybrid Score</div>
                <p className="text-gray-400">
                  Combined score for best recommendations
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Recommendations;
