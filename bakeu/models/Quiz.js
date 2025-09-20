const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  timeLimit: { type: Number, required: true },
  branches: [{ type: String, required: true }],
  image: { type: String },
  code: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorEmail: { type: String },
  isPublished: { type: Boolean, default: false },
  startDate: { type: Date },
  endDate: { type: Date }, 
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', quizSchema);