const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { fetchAllIndianMovies } = require('../services/tmdbService');

router.get('/', async (req, res) => {
  try {
    const { language, genre, page = 1, limit = 20 } = req.query;

    const query = {};
    if (language) {
      query.originalLanguage = language;
    }
    if (genre) {
      query.genres = genre;
    }

    const skip = (page - 1) * limit;

    const movies = await Movie.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ popularity: -1 });

    const total = await Movie.countDocuments(query);

    res.json({
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/languages', async (req, res) => {
  try {
    const languages = await Movie.distinct('originalLanguage');
    const languageMap = {
      'hi': 'Hindi',
      'ta': 'Tamil',
      'te': 'Telugu',
      'ml': 'Malayalam'
    };

    const formattedLanguages = languages.map(lang => ({
      code: lang,
      name: languageMap[lang] || lang
    }));

    res.json(formattedLanguages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/genres', async (req, res) => {
  try {
    const allMovies = await Movie.find();
    const genresSet = new Set();

    allMovies.forEach(movie => {
      movie.genres.forEach(genre => genresSet.add(genre));
    });

    const genres = Array.from(genresSet).sort();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/fetch', async (req, res) => {
  try {
    const movies = await fetchAllIndianMovies();

    const insertedMovies = [];
    for (const movie of movies) {
      try {
        const newMovie = await Movie.create(movie);
        insertedMovies.push(newMovie);
      } catch (err) {
        if (err.code === 11000) {
          continue;
        }
        throw err;
      }
    }

    res.json({
      message: 'Movies fetched successfully',
      count: insertedMovies.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
