// models/Contribution.js

const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: 'YYYY-MM-DD'
    required: true
  },
  minutes: {
    type: Number, // Time spent in minutes
    required: true,
    default: 0
  }
});

// Ensure uniqueness of each user's contribution per date
contributionSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Contribution', contributionSchema);
