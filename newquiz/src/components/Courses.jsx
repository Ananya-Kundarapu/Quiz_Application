import { useEffect, useState } from 'react';
import '../styles/Courses.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClipboard, FiTrash2, FiFilter } from 'react-icons/fi';
import defaultQuestionsData from '../components/DefaultQuiz';
import { useAuth } from '../Context/AuthContext';

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
const [studentQuizzes, setStudentQuizzes] = useState([]);
const [loadingStudentQuizzes, setLoadingStudentQuizzes] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
const { token, user } = useAuth();

  const defaultCourses = [
  { name: 'Physics', description: 'Understand motion, energy, and the universe.', image: '/phy.jpg', questions: defaultQuestionsData['Physics'].length, timeLimit: 15 },
  { name: 'Chemistry', description: 'Explore chemical reactions and elements.', image: '/chem.jpg', questions: defaultQuestionsData['Chemistry'].length, timeLimit: 15 },
  { name: 'Mathematics', description: 'Master equations and problem-solving.', image: '/math.jpg', questions: defaultQuestionsData['Mathematics'].length, timeLimit: 15 },
  { name: 'Biology', description: 'Study living organisms and evolution.', image: '/bio.jpg', questions: defaultQuestionsData['Biology'].length, timeLimit: 15 },
  { name: 'Social', description: 'Understand history, politics, and geography.', image: '/soc.jpg', questions: defaultQuestionsData['Social'].length, timeLimit: 15 },
  { name: 'English', description: 'Improve communication and expression.', image: '/eng.jpg', questions: defaultQuestionsData['English'].length, timeLimit: 15 },
];

useEffect(() => {
  const fetchAllQuizzes = async () => {
    if (!token) {
      console.warn('No token found. Aborting quiz fetch.');
      setLoadingLiveQuizzes(false);
      setLoadingStudentQuizzes(false);
      return;
    }

    setCourses([...defaultCourses]);
    setLoadingLiveQuizzes(true);
    setLoadingStudentQuizzes(true);

try {
  const headers = { Authorization: `Bearer ${token}` };

  const [liveRes, customRes] = await Promise.all([
    fetch('http://localhost:5000/api/quizzes/student-live-quizzes', { headers }),
    fetch('http://localhost:5000/api/quizzes/my-custom-quizzes', { headers }),
  ]);
      if (!liveRes.ok || !customRes.ok) {
        throw new Error('Server responded with an error for one or more requests.');
      }

      const liveData = await liveRes.json();
      const customData = await customRes.json();

      if (Array.isArray(liveData)) {
        setLiveQuizzes(liveData);
      } else {
        console.error('API Error: Live quizzes response is not an array.', liveData);
        setLiveQuizzes([]);
      }

if (Array.isArray(customData)) {
  setStudentQuizzes(
    customData.reverse().map((quiz) => {
      // Uniformly parse dates into Date objects or null
      const parseDate = (d) => {
        if (!d) return null;
        try {
          return new Date(d);
        } catch {
          return null;
        }
      };

      return {
        ...quiz,
        _id: quiz._id || quiz.name,
        code: quiz.code || 'N/A',
        image: quiz.image || '/groupq.jpg',
        isCustom: true,
        startDate: parseDate(quiz.startDate),
        endDate: parseDate(quiz.endDate),
        questions: quiz.questions || [],
        isPublished: !!quiz.isPublished,
      };
    })
  );
} else {
  console.error('API Error: Custom quizzes response is not an array.', customData);
  setStudentQuizzes([]);
}
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setLiveQuizzes([]);
      setStudentQuizzes([]);
    } finally {
      setLoadingLiveQuizzes(false);
      setLoadingStudentQuizzes(false);
    }
  };

  fetchAllQuizzes();
}, [location, token]);

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

