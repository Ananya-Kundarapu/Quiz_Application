const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const { nanoid } = require('nanoid');

router.post('/create', auth, async (req, res) => {
  try {
    const { title, description, timeLimit, questions, branches, creatorEmail } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Title and at least one question are required' });
    }

    const { startDate, endDate } = req.body;

const quiz = new Quiz({
  title,
  description,
  timeLimit,
  code: nanoid(6).toUpperCase(),
  createdBy: req.user.id,
  creatorEmail: creatorEmail || req.user.email,
  branches: branches && branches.length ? branches : ['All'],
  isPublished: false, 
  startDate,
  endDate,
});
    await quiz.save();

    const questionPromises = questions.map((q) => {
      const question = new Question({
        quizId: quiz._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        image: q.image || null,
      });
      return question.save();
    });

    await Promise.all(questionPromises);

    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/branch-quizzes/:branch', async (req, res) => {
  try {
    const branch = req.params.branch;
    const quizzes = await Quiz.find({
  branches: { $in: [branch, 'All'] }, 
  isPublished: true,
}).populate('createdBy', 'fName lName profilePic');


    // Manually fetch questions for each quiz
    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const rawQuestions = await Question.find({ quizId: quiz._id });
const questions = rawQuestions.map(({ _id, questionText, options, image }) => ({
  _id,
  questionText,
  options,
  image,
}));

        return {
          ...quiz.toObject(),
          questions,
        };
      })
    );

    res.json(quizzesWithQuestions);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-quizzes', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id })
  .sort({ createdAt: -1 })
  .populate('createdBy', 'fName lName profilePic');

    res.json({ quizzes });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
const quiz = await Quiz.findById(req.params.id)
  .populate('createdBy', 'fName lName profilePic');
if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

const questions = await Question.find({ quizId: quiz._id });

res.json({
  _id: quiz._id,
  title: quiz.title,
  description: quiz.description,
  timeLimit: quiz.timeLimit,
  branches: quiz.branches, 
  creatorEmail: quiz.creatorEmail,
  questions, // send directly
});

  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, timeLimit, questions, branches, creatorEmail } = req.body;
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
if (quiz.createdBy.toString() !== req.user.id && req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this quiz' });
    }

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.timeLimit = timeLimit || quiz.timeLimit;
    quiz.branches = branches && branches.length ? branches : ['All']; 
    quiz.creatorEmail = creatorEmail || quiz.creatorEmail;

    await quiz.save();

    await Question.deleteMany({ quizId: quiz._id });

    const questionPromises = questions.map((q) => {
      const question = new Question({
        quizId: quiz._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        image: q.image || null,
      });
      return question.save();
    });

    await Promise.all(questionPromises);

    res.json({ message: 'Quiz updated successfully', quiz });
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.createdBy.toString() !== req.user.id && req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await Question.deleteMany({ quizId: quiz._id });
    await quiz.deleteOne();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
  .populate('createdBy', 'fName lName profilePic');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy.toString() !== req.user.id && req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to publish this quiz' });
    }
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();
    res.json({ message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'} successfully`, quiz });
  } catch (err) {
    console.error('Error toggling publish status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Add this new route here
router.get('/code/:code', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.code, isPublished: true })
  .populate('createdBy', 'fName lName profilePic');

    if (!quiz) return res.status(404).json({ message: 'Quiz not found or not published' });

    // Check if the user's branch is authorized
    // Check if the user's branch is authorized (Admins can bypass)
const userBranch = req.user.branch;
if (
  req.user.role.toLowerCase() !== 'admin' &&
  !quiz.branches.includes('All') &&
  !quiz.branches.includes(userBranch)
) {
  return res.status(403).json({ message: 'You are not authorized to access this quiz' });
}

    // Check date availability
    const now = new Date();
    if ((quiz.startDate && quiz.startDate > now) || (quiz.endDate && quiz.endDate < now)) {
      return res.status(403).json({ message: 'This quiz is not currently available' });
    }

    // Fetch the quiz questions
    const questions = await Question.find({ quizId: quiz._id });

    res.json({ ...quiz.toObject(), questions });
  } catch (err) {
    console.error('Error fetching quiz by code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;