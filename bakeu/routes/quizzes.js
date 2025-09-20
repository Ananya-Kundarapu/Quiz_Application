const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { nanoid } = require('nanoid');

router.post('/create', auth, async (req, res) => {
  try {
    const { title, description, timeLimit, questions, branches, branch, image, startDate, endDate } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid quiz data' });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    let resolvedBranches = ['All'];
    if (Array.isArray(branches) && branches.length > 0) {
      resolvedBranches = branches;
    } else if (Array.isArray(branch) && branch.length > 0) {
      resolvedBranches = branch;
    } else if (typeof branch === 'string' && branch.trim()) {
      resolvedBranches = [branch.trim()];
    }

    const newQuiz = new Quiz({
      title,
      description,
      timeLimit,
      code: nanoid(6).toUpperCase(),
      createdBy: req.user.id,
      creatorEmail: req.user.email,
      branches: resolvedBranches,
      image: image || '/defaultlive.jpg',
      isPublished: false,
      startDate,
      endDate,
    });

    await newQuiz.save();

    const savedQuestions = await Promise.all(
      questions.map((q) => {
        const newQuestion = new Question({
          quizId: newQuiz._id,
          questionText: q.questionText,
options: Array.isArray(q.options) && q.options.length > 0
  ? q.options
  : [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
          correctAnswer: q.correctAnswer,
          image: q.image || null,
        });
        return newQuestion.save();
      })
    );

    newQuiz.questions = savedQuestions.map((q) => q._id);
    await newQuiz.save();

    const fullQuiz = await Quiz.findById(newQuiz._id).populate('questions');

    res.status(201).json({ message: 'Quiz created successfully', quiz: fullQuiz });
  } catch (err) {
    console.error('❌ Error creating quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/live', auth, async (req, res) => {
  try {
    const studentBranch = req.user.branch;
    if (!studentBranch) {
      return res.status(400).json({ message: 'Student branch not specified' });
    }

    const now = new Date();

    const quizzes = await Quiz.find({
  isPublished: true,
  branches: { $in: [studentBranch, 'All'] },
  $or: [
    { startDate: { $exists: false }, endDate: { $exists: false } },
    { startDate: { $lte: now }, endDate: { $gte: now } },
    { startDate: { $lte: now }, endDate: { $exists: false } },
  ],
})
  .populate('questions')  // 👈 add this line
  .sort({ createdAt: -1 });


    const formatted = quizzes.map((quiz) => ({
      _id: quiz._id,
      code: quiz.code,
      name: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      image: quiz.image || '/defaultlive.jpg',
      questions: quiz.questions,
      startDate: quiz.startDate, // Added to include start date
      endDate: quiz.endDate,     // Added to include end date
    }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Error fetching live quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-quizzes', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    console.error('❌ Error fetching user quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ✅ NEW: Get quiz by code for students (includes populated questions)
router.get('/code/:code', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.code, isPublished: true })
      .populate('questions');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or not published' });
    }

    // Optional: Check if the student's branch matches
    const studentBranch = req.user.branch;
    if (!quiz.branches.includes('All') && !quiz.branches.includes(studentBranch)) {
      return res.status(403).json({ message: 'You are not allowed to access this quiz' });
    }

    // Optional: Enforce date check
    const now = new Date();
    if (
      (quiz.startDate && quiz.startDate > now) ||
      (quiz.endDate && quiz.endDate < now)
    ) {
      return res.status(403).json({ message: 'This quiz is not currently available' });
    }

    res.json({ quiz });
  } catch (err) {
    console.error('❌ Error fetching quiz by code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:quizId', auth, async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId).populate('questions').exec();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // ✅ Allow admins or creators full access (edit mode)
    if (req.user.role === 'admin' || quiz.createdBy.toString() === req.user.id) {
      return res.json(quiz);
    }

    // 🚫 Student restrictions
    if (!quiz.isPublished) {
      return res.status(403).json({ message: 'Quiz is not published' });
    }

    const studentBranch = req.user.branch;
    if (!quiz.branches.includes('All') && !quiz.branches.includes(studentBranch)) {
      return res.status(403).json({ message: 'You are not allowed to access this quiz' });
    }

    const now = new Date();
    if ((quiz.startDate && quiz.startDate > now) || (quiz.endDate && quiz.endDate < now)) {
      return res.status(403).json({ message: 'This quiz is not currently available' });
    }

    res.json(quiz);
  } catch (err) {
    console.error('❌ Error fetching quiz details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update quiz
// Update quiz
router.put('/:id', auth, async (req, res) => {
  try {
    const quizId = req.params.id;
    const {
      title,
      description,
      timeLimit,
      branches,
      image,
      startDate,
      endDate,
      questions,
    } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid quiz data' });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    // 🔑 Admins can edit any quiz, normal users only their own
    let quiz;
    if (req.user.role === 'admin') {
      quiz = await Quiz.findById(quizId);
    } else {
      quiz = await Quiz.findOne({ _id: quizId, createdBy: req.user.id });
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or access denied' });
    }

    quiz.title = title;
    quiz.description = description;
    quiz.timeLimit = timeLimit;
    quiz.branches = branches && branches.length ? branches : ['All'];
    quiz.image = image || '/defaultlive.jpg';
    quiz.startDate = startDate;
    quiz.endDate = endDate;

    // Delete existing questions
    await Question.deleteMany({ quizId });

    // Save new questions
    const savedQuestions = await Promise.all(
      questions.map((q) => {
        const options = Array.isArray(q.options) && q.options.length > 0
          ? q.options
          : [q.option1, q.option2, q.option3, q.option4].filter(Boolean);

        return new Question({
          quizId,
          questionText: q.questionText,
          options,
          correctAnswer: q.correctAnswer,
          image: q.image || null,
        }).save();
      })
    );

    quiz.questions = savedQuestions.map(q => q._id);
    await quiz.save();

    const fullQuiz = await Quiz.findById(quizId).populate('questions');
    res.json({ message: 'Quiz updated successfully', quiz: fullQuiz });

  } catch (err) {
    console.error('❌ Error updating quiz:', err);
    res.status(500).json({ message: 'Server error while updating quiz' });
  }
});

router.patch('/:id/toggle-publish', auth, async (req, res) => {
  try {
    const quizId = req.params.id;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ message: 'isPublished must be a boolean' });
    }

    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, createdBy: req.user.id },
      { isPublished },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or access denied' });
    }

    res.json({
      message: `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`,
      isPublished,
    });
  } catch (err) {
    console.error('❌ Error toggling quiz publish status:', err);
    res.status(500).json({ message: 'Server error while updating publish status' });
  }
});

module.exports = router;
