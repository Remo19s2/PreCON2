import React, { useState, useEffect } from 'react';
import { movieService } from '../services/api';
import MovieCard from '../components/MovieCard';

function Home() {
  const [movies, setMovies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLanguagesAndGenres();
  }, []);

  useEffect(() => {
    loadMovies();
  }, [selectedLanguage, selectedGenre, page]);

  const loadLanguagesAndGenres = async () => {
    try {
      const [langs, gens] = await Promise.all([
        movieService.getLanguages(),
        movieService.getGenres()
      ]);
      setLanguages(langs);
      setGenres(gens);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadMovies = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20
      };
      if (selectedLanguage) params.language = selectedLanguage;
      if (selectedGenre) params.genre = selectedGenre;

      const data = await movieService.getMovies(params);
      setMovies(data.movies);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    setPage(1);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Explore Movies on PreCON
      </h1>

      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <div>
          <label className="text-gray-300 mr-2">Language:</label>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-slate-800 text-white px-4 py-2 rounded border border-slate-700"
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-gray-300 mr-2">Genre:</label>
          <select
            value={selectedGenre}
            onChange={handleGenreChange}
            className="bg-slate-800 text-white px-4 py-2 rounded border border-slate-700"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white text-xl py-20">
          Loading movies...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map(movie => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {movies.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              No movies found
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
