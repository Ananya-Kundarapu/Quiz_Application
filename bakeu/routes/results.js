const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');

router.post('/:quizId/submit', auth, async (req, res) => {
  const { answers, duration, startTime, submittedAt } = req.body;
  try {
    console.log("📩 Incoming quiz submission:", { quizId: req.params.quizId, user: req.user.id });

    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
const evaluatedAnswers = answers.map(answer => {
  const question = quiz.questions.find(q => q._id.toString() === answer.questionId);

  if (!question) return null;

  const selectedAnswer = (answer.selectedOption !== null && answer.selectedOption >= 0)
  ? question.options[answer.selectedOption]
  : null;
  const correctAnswer = question.options[question.correctAnswer];
  const isCorrect = question.correctAnswer === answer.selectedOption;

  if (isCorrect) score++;

  return {
    questionId: answer.questionId,
    questionText: question.questionText,
    selectedOption: answer.selectedOption,
    selectedAnswer,
    correctAnswer,
    isCorrect,
  };
}).filter(Boolean);
const recentResults = await Result.find({ userId: req.user.id })
  .sort({ submittedAt: -1 })
  .limit(5); 

const totalQuestions = quiz.questions.length;
const percentage = (score / totalQuestions) * 100;

const badges = [];
if (percentage === 100) badges.push('winner');
if (percentage >= 80) badges.push('powerPlayer');
if (duration / totalQuestions < 30) badges.push('speedster');
if (percentage >= 30 && percentage < 50) badges.push('lucky');
const streakCount = recentResults.filter(r => (r.score / r.answers.length) * 100 >= 80).length;
if (percentage >= 80 && streakCount >= 1) badges.push('streakMaster');
const lastTwo = recentResults.slice(0, 2);
if (
  percentage >= 80 &&
  lastTwo.length >= 2 &&
  lastTwo[0].score / lastTwo[0].answers.length < 50 &&
  lastTwo[1].score / lastTwo[1].answers.length < 50
) {
  badges.push('comeback');
}
const lastQuiz = recentResults[0];
if (percentage === 100 && lastQuiz && (lastQuiz.score / lastQuiz.answers.length) * 100 === 100) {
  badges.push('perfectionist');
}
const result = new Result({
  userId: req.user.id,
  quizId: quiz._id,
  answers: evaluatedAnswers,
  score,
  duration,
  badges, 
  startedAt: startTime ? new Date(startTime) : new Date(),
  submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
});

await result.save();
console.log("✅ Result saved for user:", req.user.id, " | Score:", score, " | Badges:", badges);
const user = await User.findById(req.user.id);
user.quizAttempts.push({
  quizId: quiz._id,
  score,
  total: quiz.questions.length,
  submittedAt: new Date()
});
await user.save();
res.json({ message: 'Quiz submitted', result: { score, total: totalQuestions, badges } });
  } catch (error) {
    console.error('❌ Quiz submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Fetch single quiz result (fixed)
router.get('/:quizId/result', auth, async (req, res) => {
  try {
    console.log("📊 Fetching result for:", { quizId: req.params.quizId, user: req.user.id });

const result = await Result.findOne(
  { userId: req.user.id, quizId: req.params.quizId },
  {},
  { sort: { submittedAt: -1 } }
).populate({
  path: 'quizId',
  select: 'title description timeLimit'
});

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('❌ Result retrieval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Quiz analytics
router.get('/:quizId/analytics', auth, async (req, res) => {
  try {
    console.log("📈 Fetching analytics for quiz:", req.params.quizId);

    const results = await Result.find({ quizId: req.params.quizId });
    const totalSubmissions = results.length;
    const averageScore = totalSubmissions ? results.reduce((sum, r) => sum + r.score, 0) / totalSubmissions : 0;
    const averageDuration = totalSubmissions ? results.reduce((sum, r) => sum + r.duration, 0) / totalSubmissions : 0;

    res.json({ totalSubmissions, averageScore, averageDuration });
  } catch (error) {
    console.error('❌ Analytics retrieval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/custom', auth, async (req, res) => {
  try {
    console.log("📩 Incoming custom quiz submission:", { user: req.user.id });

    const { course, answers, score, duration, startedAt, submittedAt } = req.body;

    // Normalize answers so they match schema
    const formattedAnswers = answers.map(a => ({
      questionText: a.questionText || null,
      selectedAnswer: a.selectedAnswer || null,
      correctAnswer: a.correctAnswer || null,
      isCorrect: a.isCorrect ?? false
    }));
const percentage = (score / formattedAnswers.length) * 100;

const recentResults = await Result.find({ userId: req.user.id })
  .sort({ submittedAt: -1 })
  .limit(5);

const badges = [];
if (percentage === 100) badges.push('winner');
if (percentage >= 80) badges.push('powerPlayer');
if (duration / formattedAnswers.length < 30) badges.push('speedster');
if (percentage >= 30 && percentage < 50) badges.push('lucky');

const streakCount = recentResults.filter(r => (r.score / r.answers.length) * 100 >= 80).length;
if (percentage >= 80 && streakCount >= 1) badges.push('streakMaster');

const lastTwo = recentResults.slice(0, 2);
if (
  percentage >= 80 &&
  lastTwo.length >= 2 &&
  lastTwo[0].score / lastTwo[0].answers.length < 50 &&
  lastTwo[1].score / lastTwo[1].answers.length < 50
) {
  badges.push('comeback');
}

const lastQuiz = recentResults[0];
if (percentage === 100 && lastQuiz && (lastQuiz.score / lastQuiz.answers.length) * 100 === 100) {
  badges.push('perfectionist');
}

const result = new Result({
  userId: req.user.id,
  quizId: req.body.quizId || null,
  course,
  answers: formattedAnswers,
  score,
  duration: duration || 0,
  badges, 
  startedAt: startedAt ? new Date(startedAt) : new Date(),
  submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
});


    await result.save();
    console.log("✅ Custom quiz result saved for user:", req.user.id, " | Score:", score);

    res.json({ message: 'Custom quiz saved', result });
  } catch (error) {
    console.error("❌ Custom quiz save error:", error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});
router.get('/user/history', auth, async (req, res) => {
    try {
        const results = await Result.find({ userId: req.user.id })
            .populate('quizId', 'title') 
            .sort({ submittedAt: -1 });
        const formattedResults = results.map(result => ({
            _id: result._id,
            course: result.course,
            score: result.score,
            total: result.answers.length,
            duration: result.duration,
            startedAt: result.startedAt,
            submittedAt: result.submittedAt,
            badges: result.badges,
            quizTitle: result.quizId ? result.quizId.title : result.course,
            answers: result.answers
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error('❌ User history fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;