const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const User = require('../models/User');

router.post('/custom/submit', auth, async (req, res) => {
  try {
    const { quizCode, course, answers, score, duration, startedAt, submittedAt, badges } = req.body;
    const userId = req.user.id;
    const formattedAnswers = answers.map(ans => ({
      questionId: null, 
      selectedOption: null, 
      questionText: ans.questionText,
      selectedAnswer: ans.selectedAnswer,
      correctAnswer: ans.correctAnswer,
      isCorrect: ans.isCorrect,
    }));
    const customQuiz = await Quiz.findOne({ code: quizCode });
const user = await User.findById(userId); // fetch user info first

const result = new Result({
  userId,
  userName: user ? `${user.fName} ${user.lName}` : "Unknown",  // store name
  userEmail: user ? user.email : "-",
  userBranch: user ? user.branch : "-",
  quizId: customQuiz ? customQuiz._id : null,
  quizCode,
  course: customQuiz ? customQuiz.title : course, 
  quizTitle: customQuiz ? customQuiz.title : course, 
  answers: formattedAnswers,
  score,
  duration,
  startedAt: startedAt ? new Date(startedAt) : new Date(),
  submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
  badges,
});

    await result.save();
    console.log("✅ Custom quiz result saved for user:", userId, " | Score:", score);
    
    if (user) {
        user.quizAttempts.push({
            quizId: null, 
            score,
            total: formattedAnswers.length,
            submittedAt: new Date()
        });
        await user.save();
    }
    
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('❌ Server error while saving custom quiz result:', err);
    res.status(500).json({ error: 'Server error while saving custom quiz result' });
  }
});

