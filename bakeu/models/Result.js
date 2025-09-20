const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: false }, // optional
  answers: [{
 questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: false },
    questionText: { type: String }, // useful if question is deleted later
    selectedOption: { type: Number },
    selectedAnswer: { type: String },
    correctAnswer: { type: String }, 
    isCorrect: { type: Boolean }
  }],
  course: { type: String },
  score: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date, default: Date.now },
  duration: { type: Number, required: true },
  badges: [{ type: String }]
});

module.exports = mongoose.model('Result', resultSchema);