const filteredCourses = (() => {
  switch (filter) {
    case 'all':
      return [...liveQuizzes, ...studentQuizzes, ...courses];
    case 'custom':
      return studentQuizzes;
    case 'live':
      return liveQuizzes;
    case 'default':
      return courses;
    default:
      return [...liveQuizzes, ...studentQuizzes, ...courses];
  }
})();

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
  {filteredCourses.filter((q) => q.isCustom).length === 0 ? (
    <p style={{ paddingLeft: '10px' }}>No custom quizzes available.</p>
  ) : (
filteredCourses
  .filter((q) => q.isCustom)
  .map((quiz) => (
    <div
      key={quiz._id || quiz.name}
      id={`quiz-${quiz._id || quiz.name}`}
      className="course-card"
      onClick={() => handleClick(quiz)}
      onContextMenu={(e) => handleRightClick(e, quiz)}
    >
      <img src={quiz.image || '/groupq.jpg'} alt={quiz.name} className="course-image" />

      <div className="course-content">
        <h3>{quiz.name}</h3>
        <p>{quiz.description || 'Custom Quiz created by you.'}</p>

        {quiz.branches && quiz.branches.length > 0 && (
          <p className="text-xs text-gray-600">
            Branches: {quiz.branches.join(', ')}
          </p>
        )}

<div className="course-meta-inline">
  <span>From: {quiz.startDate instanceof Date && !isNaN(quiz.startDate) ? quiz.startDate.toLocaleDateString() : 'N/A'}</span>
  <span>To: {quiz.endDate instanceof Date && !isNaN(quiz.endDate) ? quiz.endDate.toLocaleDateString() : 'N/A'}</span>
</div>

        <div className="course-meta-labels">
          <span className="badge">Questions: {quiz.questions?.length || 0}</span>
          <span className="badge">Duration: {quiz.timeLimit ? `${quiz.timeLimit} mins` : 'N/A'}</span>
        </div>

        <p className="quiz-status">
          <strong>Status:</strong>{' '}
          <span className={quiz.isPublished ? 'status-published' : 'status-unpublished'}>
            {quiz.isPublished ? 'Published' : 'Not Published'}
          </span>
        </p>
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

{showPopup && selectedQuiz && (
  <div className="quiz-popup-overlay" onClick={() => setShowPopup(false)}>
    <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
      <h2>Quiz: {selectedQuiz.name}</h2>

      {/* Quiz Code Section */}
      <div className="invite-section">
        <label>Quiz Code:</label>
        <div className="copy-code">
          <input value={selectedQuiz.code || 'N/A'} readOnly />
          <FiClipboard className="copy-icon" onClick={() => copyToClipboard(selectedQuiz.code)} />
        </div>
      </div>
<button
  className="leaderboard-btn"
  onClick={() => {
    if (!selectedQuiz._id) return;
if (selectedQuiz.isCustom) {
  navigate(`/leaderboard/custom/${selectedQuiz.uniqueCode || selectedQuiz.code}`); 
} else {
  navigate(`/leaderboard/${selectedQuiz._id}`);
}
  }}
>
  View Leaderboard
</button>

      <p style={{ fontStyle: 'italic', color: '#555', marginTop: '8px', marginLeft: '18px' }}>
        {getAttempts(selectedQuiz.name).length > 0
          ? `${getAttempts(selectedQuiz.name).length} ${getAttempts(selectedQuiz.name).length === 1 ? 'student has' : 'students have'} taken this quiz.`
          : 'No one has taken this quiz yet.'}
      </p>

      {/* Edit Button */}
      <button className="edit-btn" onClick={() => navigate('/create-quiz', { state: { editQuizId: selectedQuiz._id || selectedQuiz.name } })}>
        Edit Quiz
      </button>

      {/* Publish Toggle */}
      <button
        className={`publish-toggle-btn ${selectedQuiz.isPublished ? 'unpublish' : 'publish'}`}
        onClick={async () => {
          if (!selectedQuiz) return;
          try {
            const response = await fetch(`http://localhost:5000/api/quizzes/${selectedQuiz._id || selectedQuiz.name}/toggle-publish`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ isPublished: !selectedQuiz.isPublished }),
            });
            const updated = await response.json();
            setStudentQuizzes(prev =>
              prev.map(q => q._id === selectedQuiz._id ? { ...q, isPublished: updated.isPublished } : q)
            );
            setSelectedQuiz(prev => prev ? { ...prev, isPublished: updated.isPublished } : prev);
          } catch (err) {
            console.error(err);
            alert('Error updating publish status');
          }
        }}
      >
        {selectedQuiz.isPublished ? 'Unpublish' : 'Publish'}
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
