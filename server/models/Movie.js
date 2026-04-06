const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  originalTitle: String,
  overview: String,
  posterPath: String,
  backdropPath: String,
  releaseDate: String,
  genres: [String],
  originalLanguage: {
    type: String,
    required: true
  },
  voteAverage: Number,
  voteCount: Number,
  popularity: Number
}, {
  timestamps: true
});

movieSchema.index({ tmdbId: 1 });
movieSchema.index({ originalLanguage: 1 });
movieSchema.index({ genres: 1 });

module.exports = mongoose.model('Movie', movieSchema);
