// C:\Newwww\bakeu\index.js - UPDATED FOR VERCEL DEPLOYMENT

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const quizzesRoutes = require('./routes/quizzes');
const userRoutes = require('./routes/userRoutes');
const resultsRoutes = require('./routes/results');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(express.json({ limit: '10mb' }));
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
        return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

connectDB();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/admin/hello', (req, res) => {
  res.send('👋 Hello Admin!');
});
module.exports = app;