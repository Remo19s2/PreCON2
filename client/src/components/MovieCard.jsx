import React from 'react';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function MovieCard({ movie, showScores = false }) {
  const posterUrl = movie.posterPath
    ? `${TMDB_IMAGE_BASE}${movie.posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const languageMap = {
    'hi': '🇮🇳 Hindi',
    'ta': '🇮🇳 Tamil',
    'te': '🇮🇳 Telugu',
    'ml': '🇮🇳 Malayalam'
  };

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="relative group">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="text-center p-4">
            <p className="text-white text-sm line-clamp-4">{movie.overview || 'No description available'}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            {languageMap[movie.originalLanguage] || movie.originalLanguage}
          </span>
          {movie.voteAverage && (
            <span className="text-yellow-400 font-semibold">
              ⭐ {movie.voteAverage.toFixed(1)}
            </span>
          )}
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genres.slice(0, 3).map((genre, idx) => (
              <span
                key={idx}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {movie.releaseDate && (
          <p className="text-xs text-gray-500">
            {new Date(movie.releaseDate).getFullYear()}
          </p>
        )}

        {showScores && movie.scores && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Recommendation Score:</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Content:</span>
                <span className="text-green-400 ml-1">{movie.scores.content}</span>
              </div>
              <div>
                <span className="text-gray-500">Collab:</span>
                <span className="text-blue-400 ml-1">{movie.scores.collaborative}</span>
              </div>
              <div>
                <span className="text-gray-500">Hybrid:</span>
                <span className="text-purple-400 ml-1 font-semibold">{movie.scores.hybrid}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
