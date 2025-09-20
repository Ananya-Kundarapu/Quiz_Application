import { useState, useEffect } from 'react';
import { FaTrophy, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FiClipboard } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext'; // ✅ use Auth context
import '../styles/Profile.css';

function Profile() {
  const [quizHistory, setQuizHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
const { user, loading: authLoading } = useAuth(); 
  const fullName = user?.fName + ' ' + user?.lName || 'User';
const backendBase = 'http://localhost:5000';
const profileImage = user?.profilePic?.startsWith('/uploads/')
  ? `${backendBase}${user.profilePic}`
  : user?.profilePic || '/profile.png';
useEffect(() => {
  if (authLoading) return; 

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping quiz history fetch.');
        setQuizHistory([]);
        return;
      }
      const res = await fetch('http://localhost:5000/api/results/user/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setQuizHistory(data);
      } else {
        console.error('Error fetching results:', data.message);
        setQuizHistory([]); 
      }
    } catch (err) {
      console.error('Failed to fetch quiz history', err);
      setQuizHistory([]); 
    }
  };
  fetchResults();
}, [authLoading]); 
const totalCorrect = quizHistory.reduce((sum, entry) => sum + (entry.score || 0), 0);
const totalAnswers = quizHistory.reduce((sum, entry) => sum + (entry.answers?.length || 0), 0);

const quizzesPassed = quizHistory.filter(entry => {
  const totalQuestions = entry.answers?.length;
  if (!totalQuestions) return false;
  return (entry.score / totalQuestions) * 100 >= 30;
}).length;

const progressPercent = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
const progressColor =
  progressPercent >= 80 ? '#1935CA' :
  progressPercent >= 50 ? '#4a90e2' : '#888888';

const badgeData = [
  { id: 'winner', title: 'Winner', src: '/winner.png', desc: 'Scored 100% in a quiz' },
  { id: 'powerPlayer', title: 'Power Player', src: '/powerPlayer.png', desc: 'Scored ≥80%' },
  { id: 'streakMaster', title: 'Streak Master', src: '/streakMaster.jpg', desc: 'Scored ≥70% in 3 quizzes in a row' },
  { id: 'comeback', title: 'Comeback', src: '/comeback.png', desc: 'Scored <40% then >70% in next quiz' },
  { id: 'perfectionist', title: 'Perfectionist', src: '/perfectionist.png', desc: 'Completed all quizzes' },
  { id: 'speedster', title: 'Speedster', src: '/speedster.jpg', desc: 'Completed quiz in <30s per question' },
  { id: 'lucky', title: 'Lucky', src: '/lucky.png', desc: 'Scored >60% in less than 50% of time limit' },
];

const unlockedBadges = new Set(
  quizHistory.flatMap(r => r.badges || [])
);

const handleClipboardClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJoinCode(text);
      setJoinError('');
    } catch (err) {
      console.error('Clipboard read failed:', err);
    }
  };

  const handleJoinQuiz = async () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a quiz code.');
      return;
    }
    setJoinError('');
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${joinCode.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid code');

      navigate(`/quiz/${data.name}`, {
        state: {
          isCustom: true,
          code: data.code,
          joinMode: true,
          questions: data.questions,
          timeLimit: data.timer,
        },
      });
    } catch (err) {
      setJoinError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <img src={profileImage} alt="Profile" className="profile-image" />
        <div className="profile-info">
          <h1>{fullName}</h1>
          <p>Level Up with Every Quiz You Conquer!</p>
          <div className="progress-bar" style={{ backgroundColor: '#ddd' }}>
            <div
              className="progress"
              style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
            />
          </div>
<div className="stats">
  <div><FaTrophy size={28} color="#1935CA" /><span>{quizzesPassed} Quiz Passed</span></div>
  <div><FaTrophy size={28} color="#1935CA" /><span>{unlockedBadges.size} Badges Earned</span></div>
  <div><FaCheckCircle size={28} color="#1935CA" /><span>{totalCorrect} Correct Answers</span></div>
</div>
        </div>
      </div>

      <div className="row-widgets">
        <div className="achievements-card half-width">
          <h3>Achievements</h3>
          <div className="achievements-list" onClick={() => setShowModal(true)}>
            {badgeData.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="achievement-item"
                title={badge.desc}
style={{
    filter: quizHistory.flatMap(r => r.badges).includes(badge.id) ? 'none' : 'grayscale(100%)',
    cursor: 'pointer',
}}
              >
                <img src={badge.src} alt={badge.title} className="achievement-badge" />
                {badge.title}
              </div>
            ))}
          </div>
        </div>

        <div className="custom-quiz-card half-width">
          <h3>Create Custom Quiz</h3>
          <p>Make and share your own quiz with friends!</p>
          <button onClick={() => navigate('/create-quiz')}>+ Create Quiz</button>
        </div>
      </div>

      <div className="play-with-friends-card">
        <h3>Play with Friends</h3>
        <div className="join-input">
          <input
            type="text"
            placeholder="Enter code"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value);
              setJoinError('');
            }}
          />
          <FiClipboard className="clipboard-icon" onClick={handleClipboardClick} />
          <button onClick={handleJoinQuiz} disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join'}
          </button>
        </div>
        {joinError && <p className="error-text">{joinError}</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <h2>All Achievements</h2>
            <div className="scrollable-badges">
              {badgeData.map((badge) => (
                <div
                  key={badge.id}
                  className="achievement-item"
                  title={badge.desc}
style={{
    filter: quizHistory.flatMap(r => r.badges).includes(badge.id) ? 'none' : 'grayscale(100%)',
    cursor: 'default',
}}
                >
                  <img src={badge.src} alt={badge.title} className="achievement-badge" />
                  <p>{badge.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