router.post('/:quizId/submit', auth, async (req, res) => {
  const { answers: submittedAnswers=[], duration, startTime, submittedAt } = req.body;
  const quizId = req.params.quizId;
let user = await User.findById(req.user.id); 
  try {
    console.log("📩 Incoming LIVE quiz submission:", { quizId, user: req.user.id });

    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
const evaluatedAnswers = submittedAnswers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);

      if (!question) return null;

const selectedAnswer = (answer.selectedOption !== null && answer.selectedOption !== undefined)
  ? question.options[answer.selectedOption] || null
  : null;
const correctAnswer = question.options[question.correctAnswer] || null;
const isCorrect = answer.selectedOption === question.correctAnswer;

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
    
    // ... (rest of the badge logic, no change) ...
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
  userName: user ? `${user.fName} ${user.lName}` : "Unknown",  // store full name
  userEmail: user ? user.email : "-",                             // store email
  userBranch: user ? user.branch : "-",                           // store branch
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

router.get('/:quizId/analytics', auth, async (req, res) => {
  try {
    const quizIdentifier = req.params.quizId;
    console.log("📈 Fetching analytics for quiz:", quizIdentifier);

    let findFilter;

    if (quizIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        findFilter = { quizId: quizIdentifier };
    } else {
                const quiz = await Quiz.findOne({ code: quizIdentifier }).select('title _id');
        
        const filterConditions = [
            { quizCode: quizIdentifier } // Search by short code (most reliable)
        ];

        if (quiz) {
            filterConditions.push({ quizId: quiz._id });
            filterConditions.push({ quizTitle: quiz.title });
            filterConditions.push({ course: quiz.title });
        } else {
            filterConditions.push({ course: quizIdentifier });
            filterConditions.push({ quizTitle: quizIdentifier });
        }
        
        findFilter = { $or: filterConditions };
    }
    console.log("📈 Analytics Query Filter:", JSON.stringify(findFilter)); 
    
    const results = await Result.find(findFilter);
    
    const totalSubmissions = results.length;
    const averageScore = totalSubmissions ? results.reduce((sum, r) => sum + r.score, 0) / totalSubmissions : 0;
    const averageDuration = totalSubmissions ? results.reduce((sum, r) => sum + r.duration, 0) / totalSubmissions : 0;

    res.json({ totalSubmissions, averageScore, averageDuration });
  } catch (error) {
    console.error('❌ Analytics retrieval error:', error);
    res.status(500).json({ message: 'Server error' });
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
            quizTitle: result.quizId?.title || result.course || "Custom Quiz",
            answers: result.answers
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error('❌ User history fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/custom/leaderboard/:quizCode', auth, async (req, res) => {
  try {
    const { quizCode } = req.params;
    console.log("🔍 Backend searching for custom quiz code:", quizCode);
    const quiz = await Quiz.findOne({ code: quizCode }).select('title');
    const quizTitle = quiz ? quiz.title : "Custom Quiz";

    const filterConditions = [
        { quizCode: quizCode },
        { course: quizCode }
    ];

    if (quiz) {
        filterConditions.push({ quizId: quiz._id });
        filterConditions.push({ quizTitle: quiz.title });
        filterConditions.push({ course: quiz.title });
    }

    const searchFilter = { $or: filterConditions };
        console.log("🔍 Running custom result query with filter:", JSON.stringify(searchFilter)); 
    
    const results = await Result.find(searchFilter)
      .populate('userId', 'fName lName name email branch')
      .sort({ score: -1, submittedAt: 1 });

const formatted = results.map((r, index) => {
  const studentName =
    r.userName || 
    r.studentName || 
    r.userId?.name ||
    `${r.userId?.fName || ''} ${r.userId?.lName || ''}`.trim() ||
    "Unknown";

  return {
    _id: r._id,
    rank: index + 1,
    studentName,
    email: r.userEmail || r.userId?.email || '-',
    branch: r.userBranch || r.userId?.branch || "-",
    score: r.score || 0,
    total: r.answers?.length || 0,
    duration: r.duration || 0,
    answers: r.answers || [],
    startedAt: r.startedAt,
    submittedAt: r.submittedAt,
  };
});

if (quiz && quiz.createdBy) {
  const creatorAlreadyIncluded = formatted.some(r => r.email === quiz.createdBy);
  if (!creatorAlreadyIncluded) {
    formatted.push({
      _id: null,
      rank: formatted.length + 1,
      studentName: "You (Creator)",
      email: quiz.createdBy,
      branch: "-",
      score: 0,
      total: 0,
      answers: [],
      duration: 0,
      startedAt: null,
      submittedAt: null
    });
  }
}

    res.json({
      quizTitle, // ✅ now uses the actual quiz title
      totalSubmissions: formatted.length,
      leaderboard: formatted,
    });
  } catch (error) {
    console.error('❌ Custom leaderboard fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:quizId/leaderboard', auth, async (req, res) => {
  try {
    const quizId = req.params.quizId;

    let results = [];
    let quizTitle = "";

    if (quizId === "custom") {
      const quizCode = req.query.quizCode; 
      results = await Result.find({ quizCode })
        .populate('userId', 'fName lName name email branch')
        .sort({ score: -1, submittedAt: 1 });
      quizTitle = "Custom Quiz";
    } else {
      const quiz = await Quiz.findById(quizId).select("title createdBy");
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });
      results = await Result.find({ quizId })
        .populate('userId', 'fName lName name email branch')
        .sort({ score: -1, submittedAt: 1 });
      quizTitle = quiz.title;
    }

const formatted = results.map((r, index) => {
  const studentName =
    r.userName || // fallback stored in Result
    r.studentName ||
    r.name ||
    r.userId?.name ||
    `${r.userId?.fName || ''} ${r.userId?.lName || ''}`.trim() ||
    "Unknown";

  return {
    _id: r._id,
    rank: index + 1,
    studentName,
    email: r.userEmail || r.userId?.email || '-',
    branch: r.userBranch || r.userId?.branch || "-",
    score: r.score || 0,
    total: r.answers?.length || 0,
    duration: r.duration || 0,
    answers: r.answers || [],
    startedAt: r.startedAt,
    submittedAt: r.submittedAt,
  };
});

    res.json({
      quizTitle,
      totalSubmissions: formatted.length,
      leaderboard: formatted,
    });
  } catch (error) {
    console.error('❌ Leaderboard fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/result/:resultId', auth, async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate({
        path: 'quizId',
        select: 'title description timeLimit'
      });

    if (!result) return res.status(404).json({ message: 'Result not found' });

    res.json(result);
  } catch (error) {
    console.error('❌ Result fetch by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Fetch custom quiz result by resultId
router.get('/custom/result/:resultId', auth, async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId);
    if (!result) return res.status(404).json({ message: 'Custom result not found' });

    res.json({
      answers: result.answers,
      score: result.score,
      duration: result.duration,
      startedAt: result.startedAt,
      submittedAt: result.submittedAt,
      quizTitle: result.quizTitle || result.course || "Custom Quiz"
    });
  } catch (error) {
    console.error('❌ Custom result fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;