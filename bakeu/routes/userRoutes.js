const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    fs.mkdir(dir, { recursive: true }).then(() => {
      cb(null, dir);
    }).catch(err => {
      console.error('Error creating uploads directory:', err);
      cb(err);
    });
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: File upload only supports the following filetypes - ' + filetypes);
  },
});

router.get('/', async (req, res) => {
  const { role } = req.query;

  if (!role || !['Student', 'Admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const users = await User.find({ role });

    if (!users.length) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(users);
  } catch (err) {
    console.error('Error fetching users by role:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ✅ Delete user by ID (protected & self-delete prevented)
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 🚫 Prevent self-deletion
    if (req.user.id === id) {
      return res.status(403).json({ message: 'You cannot delete yourself.' });
    }

    console.log('🔴 Deleting user with ID:', id);
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;