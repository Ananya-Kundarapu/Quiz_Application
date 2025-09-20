const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  country: { type: String },
  profilePic: { type: String, default: '/profile.png' },
  role: { type: String, enum: ['user', 'admin', 'Student', 'Admin'], default: 'user' },
  branch: {
    type: String,
    enum: ['CSE', 'CSM', 'CSO', 'IT', 'ECE', 'ME', 'CE', 'EE'],
    required: function() {
      return this.role === 'Student'; 
    }
  },
  createdAt: { type: Date, default: Date.now },
  quizAttempts: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: { type: Number },
    total: { type: Number },
    submittedAt: { type: Date, default: Date.now }
  }],
    badges: [{ type: String }]
});

module.exports = mongoose.model('User', userSchema);