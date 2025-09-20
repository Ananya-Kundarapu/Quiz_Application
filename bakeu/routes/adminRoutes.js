const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');

console.log('✅ adminRoutes.js is loaded');
router.get('/total-users', async (req, res) => {
  console.log('📩 /api/admin/total-users route was called');

  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Error fetching total users:', err);
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});
router.get('/total-quizzes', auth, async (req, res) => {
  try {
    const adminEmail = req.user.email; // ✅ Decoded from token

const count = await Quiz.countDocuments({ creatorEmail: adminEmail });
    res.json({ count });
  } catch (err) {
    console.error('Error fetching total quizzes:', err);
    res.status(500).json({ error: 'Failed to fetch quiz count' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {};
    if (role && ['Admin', 'Student'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter, 'fName lName email role');

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(), 
      name: `${user.fName || ''} ${user.lName || ''}`.trim() || 'Unnamed',
      email: user.email,
      role: user.role,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error('Error fetching user list:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
