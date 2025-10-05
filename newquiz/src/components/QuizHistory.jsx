import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles/QuizHistory.css';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';
ChartJS.register(ArcElement, Tooltip, Legend);

function QuizHistory() {
  const [history, setHistory] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const reviewQuiz = location.state?.reviewQuiz;
  const answers = location.state?.answers;
  const course = location.state?.course;
const { token } = useAuth();

useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/results/user/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.map(entry => ({
  ...entry,
  badges: entry.badges || [] 
})));

    } catch (err) {
      console.error("❌ Failed to fetch quiz history:", err);
      setHistory([]);
    }
  };

  fetchHistory();
  window.scrollTo(0, 0);
}, [token]);

  const questions = {
    Physics: [
      { question: 'Speed of a boat in standing water is 9 kmph and the speed of the stream is 1.5 kmph...', options: ['16 hours', '18 hours', '20 hours', '24 hours'], correctAnswer: '24 hours' },
      { question: 'What is the acceleration due to gravity on Earth?', options: ['9.8 m/s²', '8.9 m/s²', '10.2 m/s²', '7.5 m/s²'], correctAnswer: '9.8 m/s²' },
      { question: 'What is the unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'Newton' },
      { question: 'Which law states that every action has an equal and opposite reaction?', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correctAnswer: 'Third Law' },
      { question: 'What is the speed of light in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correctAnswer: '300,000 km/s' },
    ],
    Chemistry: [
      { question: 'What is the chemical symbol for Gold?', options: ['Au', 'Ag', 'Fe', 'Cu'], correctAnswer: 'Au' },
      { question: 'What gas is the second most abundant element in the universe?', options: ['Hydrogen', 'Helium', 'Oxygen', 'Nitrogen'], correctAnswer: 'Helium' },
      { question: 'What is the pH of pure water?', options: ['5', '6', '7', '8'], correctAnswer: '7' },
      { question: 'Which element is a noble gas?', options: ['Oxygen', 'Neon', 'Chlorine', 'Sulfur'], correctAnswer: 'Neon' },
      { question: 'What type of bond involves the sharing of electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correctAnswer: 'Covalent' },
    ],
    Mathematics: [
      { question: 'What is the value of π (pi) to two decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correctAnswer: '3.14' },
      { question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correctAnswer: '12' },
      { question: 'What is 5! (factorial of 5)?', options: ['100', '110', '120', '130'], correctAnswer: '120' },
      { question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctAnswer: '180°' },
      { question: 'What is the value of 2³ + 3²?', options: ['15', '16', '17', '18'], correctAnswer: '17' },
    ],
    Biology: [
      { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'], correctAnswer: 'Mitochondria' },
      { question: 'What gas do plants release during photosynthesis?', options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], correctAnswer: 'Oxygen' },
      { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Tissue'], correctAnswer: 'Cell' },
      { question: 'Which blood cells fight infections?', options: ['Red Blood Cells', 'White Blood Cells', 'Platelets', 'Plasma'], correctAnswer: 'White Blood Cells' },
      { question: 'What is the process by which plants make their food?', options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'], correctAnswer: 'Photosynthesis' },
    ],
    Social: [
      { question: 'Who was the first Prime Minister of India?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Indira Gandhi'], correctAnswer: 'Jawaharlal Nehru' },
      { question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris' },
      { question: 'Which river is known as the lifeline of Egypt?', options: ['Nile', 'Amazon', 'Ganges', 'Yangtze'], correctAnswer: 'Nile' },
      { question: 'In which year did World War II end?', options: ['1942', '1943', '1944', '1945'], correctAnswer: '1945' },
      { question: 'What is the largest continent by area?', options: ['Africa', 'Asia', 'Australia', 'Europe'], correctAnswer: 'Asia' },
    ],
    English: [
      { question: 'What is the synonym of "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correctAnswer: 'Joyful' },
      { question: 'Which word is a noun?', options: ['Run', 'Quickly', 'Dog', 'Beautiful'], correctAnswer: 'Dog' },
      { question: 'What is the past tense of "go"?', options: ['Goes', 'Going', 'Went', 'Gone'], correctAnswer: 'Went' },
      { question: 'Which sentence is correct?', options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'], correctAnswer: 'She goes to school.' },
      { question: 'What is the antonym of "big"?', options: ['Large', 'Huge', 'Small', 'Giant'], correctAnswer: 'Small' },
    ],
  };
const badgeData = [
  { id: 'winner', title: 'Winner', src: '/winner.png', desc: 'Scored 100% in a quiz' },
  { id: 'powerPlayer', title: 'Power Player', src: '/powerPlayer.png', desc: 'Scored ≥80%' },
  { id: 'streakMaster', title: 'Streak Master', src: '/streakMaster.jpg', desc: 'Scored ≥70% in 3 quizzes in a row' },
  { id: 'comeback', title: 'Comeback', src: '/comeback.png', desc: 'Scored <40% then >70% in next quiz' },
  { id: 'perfectionist', title: 'Perfectionist', src: '/perfectionist.png', desc: 'Completed all quizzes' },
  { id: 'speedster', title: 'Speedster', src: '/speedster.jpg', desc: 'Completed quiz in <30s per question' },
  { id: 'lucky', title: 'Lucky', src: '/lucky.png', desc: 'Scored >60% in less than 50% of time limit' },
];

const formatDuration = (input) => {
  let seconds = Number(input);
  if (isNaN(seconds) || seconds === 0) return "00:00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
};

const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).replace(',', ' |');
};

const courseAttempts = history.filter(entry => entry.course === course);

const quizEntry = location.state?.quizEntry || {};
const startTime = location.state?.startTime || quizEntry.startedAt;
const submitTime = location.state?.submitTime || quizEntry.submittedAt;
const earnedBadges = quizEntry.badges || [];
const correctCount = quizEntry.answers ? quizEntry.answers.filter(a => a.isCorrect).length : 0;
const totalQuestions = quizEntry.answers ? quizEntry.answers.length : 0;
const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
const durationInSeconds = typeof quizEntry.duration === 'string' 
  ? quizEntry.duration.split(':').reduce((acc, t, i) => acc + Number(t) * [3600,60,1][i], 0) 
  : quizEntry.duration ?? 0;

const handleCardClick = (entry) => {
  if (!reviewQuiz) {
    navigate('/quiz-history', {
      state: {
        reviewQuiz: true,
        quizEntry: entry,
        course: entry.course,
        quizTitle: entry.quizTitle, 
        answers: entry.answers
      }
    });
  }
};

  return (
    <div className="main-content">
      {reviewQuiz && quizEntry ? (
        <div className="quiz-review-card">
<h2>Quiz Review - {location.state.quizTitle || quizEntry.course || "Custom Quiz"}</h2>
          <div className="chart-container">
            <Doughnut
  data={{
    labels: ['Correct', 'Incorrect'],
    datasets: [{
      data: [Number(correctCount), Math.max(Number(totalQuestions) - Number(correctCount), 0)],
      backgroundColor: ['#1935CA', '#FF0000'],
      hoverBackgroundColor: ['#2148C0', '#FF3333'],
    }],
  }}
  options={{ maintainAspectRatio: false }}
  width={200}
  height={200}
/>
          </div>
          <p>Points Gained: {correctCount} / {totalQuestions}</p>
          <p>Percentage: {percentage}%</p>
<p>Badges Earned:</p>
<div className="badges-earned" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
  {earnedBadges.map((badgeId) => {
    const badge = badgeData.find(b => b.id === badgeId);
    if (!badge) return null;
    return (
      <div key={badge.id} style={{ textAlign: 'center' }}>
        <img src={badge.src} alt={badge.title} className="achievement-badge" style={{ width: '60px', height: '60px' }} />
        <p style={{ fontSize: '0.8rem' }}>{badge.title}</p>
      </div>
    );
  })}
</div>
          <div className="quiz-stats">
            <span className="stats-item">
              <i className="fas fa-clock stats-icon"></i>
              <span className="stats-label">Test Duration:</span> {formatDuration(quizEntry.duration)}
            </span>
            <span className="stats-item">
              <i className="fas fa-calendar-alt stats-icon"></i>
              <span className="stats-label">Test Start Time:</span> {formatDateTime(startTime)}
            </span>
            <span className="stats-item">
              <i className="fas fa-calendar-alt stats-icon"></i>
              <span className="stats-label">Test Submit Time:</span> {formatDateTime(submitTime)}
            </span>
          </div>
{quizEntry.answers?.map((a, index) => (
  <div key={index} className="review-question">
    <h3>Question {index + 1}</h3>
    <p>{a.questionText || "Question not found"}</p>
    <p>
      Your Answer:{" "}
      <span className={a.isCorrect ? "correct" : "wrong"}>
        {a.selectedAnswer || "—"}
      </span>
    </p>
    <p>
      Correct Answer:{" "}
      <span className="correct">{a.correctAnswer || "—"}</span>
    </p>
  </div>
))}
          <button className="back-button" onClick={() => navigate('/quiz-history')}>
            Back to History
          </button>
        </div>
      ) : (
        <>
          <h2>Quiz History</h2>
          <div className="quiz-card-list">
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '20px' }}>
                  You haven’t taken any quizzes yet.
                </p>
                <button
                  style={{
                    backgroundColor: '#1935CA',
                    color: 'white',
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
[...history]
  .sort((a, b) => new Date(b.submittedAt || b.startTime) - new Date(a.submittedAt || a.startTime))
  .map((entry, index) => {
const correctCountCard = entry.answers ? entry.answers.filter(a => a.isCorrect).length : 0;
const totalQuestionsCard = entry.answers ? entry.answers.length : 0;
                return (
                  <div key={index} className="quiz-card" onClick={() => handleCardClick(entry)}>
<div className="quiz-card-header">
  {entry.quizTitle || entry.course || "Custom Quiz"}
</div>
                    <div className="quiz-card-body">
                      <div className="quiz-card-left">
<p><strong>Date:</strong> {entry.startedAt ? formatDateTime(entry.startedAt) : 'N/A'}</p>
<p><strong>Duration:</strong> {formatDuration(entry.duration)}</p>
<p><strong>Correct:</strong> {correctCountCard}/{totalQuestionsCard}</p>
<p><strong>Percentage:</strong> {totalQuestionsCard > 0 ? ((correctCountCard / totalQuestionsCard) * 100).toFixed(2) : 0}%</p>
                      </div>
                      <div className="quiz-card-right">
                        <Doughnut
                          data={{
                            labels: ['Correct', 'Incorrect'],
                            datasets: [{
  data: [Number(correctCountCard), Math.max(Number(totalQuestionsCard) - Number(correctCountCard), 0)],
                              backgroundColor: ['#1935CA', '#FF0000'],
                              borderWidth: 1
                            }]
                          }}
                          options={{
                            cutout: '70%',
                            plugins: { legend: { display: false } }
                          }}
                          width={100}
                          height={100}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default QuizHistory;