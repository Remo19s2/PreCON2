const axios = require('axios');

// Validate environment variables immediately
if (!process.env.TMDB_API_KEY) {
  console.error('❌ CRITICAL: TMDB_API_KEY is not set in environment variables!');
  console.error('   Please check your .env file at: server/.env');
  console.error('   It should contain: TMDB_API_KEY=your_api_key_here');
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

console.log('🔧 TMDb Service Configuration:');
console.log('   API Key:', TMDB_API_KEY ? `${TMDB_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('   Base URL:', TMDB_BASE_URL);

const indianLanguages = ['hi', 'ta', 'te', 'ml'];

// Configure axios with longer timeout and retry logic
const axiosConfig = {
  timeout: 30000, // 30 seconds
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0'
  }
};

const fetchIndianMovies = async (language, page = 1) => {
  try {
    console.log(`  📡 Fetching ${language} movies, page ${page}...`);
    
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is not configured');
    }

    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_original_language: language,
        sort_by: 'popularity.desc',
        page: page,
        vote_count_gte: 10
      },
      ...axiosConfig
    });

    const movies = response.data.results || [];
    console.log(`  ✅ Fetched ${movies.length} ${language} movies from page ${page}`);
    return movies;

  } catch (error) {
    console.error(`  ❌ Error fetching ${language} movies page ${page}:`, error.message);
    if (error.code === 'ECONNABORTED') {
      console.error('  ⚠️ Request timeout - TMDb not responding');
    } else if (error.response) {
      console.error(`  📝 Status: ${error.response.status}, Data:`, error.response.data);
    }
    return [];
  }
};

const getMovieGenres = async () => {
  try {
    console.log('📚 Fetching genre list from TMDb...');
    
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is not configured');
    }

    const url = `${TMDB_BASE_URL}/genre/movie/list`;
    console.log('   Request URL:', url);
    console.log('   API Key (first 10 chars):', TMDB_API_KEY.substring(0, 10) + '...');

    const response = await axios.get(url, {
      params: {
        api_key: TMDB_API_KEY
      },
      ...axiosConfig
    });

    if (!response.data) {
      throw new Error('No data in response');
    }

    if (!response.data.genres) {
      console.error('❌ Response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('No genres array in response');
    }

    console.log(`✅ Successfully fetched ${response.data.genres.length} genres`);
    return response.data.genres;

  } catch (error) {
    console.error('\n❌ ========== GENRE FETCH ERROR ==========');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.error('⚠️ REQUEST TIMEOUT - TMDb API is not responding');
      console.error('   Possible causes:');
      console.error('   1. Network/Firewall blocking TMDb');
      console.error('   2. Proxy configuration needed');
      console.error('   3. Internet connection issues');
      console.error('   4. TMDb API is temporarily down');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from TMDb');
      console.error('⚠️ This usually means a network/connectivity issue');
    } else {
      // Something happened in setting up the request
      console.error('Request Setup Error:', error.message);
    }
    console.error('========================================\n');
    
    // Return hardcoded genres as fallback
    console.log('⚠️ Using fallback genre list...');
    return [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' }
    ];
  }
};

const fetchAllIndianMovies = async () => {
  console.log('🎬 Starting TMDb movie fetch...');
  
  if (!TMDB_API_KEY) {
    console.error('❌ TMDB_API_KEY is not set in environment variables!');
    throw new Error('TMDb API key is missing');
  }

  const allMovies = [];
  const genres = await getMovieGenres();
  
  if (genres.length === 0) {
    console.error('❌ Failed to fetch genres. Cannot proceed.');
    throw new Error('Failed to fetch genres from TMDb');
  }

  const genreMap = {};
  genres.forEach(g => {
    genreMap[g.id] = g.name;
  });

  for (const lang of indianLanguages) {
    console.log(`\n🌐 Fetching ${lang.toUpperCase()} movies...`);
    let langMovieCount = 0;
    
    for (let page = 1; page <= 5; page++) {
      const movies = await fetchIndianMovies(lang, page);
      
      if (movies.length === 0) {
        console.log(`  ⚠️ No more movies found for ${lang} at page ${page}`);
        break;
      }
      
      const processedMovies = movies.map(movie => ({
        tmdbId: movie.id,
        title: movie.title,
        originalTitle: movie.original_title,
        overview: movie.overview,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        releaseDate: movie.release_date,
        genres: movie.genre_ids.map(id => genreMap[id] || 'Unknown').filter(g => g !== 'Unknown'),
        originalLanguage: movie.original_language,
        voteAverage: movie.vote_average,
        voteCount: movie.vote_count,
        popularity: movie.popularity
      }));
      
      allMovies.push(...processedMovies);
      langMovieCount += processedMovies.length;
      
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    console.log(`  ✅ Total ${lang} movies fetched: ${langMovieCount}`);
  }

  console.log(`\n🎯 Total movies fetched from TMDb: ${allMovies.length}`);
  return allMovies;
};

module.exports = {
  fetchAllIndianMovies,
  getMovieGenres
};
