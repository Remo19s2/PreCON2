const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
const { initializeData } = require('../utils/dataGenerator');
const User = require('../models/User');

router.post('/generate-data', isAdmin, async (req, res) => {
  try {
    console.log('🚀 Admin triggered data generation...');
    console.log('📝 Request from userId:', req.headers.userid);
    
    const result = await initializeData();
    
    const Movie = require('../models/Movie');
    const Rating = require('../models/Rating');
    const movieCount = await Movie.countDocuments();
    const ratingCount = await Rating.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log(`✅ Data generation complete:`);
    console.log(`   - Movies: ${movieCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Ratings: ${ratingCount}`);
    
    res.json({
      success: true,
      message: 'Data generation complete. Movies, users, and ratings have been created.',
      stats: {
        movies: movieCount,
        users: userCount,
        ratings: ratingCount
      }
    });
  } catch (error) {
    console.error('❌ Error generating data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/create-user', isAdmin, async (req, res) => {
  try {
    const { userId, name, preferredGenre, preferredLanguage, role } = req.body;

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
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
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

router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ userId: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
