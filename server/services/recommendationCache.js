const Movie = require('../models/Movie');
const User = require('../models/User');
const Rating = require('../models/Rating');

const DATASET_CACHE_TTL_MS = 5 * 60 * 1000;
const RESULT_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_RESULT_CACHE_SIZE = 200;

let datasetCache = null;
const recommendationResultCache = new Map();

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

const makeCacheKey = (parts) => parts.join('|');

const isCacheEntryValid = (entry, ttlMs) => Boolean(entry) && (Date.now() - entry.createdAt) < ttlMs;

const pruneResultCache = () => {
  while (recommendationResultCache.size > MAX_RESULT_CACHE_SIZE) {
    const firstKey = recommendationResultCache.keys().next().value;
    recommendationResultCache.delete(firstKey);
  }
};

const buildDatasetIndex = async () => {
  const [movies, users, ratings] = await Promise.all([
    Movie.find({})
      .select('tmdbId title originalTitle overview posterPath backdropPath releaseDate genres originalLanguage voteAverage voteCount popularity')
      .lean(),
    User.find({})
      .select('userId name preferredGenre preferredLanguage role')
      .lean(),
    Rating.find({})
      .select('userId movieId rating')
      .lean()
  ]);

  if (movies.length === 0 || users.length === 0 || ratings.length === 0) {
    const error = new Error('No recommendation data available');
    error.code = 'NO_RECOMMENDATION_DATA';
    throw error;
  }

  const movieMap = new Map();
  const movieByIdMap = new Map();
  const languageMap = new Map();
  const genreMap = new Map();
  const userMap = new Map();
  const ratingsByUserMap = new Map();
  const ratingsByMovieMap = new Map();
  const userRatingLookupMap = new Map();
  const allMoviesByPopularity = [...movies].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  for (const movie of movies) {
    const movieId = movie._id.toString();
    movieByIdMap.set(movieId, movie);

    const normalizedTitle = normalizeKey(movie.title);
    if (normalizedTitle && !movieMap.has(normalizedTitle)) {
      movieMap.set(normalizedTitle, movie);
    }

    const languageKey = normalizeKey(movie.originalLanguage);
    if (languageKey) {
      if (!languageMap.has(languageKey)) {
        languageMap.set(languageKey, []);
      }
      languageMap.get(languageKey).push(movie);
    }

    for (const genre of movie.genres || []) {
      const genreKey = normalizeKey(genre);
      if (!genreKey) {
        continue;
      }

      if (!genreMap.has(genreKey)) {
        genreMap.set(genreKey, []);
      }
      genreMap.get(genreKey).push(movie);
    }
  }

  for (const user of users) {
    userMap.set(user.userId, user);
  }

  for (const rating of ratings) {
    const userId = rating.userId;
    const movieId = rating.movieId.toString();

    if (!ratingsByUserMap.has(userId)) {
      ratingsByUserMap.set(userId, []);
      userRatingLookupMap.set(userId, new Map());
    }

    if (!ratingsByMovieMap.has(movieId)) {
      ratingsByMovieMap.set(movieId, []);
    }

    const ratingEntry = {
      userId,
      movieId,
      rating: rating.rating
    };

    ratingsByUserMap.get(userId).push(ratingEntry);
    ratingsByMovieMap.get(movieId).push(ratingEntry);
    userRatingLookupMap.get(userId).set(movieId, rating.rating);
  }

  return {
    builtAt: Date.now(),
    movieMap,
    movieByIdMap,
    languageMap,
    genreMap,
    userMap,
    ratingsByUserMap,
    ratingsByMovieMap,
    userRatingLookupMap,
    allMoviesByPopularity,
    counts: {
      movies: movies.length,
      users: users.length,
      ratings: ratings.length
    }
  };
};

const getRecommendationIndex = async () => {
  if (datasetCache && isCacheEntryValid(datasetCache, DATASET_CACHE_TTL_MS)) {
    return datasetCache.data;
  }

  const data = await buildDatasetIndex();
  datasetCache = {
    data,
    createdAt: Date.now()
  };
  recommendationResultCache.clear();

  return data;
};

const getCachedRecommendationResult = (cacheKey) => {
  const entry = recommendationResultCache.get(cacheKey);
  if (!isCacheEntryValid(entry, RESULT_CACHE_TTL_MS)) {
    recommendationResultCache.delete(cacheKey);
    return null;
  }

  return entry.value;
};

const setCachedRecommendationResult = (cacheKey, value) => {
  recommendationResultCache.set(cacheKey, {
    createdAt: Date.now(),
    value
  });

  pruneResultCache();
};

const invalidateRecommendationCache = () => {
  datasetCache = null;
  recommendationResultCache.clear();
};

module.exports = {
  getRecommendationIndex,
  getCachedRecommendationResult,
  invalidateRecommendationCache,
  makeCacheKey,
  normalizeKey,
  setCachedRecommendationResult
};