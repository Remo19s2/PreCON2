const express = require('express');
const router = express.Router();
const { getHybridRecommendations } = require('../services/recommendationService');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    console.log(`🎯 Fetching recommendations for userId: ${userId}`);

    const User = require('../models/User');
    const Movie = require('../models/Movie');
    const Rating = require('../models/Rating');

    const user = await User.findOne({ userId });
    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const movieCount = await Movie.countDocuments();
    const ratingCount = await Rating.countDocuments();

    console.log(`📊 Database stats: ${movieCount} movies, ${ratingCount} ratings`);

    if (movieCount === 0 || ratingCount === 0) {
      return res.json({
        userId,
        recommendations: [],
        message: 'No data available. Please ask admin to generate data.',
        needsData: true
      });
    }

    const recommendations = await getHybridRecommendations(userId, parseInt(limit));

    console.log(`✅ Generated ${recommendations.length} recommendations for ${userId}`);

    res.json({
      userId,
      recommendations: recommendations.map(r => ({
        ...r.movie,
        scores: {
          content: r.contentScore.toFixed(3),
          collaborative: r.collaborativeScore.toFixed(3),
          hybrid: r.hybridScore.toFixed(3)
        }
      })),
      needsData: false
    });
  } catch (error) {
    console.error('❌ Error in recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
