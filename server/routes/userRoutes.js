const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Rating = require('../models/Rating');
const { generateUsers, initializeData } = require('../utils/dataGenerator');
const { isAdmin } = require('../middleware/authMiddleware');
const { invalidateRecommendationCache } = require('../services/recommendationCache');

router.get('/', isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ userId: 1 }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', isAdmin, async (req, res) => {
  try {
    const { userId, preferredGenre, preferredLanguage, name } = req.body;
    
    if (!userId || !preferredGenre || !preferredLanguage) {
      return res.status(400).json({ 
        error: 'userId, preferredGenre, and preferredLanguage are required' 
      });
    }
    
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this userId already exists' });
    }
    
    const newUser = await User.create({
      userId,
      name: name || userId,
      preferredGenre,
      preferredLanguage,
      role: 'user'
    });

    invalidateRecommendationCache();
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        userId: newUser.userId,
        name: newUser.name,
        preferredGenre: newUser.preferredGenre,
        preferredLanguage: newUser.preferredLanguage,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId/ratings', async (req, res) => {
  try {
    const ratings = await Rating.find({ userId: req.params.userId })
      .lean()
      .populate('movieId');
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', isAdmin, async (req, res) => {
  try {
    const { count = 100 } = req.body;
    await generateUsers(count);
    invalidateRecommendationCache();
    res.json({ message: `Generated ${count} users successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/initialize', async (req, res) => {
  try {
    await initializeData();
    invalidateRecommendationCache();
    res.json({ message: 'Data initialization complete' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
