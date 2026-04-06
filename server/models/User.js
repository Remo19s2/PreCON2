const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false
  },
  preferredGenre: {
    type: String,
    required: true
  },
  preferredLanguage: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, {
  timestamps: true
});

userSchema.index({ userId: 1 });

module.exports = mongoose.model('User', userSchema);
