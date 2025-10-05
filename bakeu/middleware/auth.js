const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ✅ make sure you have this model

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ No token or malformed token header:', authHeader);
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔐 Received Token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id && !decoded._id) {
      console.error('❌ Token missing user ID:', decoded);
      return res.status(401).json({ message: 'Invalid token: no user id' });
    }

    // ✅ Always fetch user from DB so branch/role/email are guaranteed
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: (user.role || 'student').toLowerCase(),
      branch: user.branch ? String(user.branch).toUpperCase() : 'ALL',
    };

    console.log('✅ req.user set from DB:', req.user);
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
