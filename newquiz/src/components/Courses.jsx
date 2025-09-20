import { useEffect, useState } from 'react';
import '../styles/Courses.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClipboard, FiTrash2, FiFilter } from 'react-icons/fi';
import defaultQuestionsData from '../components/DefaultQuiz';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [liveQuizzes, setLiveQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, quiz: null });
  const [filter, setFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadingLiveQuizzes, setLoadingLiveQuizzes] = useState(true);
  const [activeModal, setActiveModal] = useState(null); 
  const [pendingQuiz, setPendingQuiz] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const defaultCourses = [
  { name: 'Physics', description: 'Understand motion, energy, and the universe.', image: '/phy.jpg', questions: defaultQuestionsData['Physics'].length, timeLimit: 15 },
  { name: 'Chemistry', description: 'Explore chemical reactions and elements.', image: '/chem.jpg', questions: defaultQuestionsData['Chemistry'].length, timeLimit: 15 },
  { name: 'Mathematics', description: 'Master equations and problem-solving.', image: '/math.jpg', questions: defaultQuestionsData['Mathematics'].length, timeLimit: 15 },
  { name: 'Biology', description: 'Study living organisms and evolution.', image: '/bio.jpg', questions: defaultQuestionsData['Biology'].length, timeLimit: 15 },
  { name: 'Social', description: 'Understand history, politics, and geography.', image: '/soc.jpg', questions: defaultQuestionsData['Social'].length, timeLimit: 15 },
  { name: 'English', description: 'Improve communication and expression.', image: '/eng.jpg', questions: defaultQuestionsData['English'].length, timeLimit: 15 },
];

useEffect(() => {
  const custom = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
  const formattedCustom = custom.reverse().map((quiz) => ({
    ...quiz,
    image: '/groupq.jpg',
    isCustom: true,
  }));
  setCourses([...formattedCustom, ...defaultCourses]);

  const token = localStorage.getItem('token');
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userBranch = userData?.branch || '';
  if (!token) {
    console.error('No auth token found');
    setLoadingLiveQuizzes(false);
    return;
  }

  setLoadingLiveQuizzes(true); // Start loading

  fetch('http://localhost:5000/api/quizzes/live', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('Failed to fetch live quizzes');
      const data = await res.json();
      console.log('Live Quizzes Data from API:', data); // Log API response
      setLiveQuizzes(data); // Update state
      console.log('Live Quizzes State After Update:', data); // Log the new state data
    })
    .catch((err) => {
      console.error('Fetch error:', err);
      setLiveQuizzes([]);
    })
    .finally(() => {
      setLoadingLiveQuizzes(false);
    });
}, [location]);

useEffect(() => {
  const custom = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
  const formattedCustom = custom.reverse().map((quiz) => ({
    ...quiz,
    image: '/groupq.jpg',
    isCustom: true,
  }));

  if (location.state?.reopenPopupFor) {
    const quizToOpen = formattedCustom.find((q) => q.name === location.state.reopenPopupFor);
    if (quizToOpen) {
      setSelectedQuiz(quizToOpen);
      setShowPopup(true);
    }
  }
}, [location]);

