const Movie = require('../models/Movie');
const User = require('../models/User');
const Rating = require('../models/Rating');

const getContentBasedScore = (movie, user) => {
  let score = 0;

  if (movie.genres.includes(user.preferredGenre)) {
    score += 0.6;
  }

  if (movie.originalLanguage === user.preferredLanguage) {
    score += 0.4;
  }

  return score;
};

const calculateCosineSimilarity = (userRatings, otherUserRatings) => {
  const commonMovies = userRatings.filter(ur =>
    otherUserRatings.some(our => our.movieId.toString() === ur.movieId.toString())
  );

  if (commonMovies.length === 0) return 0;

  let dotProduct = 0;
  let userMagnitude = 0;
  let otherMagnitude = 0;

  commonMovies.forEach(rating => {
    const otherRating = otherUserRatings.find(
      our => our.movieId.toString() === rating.movieId.toString()
    );
    if (otherRating) {
      dotProduct += rating.rating * otherRating.rating;
      userMagnitude += rating.rating ** 2;
      otherMagnitude += otherRating.rating ** 2;
    }
  });

  if (userMagnitude === 0 || otherMagnitude === 0) return 0;

  return dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(otherMagnitude));
};

const getCollaborativeScore = async (movie, user, userRatings) => {
  const allRatings = await Rating.find({ movieId: movie._id });

  if (allRatings.length === 0) return 0;

  const otherUsers = await User.find({
    userId: { $ne: user.userId }
  });

  let weightedSum = 0;
  let similaritySum = 0;

  for (const otherUser of otherUsers) {
    const otherUserRatings = await Rating.find({ userId: otherUser.userId });
    const similarity = calculateCosineSimilarity(userRatings, otherUserRatings);

    if (similarity > 0) {
      const otherUserRating = allRatings.find(
        r => r.userId === otherUser.userId
      );
      if (otherUserRating) {
        weightedSum += similarity * otherUserRating.rating;
        similaritySum += similarity;
      }
    }
  }

  if (similaritySum === 0) return 0;

  return (weightedSum / similaritySum) / 5;
};

const getHybridRecommendations = async (userId, limit = 10) => {
  const user = await User.findOne({ userId });
  if (!user) {
    throw new Error('User not found');
  }

  const userRatings = await Rating.find({ userId: user.userId });
  const ratedMovieIds = userRatings.map(r => r.movieId.toString());

  const allMovies = await Movie.find({
    _id: { $nin: ratedMovieIds }
  });

  const scoredMovies = await Promise.all(
    allMovies.map(async (movie) => {
      const contentScore = getContentBasedScore(movie, user);
      const collaborativeScore = await getCollaborativeScore(movie, user, userRatings);

      const hybridScore = (0.6 * contentScore) + (0.4 * collaborativeScore);

      return {
        movie: movie.toObject(),
        contentScore,
        collaborativeScore,
        hybridScore
      };
    })
  );

  scoredMovies.sort((a, b) => b.hybridScore - a.hybridScore);

  return scoredMovies.slice(0, limit);
};

module.exports = {
  getHybridRecommendations
};
