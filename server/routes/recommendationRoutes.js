const express = require('express');
const router = express.Router();
const { getHybridRecommendations } = require('../services/recommendationService');

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;

    console.log(`🎯 Fetching recommendations for userId: ${userId}`);

    const recommendations = await getHybridRecommendations(userId, limit);

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
    if (error.code === 'NO_RECOMMENDATION_DATA') {
      return res.json({
        userId: req.params.userId,
        recommendations: [],
        message: 'No data available. Please ask admin to generate data.',
        needsData: true
      });
    }

    if (error.message === 'User not found') {
      console.log(`❌ User not found: ${req.params.userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.error('❌ Error in recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
