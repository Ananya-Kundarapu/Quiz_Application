const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('../config/db');
const authRoutes = require('../routes/authRoutes');
const quizzesRoutes = require('../routes/quizzes');
const userRoutes = require('../routes/userRoutes');
const resultsRoutes = require('../routes/results');
const adminRoutes = require('../routes/adminRoutes');

const app = express();
app.use(express.json({ limit: '10mb' }));
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174', 
  process.env.FRONTEND_URL
].filter(Boolean); 

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
        if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
    }
    callback(new Error(`CORS policy blocks ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

connectDB();

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/admin/hello', (req, res) => {
  res.send('👋 Hello Admin!');
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;