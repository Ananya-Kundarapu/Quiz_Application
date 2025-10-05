const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
quizId: { type: mongoose.Schema.Types.Mixed, ref: 'Quiz', required: false }, 
    quizCode: { type: String, required: false }, 
  answers: [{
questionId: { type: mongoose.Schema.Types.Mixed, ref: 'Question', required: false }, 
    questionText: { type: String }, 
selectedOption: { type: mongoose.Schema.Types.Mixed }, 
    selectedAnswer: { type: String },
    correctAnswer: { type: String }, 
    isCorrect: { type: Boolean }
  }],
  course: { type: String },
  score: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date, default: Date.now },
  duration: { type: Number, required: true },
  badges: [{ type: String }],
   userName: { type: String },
  userEmail: { type: String },
  userBranch: { type: String },
});

module.exports = mongoose.model('Result', resultSchema);