const handleClick = async (quiz) => {
  try {
    if (quiz.type === 'custom' || quiz.isCustom) {
      setSelectedQuiz(quiz);     
      setShowPopup(true);
    } else {
      setPendingQuiz(quiz);     
      if (quiz.code) {
        setActiveModal('live');   
      } else {
        setActiveModal('default'); 
      }
    }
  } catch (error) {
    console.error("Error handling quiz click:", error);
  }
};

  const handleRightClick = (e, course) => {
    e.preventDefault();
    if (course.isCustom && course.creator === 'me') {
      setContextMenu({ visible: true, x: e.pageX, y: e.pageY, quiz: course });
    }
  };

  const handleDelete = () => {
    const quizToDelete = contextMenu.quiz;
    const existing = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
    const updated = existing.filter((q) => q.name !== quizToDelete.name);
    localStorage.setItem('customQuizzes', JSON.stringify(updated));
    setContextMenu({ visible: false, x: 0, y: 0, quiz: null });

    const formatted = updated.reverse().map((quiz) => ({
      ...quiz,
      image: '/groupq.jpg',
      isCustom: true,
    }));
    setCourses([...formatted, ...defaultCourses]);
  };

  const getAttempts = (quizName) => {
    const allAttempts = JSON.parse(localStorage.getItem('customQuizAttempts') || '{}');
    return allAttempts[quizName] || [];
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      alert('Quiz code copied!');
    });
  };

  const filteredCourses =
    filter === 'all'
      ? [...liveQuizzes, ...courses]
      : filter === 'custom'
      ? courses.filter((c) => c.isCustom)
      : filter === 'live'
      ? liveQuizzes
      : courses.filter((c) => !c.isCustom);

  return (
    <div
      className="courses"
      onClick={() => {
        setContextMenu({ visible: false, x: 0, y: 0, quiz: null });
        setIsFilterOpen(false);
      }}
    >
      <div className="courses-header">
        <h1>My Courses</h1>
        <div className="filter-dropdown">
          <button
            className="filter-dropdown-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsFilterOpen(!isFilterOpen);
            }}
          >
            <FiFilter style={{ marginRight: '6px' }} /> Filter
          </button>
          {isFilterOpen && (
            <div className="filter-dropdown-menu">
              {['all', 'custom', 'live', 'default'].map((type) => (
                <div
                  key={type}
                  className="filter-option"
                  onClick={() => {
                    setFilter(type);
                    setIsFilterOpen(false);
                  }}
                >
                  {type[0].toUpperCase() + type.slice(1)} Quizzes
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {['custom', 'live', 'default', 'all'].includes(filter) && (
        <>
          {filter === 'live' || filter === 'all' ? (
  <>
    <h2 style={{ color: '#1935CA' }}>Live Quizzes</h2>
    <div className="course-list">
      {loadingLiveQuizzes ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading live quizzes...</span>
        </div>
      ) : liveQuizzes.length === 0 ? (
        <p style={{ paddingLeft: '10px' }}>No live quizzes available right now.</p>
      ) : (
        liveQuizzes.map((quiz) => (
          <div
            key={quiz._id || quiz.code}
            className="course-card"
            onClick={() => handleClick(quiz)}
          >
            <img
              src={quiz.image || '/defaultlive.jpg'}
              alt={quiz.name}
              className="course-image"
            />
            <div className="course-content">
              <h3>{quiz.name}</h3>
              <p>{quiz.description || 'Live quiz by admin.'}</p>
              <div className="course-meta-inline">
                <span><strong>From:</strong> {quiz.startDate ? new Date(quiz.startDate).toLocaleDateString() : 'N/A'}</span>
                <span><strong>To:</strong> {quiz.endDate ? new Date(quiz.endDate).toLocaleDateString() : 'N/A'}</span>
                <span><strong>Questions:</strong> {quiz.questions?.length || 0}</span>
                <span><strong>Duration:</strong> {quiz.timeLimit ? `${quiz.timeLimit} mins` : 'N/A'}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </>
) : null}

          {filter === 'custom' || filter === 'all' ? (
            <>
              <h2 style={{ color: '#1935CA' }}>Custom Quizzes</h2>
              <div className="course-list">
                {courses.filter((c) => c.isCustom).length === 0 ? (
                  <p style={{ paddingLeft: '10px' }}>No custom quizzes available.</p>
                ) : (
                  courses
                    .filter((c) => c.isCustom)
                    .map((course) => (
                      <div
                        key={course.name}
                        className="course-card"
                        onClick={() => handleClick(course)}
                        onContextMenu={(e) => handleRightClick(e, course)}
                      >
                        <img src={course.image} alt={course.name} className="course-image" />
                        <div className="course-content">
                          <h3>{course.name}</h3>
                          <p>{course.description || 'Custom Quiz created by a user.'}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </>
          ) : null}

          {filter === 'default' || filter === 'all' ? (
            <>
              <h2 style={{ color: '#1935CA' }}>Default Quizzes</h2>
              <div className="course-list">
                {courses
  .filter((c) => !c.isCustom)
  .map((course) => (
    <div
      key={course.name}
      className="course-card"
      onClick={() => handleClick(course)}
    >
      <img src={course.image} alt={course.name} className="course-image" />
      <div className="course-content">
        <h3>{course.name}</h3>
        <p>{course.description}</p>
        <div className="course-meta-inline">
          <span><strong>Questions:</strong> {course.questions}</span>
          <span><strong>Duration:</strong> {course.timeLimit} mins</span>
        </div>
      </div>
    </div>
  ))}
              </div>
            </>
          ) : null}
        </>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="custom-context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: 'absolute',
            background: '#fff',
            padding: '10px',
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            zIndex: 999,
          }}
        >
          <div
            onClick={handleDelete}
            style={{ cursor: 'pointer', color: 'red', display: 'flex', alignItems: 'center' }}
          >
            <FiTrash2 style={{ marginRight: '8px' }} /> Delete Quiz
          </div>
        </div>
      )}

      {/* Quiz Popup */}
      {showPopup && selectedQuiz && (
        <div className="quiz-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h2>Quiz: {selectedQuiz.name}</h2>

            <div className="invite-section">
              <label>Quiz Code:</label>
              <div className="copy-code">
                <input value={selectedQuiz.code || 'N/A'} readOnly />
                <FiClipboard
                  className="copy-icon"
                  onClick={() => copyToClipboard(selectedQuiz.code)}
                  title="Copy Code"
                />
              </div>
            </div>

            <h3>Leaderboard</h3>
            <div className="leaderboard">
              {getAttempts(selectedQuiz.name).length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#888' }}>No one has taken this quiz yet.</p>
              ) : (
                getAttempts(selectedQuiz.name).map((entry, index) => {
                  const correctAnswers = entry.answers.filter(
                    (ans, i) => ans === selectedQuiz.questions[i]?.correctAnswer
                  ).length;

                  return (
                    <div key={index} className="leaderboard-entry">
                      <p><strong>Participant:</strong> {entry.name || 'Anonymous'}</p>
                      <p><strong>Score:</strong> {correctAnswers}/{selectedQuiz.questions.length}</p>
                      <p><strong>Time Taken:</strong> {entry.timeTaken || 'N/A'}</p>
                      <div className="qa-review">
                        {selectedQuiz.questions.map((q, i) => (
                          <div key={i} className="review-question">
                            <p><strong>Q{i + 1}:</strong> {q.questionText}</p>
                            <p>
                              Answered:{' '}
                              <span style={{ color: entry.answers[i] === q.correctAnswer ? 'green' : 'red' }}>
                                {entry.answers[i] || '—'}
                              </span>
                            </p>
                            <p>Correct Answer: <span style={{ color: 'green' }}>{q.correctAnswer}</span></p>
                            <hr />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              className="review-btn"
              onClick={() =>
                navigate('/custom-quiz-review', {
                  state: {
                    course: selectedQuiz.name,
                    questions: selectedQuiz.questions,
                  },
                })
              }
            >
              Review Quiz
            </button>
          </div>
        </div>
      )}
      {activeModal && pendingQuiz && (
  <div className="quiz-popup-overlay" onClick={() => setActiveModal(null)}>
    <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setActiveModal(null)}>×</button>
      <h2>📘 {activeModal === 'live' ? 'Live Quiz Instructions' : 'Default Quiz Instructions'}</h2>
      <p>Please carefully read and agree to the below:</p>
      <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
        <li>Use a desktop or laptop. Avoid mobile usage.</li>
        <li>Use the latest Chrome or Firefox browser.</li>
        <li>Ensure stable internet connectivity.</li>
        <li>Do not refresh or switch tabs — quiz may auto-submit.</li>
        <li>You can attempt this quiz only once.</li>
        <li>The quiz will start immediately after you proceed.</li>
      </ul>
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
<button
  className="review-btn"
  onClick={async () => {
    try {
      // ✅ Request fullscreen here (user gesture)
      const element = document.documentElement;
      if (element.requestFullscreen) await element.requestFullscreen();
      else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen();
      else if (element.msRequestFullscreen) await element.msRequestFullscreen();
    } catch (err) {
      console.warn("⚠️ Fullscreen request blocked:", err);
    }

    // ✅ Then navigate
    setActiveModal(null);
    if (activeModal === 'live') {
      navigate(`/quiz/${pendingQuiz.code}`, {
        state: {
          code: pendingQuiz.code,
          quizId: pendingQuiz._id,
          course: pendingQuiz.name,
          isLive: true,
        },
      });
    } else {
      navigate(`/quiz/${pendingQuiz.name.toLowerCase()}`, {
        state: {
          isDefaultQuiz: true,
          course: pendingQuiz.name,
          questions: defaultQuestionsData[pendingQuiz.name] || [],
        },
      });
    }
  }}
>
  Agree & Proceed
</button>

      </div>
    </div>
  </div>
)}
    </div>
  );
}
export default Courses;
