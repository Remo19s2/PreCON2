const {
  getCachedRecommendationResult,
  getRecommendationIndex,
  makeCacheKey,
  normalizeKey,
  setCachedRecommendationResult
} = require('./recommendationCache');

const getContentBasedScore = (movie, user) => {
  let score = 0;

  const preferredGenre = normalizeKey(user.preferredGenre);
  const preferredLanguage = normalizeKey(user.preferredLanguage);

  if ((movie.genres || []).some(genre => normalizeKey(genre) === preferredGenre)) {
    score += 0.6;
  }

  if (normalizeKey(movie.originalLanguage) === preferredLanguage) {
    score += 0.4;
  }

  return score;
};

const calculateCosineSimilarity = (userRatingsMap, otherUserRatingsMap) => {
  let dotProduct = 0;
  let userMagnitude = 0;
  let otherMagnitude = 0;

  for (const [movieId, rating] of userRatingsMap.entries()) {
    const otherRating = otherUserRatingsMap.get(movieId);
    if (otherRating) {
      dotProduct += rating * otherRating;
      userMagnitude += rating ** 2;
      otherMagnitude += otherRating ** 2;
    }
  }

  if (userMagnitude === 0 || otherMagnitude === 0) return 0;

  return dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(otherMagnitude));
};

const getCollaborativeScore = (movieId, similarityMap, ratingsByMovieMap) => {
  const movieRatings = ratingsByMovieMap.get(movieId) || [];

  if (movieRatings.length === 0) {
    return 0;
  }

  let weightedSum = 0;
  let similaritySum = 0;

  for (const rating of movieRatings) {
    const similarity = similarityMap.get(rating.userId);
    if (!similarity) {
      continue;
    }

    weightedSum += similarity * rating.rating;
    similaritySum += similarity;
  }

  if (similaritySum === 0) return 0;

  return (weightedSum / similaritySum) / 5;
};

const getHybridRecommendations = async (userId, limit = 10) => {
  const index = await getRecommendationIndex();
  const user = index.userMap.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const safeLimit = Number.isFinite(limit) ? Math.max(1, limit) : 10;
  const cacheKey = makeCacheKey([
    index.builtAt,
    user.userId,
    normalizeKey(user.preferredGenre),
    normalizeKey(user.preferredLanguage),
    safeLimit
  ]);

  const cachedResult = getCachedRecommendationResult(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const userRatingsMap = index.userRatingLookupMap.get(user.userId) || new Map();
  const similarityMap = new Map();

  for (const [otherUserId, otherUserRatingsMap] of index.userRatingLookupMap.entries()) {
    if (otherUserId === user.userId) {
      continue;
    }

    const similarity = calculateCosineSimilarity(userRatingsMap, otherUserRatingsMap);
    if (similarity > 0) {
      similarityMap.set(otherUserId, similarity);
    }
  }

  const candidateMovies = new Map();
  const preferredLanguage = normalizeKey(user.preferredLanguage);
  const preferredGenre = normalizeKey(user.preferredGenre);

  const addCandidates = (movies = []) => {
    for (const movie of movies) {
      candidateMovies.set(movie._id.toString(), movie);
    }
  };

  addCandidates(index.languageMap.get(preferredLanguage));
  addCandidates(index.genreMap.get(preferredGenre));

  if (candidateMovies.size === 0) {
    for (const movie of index.allMoviesByPopularity) {
      candidateMovies.set(movie._id.toString(), movie);
    }
  }

  const scoredMovies = [];

  for (const [movieId, movie] of candidateMovies.entries()) {
    if (userRatingsMap.has(movieId)) {
      continue;
    }

    const contentScore = getContentBasedScore(movie, user);
    const collaborativeScore = getCollaborativeScore(movieId, similarityMap, index.ratingsByMovieMap);
    const hybridScore = (0.6 * contentScore) + (0.4 * collaborativeScore);

    scoredMovies.push({
      movie,
      contentScore,
      collaborativeScore,
      hybridScore
    });
  }

  scoredMovies.sort((a, b) => b.hybridScore - a.hybridScore);

  const topRecommendations = scoredMovies.slice(0, safeLimit);
  setCachedRecommendationResult(cacheKey, topRecommendations);

  return topRecommendations;
};

module.exports = {
  getHybridRecommendations
};
