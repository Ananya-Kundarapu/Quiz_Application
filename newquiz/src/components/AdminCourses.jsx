import { useEffect, useState, useRef } from 'react';
import '../styles/AdminCourses.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClipboard } from 'react-icons/fi';

function AdminCourses() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [leaderboardSort, setLeaderboardSort] = useState('score');
  const navigate = useNavigate();
  const location = useLocation();
  const newQuizId = location.state?.newQuizId;
  const saveConfirmation = location.state?.saveConfirmation;
  const containerRef = useRef();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmAction, setConfirmAction] = useState(() => () => {});
const contextMenuRef = useRef();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        const userData = JSON.parse(sessionStorage.getItem('user'));

        if (!token || !userData) {
          console.error('Not logged in');
          setMyCourses([]);
          setLoading(false);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 300)); // optional delay

        const res = await fetch('http://localhost:5000/api/quizzes/my-quizzes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          let quizzes = data.quizzes.map((q) => ({
  id: q._id,
  code: q.code,
  name: q.title,
  description: q.description || 'Custom quiz created by you.',
  image: q.image || '/groupq.jpg',
  isCustom: true,
  creatorEmail: q.createdBy?.email || '',
  questions: q.questions || [],
  isPublished: q.isPublished || false,
  startDate: q.startDate,
  endDate: q.endDate,
  timeLimit: q.timeLimit,
  branches: q.branches || [],
}));


          if (newQuizId) {
            quizzes = quizzes.sort((a, b) => {
              if (a.id === newQuizId) return -1;
              if (b.id === newQuizId) return 1;
              return 0;
            });
          } else {
            quizzes = quizzes.reverse();
          }

          setMyCourses(quizzes);

          setTimeout(() => {
            if (newQuizId) {
              const el = document.getElementById(`quiz-${newQuizId}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 200);
        } else {
          console.error('Failed to fetch quizzes:', data.message);
          setMyCourses([]);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setMyCourses([]);
      } finally {
        setLoading(false);
        window.history.replaceState({}, document.title);
      }
    };

    fetchQuizzes();
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  const handleRightClick = (e, quiz) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      quiz,
    });
  };

   const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

      const data = await res.json();
      if (res.ok) {
        alert('Quiz deleted successfully');
        setMyCourses((prev) => prev.filter((q) => q.id !== quizId));
        setContextMenu(null);
        if (showPopup && selectedQuiz?.id === quizId) {
          setShowPopup(false);
          setSelectedQuiz(null);
        }
      } else {
        alert('Failed to delete quiz: ' + data.message);
      }
    } catch (err) {
      alert('Error deleting quiz: ' + err.message);
    }
  };

  const handleClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowPopup(true);
    setContextMenu(null);
  };

  const getAttempts = (quizName) => {
    const allAttempts = JSON.parse(localStorage.getItem('customQuizAttempts') || '{}');
    return allAttempts[quizName] || [];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Quiz code copied!');
    });
  };

  const sortedLeaderboard = (entries) => {
    if (leaderboardSort === 'score') {
      return [...entries].sort((a, b) => {
        const aCorrect = a.answers.filter((ans, i) => ans === selectedQuiz.questions[i]?.correctAnswer).length;
        const bCorrect = b.answers.filter((ans, i) => ans === selectedQuiz.questions[i]?.correctAnswer).length;
        return bCorrect - aCorrect;
      });
    } else if (leaderboardSort === 'time') {
      const parseTime = (t) => {
        if (!t) return Infinity;
        if (typeof t === 'number') return t;
        const parts = t.split(':').map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return Number(t) || Infinity;
      };
      return [...entries].sort((a, b) => parseTime(a.timeTaken) - parseTime(b.timeTaken));
    }
    return entries;
  };

  const handleEditQuiz = () => {
    setShowPopup(false);
    navigate('/create-quiz', {
      state: {
        editQuizId: selectedQuiz.id,
      },
    });
  };

  return (
    <div className="admin-courses" ref={containerRef}>
      <div className="courses-header">
        <h1>My Courses</h1>
      </div>

      {saveConfirmation && (
        <div className="save-confirmation" style={{ color: 'green', marginBottom: '1rem' }}>
          {saveConfirmation}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading quizzes...</div>
      ) : myCourses.length === 0 ? (
        <div className="no-courses-container">
          <p className="no-courses-msg">No quizzes created yet.</p>
          <button className="create-quiz-btn" onClick={() => navigate('/create-quiz')}>
            Create Quiz
          </button>
        </div>
      ) : (
        <div className="course-list">
          {myCourses.map((quiz) => (
            <div
  key={quiz.code}
  id={`quiz-${quiz.id}`}
  className="course-card"
  onClick={() => handleClick(quiz)}
  onContextMenu={(e) => handleRightClick(e, quiz)}
>
  <img src={quiz.image} alt={quiz.name} className="course-image" />

  <div className="course-content">
    <h3>{quiz.name}</h3>
    <p>{quiz.description}</p>
    {quiz.branches && quiz.branches.length > 0 && (
  <p className="text-xs text-gray-600">Branches: {quiz.branches.join(', ')}</p>
)}

    <div className="course-meta-inline">
  <span>From: {quiz.startDate ? new Date(quiz.startDate).toLocaleDateString() : 'N/A'}</span>
  <span>To: {quiz.endDate ? new Date(quiz.endDate).toLocaleDateString() : 'N/A'}</span>
</div>

<div className="course-meta-labels">
  <span className="badge">Questions: {quiz.questions.length}</span>
  <span className="badge">Duration: {quiz.timeLimit} min</span>
</div>
<p className="quiz-status">
  <strong>Status:</strong>{' '}
  <span className={quiz.isPublished ? 'status-published' : 'status-unpublished'}>
    {quiz.isPublished ? 'Published' : 'Not Published'}
  </span>
</p>

{quiz.isAdmin && (
  <>
    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
      <strong style={{ fontWeight: 500 }}>Branches:</strong>{' '}
      {quiz.branches?.length === 0 ? 'All' : quiz.branches?.join(', ') || 'N/A'}
    </p>
    <p style={{ fontSize: '0.9rem', color: '#666' }}>
      <strong style={{ fontWeight: 500 }}>Status:</strong>{' '}
      <span style={{ color: quiz.isPublished ? '#4CAF50' : '#FFA500', fontWeight: 500 }}>
        {quiz.isPublished ? 'Published' : 'Not Published'}
      </span>
    </p>
  </>
)}
  </div>
</div>
          ))}
        </div>
      )}

      {contextMenu && (
        <ul
  ref={contextMenuRef}
  className="context-menu"
  style={{
    top: contextMenu.y,
    left: contextMenu.x,
    position: 'absolute',
    zIndex: 1000,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: 0,
    margin: 0,
    listStyle: 'none',
  }}
  onContextMenu={(e) => e.preventDefault()}
>
                    <li className="context-menu-item" style={{ padding: '8px 12px', cursor: 'pointer', color: 'red' }}
                    onClick={() => deleteQuiz(contextMenu.quiz.id)}>
            Delete Quiz
          </li>
        </ul>
      )}

      {showPopup && selectedQuiz && (
        <div className="quiz-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h2>Quiz: {selectedQuiz.name}</h2>
            {selectedQuiz.branches && (
  <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '10px' }}>
    <strong style={{ fontWeight: 500 }}>Branches:</strong>{' '}
    {selectedQuiz.branches?.length === 0 ? 'All' : selectedQuiz.branches?.join(', ') || 'N/A'}
  </p>
)}
            <div className="invite-section">
              <label>Quiz Code:</label>
              <div className="copy-code">
                <input value={selectedQuiz.code} readOnly />
                <FiClipboard className="copy-icon" onClick={() => copyToClipboard(selectedQuiz.code)} />
              </div>
            </div>
            <h3>Leaderboard</h3>
            {getAttempts(selectedQuiz.name).length > 0 && (
              <div className="leaderboard-sort">
                <label>Sort by: </label>
                <select value={leaderboardSort} onChange={(e) => setLeaderboardSort(e.target.value)}>
                  <option value="score">Score (High to Low)</option>
                  <option value="time">Time Taken (Fastest First)</option>
                </select>
              </div>
            )}

            <div className="leaderboard" style={{ maxHeight: '300px', overflow: 'auto' }}>
              {getAttempts(selectedQuiz.name).length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#888' }}>No one has taken this quiz yet.</p>
              ) : (
                sortedLeaderboard(getAttempts(selectedQuiz.name)).map((entry, index) => {
                  const correct = entry.answers.filter(
                    (ans, i) => ans === selectedQuiz.questions[i]?.correctAnswer
                  ).length;

                  return (
                    <div key={index} className="leaderboard-entry" style={{ borderBottom: '1px solid #ccc', padding: '8px 0' }}>
                      <p><strong>Participant:</strong> {entry.name || 'Anonymous'}</p>
                      <p><strong>Email:</strong> {entry.email || 'N/A'}</p>
                      <p><strong>Score:</strong> {correct}/{selectedQuiz.questions.length}</p>
                      <p><strong>Time Taken:</strong> {entry.timeTaken || 'N/A'}</p>

                      <details style={{ marginTop: '6px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Answers</summary>
                        <div style={{ marginTop: '4px' }}>
                          {selectedQuiz.questions.map((q, i) => {
                            const answeredIndex = entry.answers[i];
                            const answeredText = answeredIndex != null && q.options?.[answeredIndex] ? q.options[answeredIndex] : '';
                            const correctIndex = q.correctAnswer;
                            const correctText = q.options?.[correctIndex] || '';
                            return (
                              <div key={i} style={{ marginBottom: '6px' }}>
                                <p><strong>{i + 1}:</strong> {q.questionText}</p>
                                <p>Answered: <span style={{ color: answeredIndex === correctIndex ? 'green' : 'red' }}>{answeredText}</span></p>
                                <p>Correct Answer: <span style={{ color: 'green' }}>{correctText}</span></p>
                                <hr />
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    </div>
                  );
                })
              )}
            </div>

           <button className="edit-btn" onClick={handleEditQuiz}>Edit Quiz</button>
<br />
<button
  className={`publish-toggle-btn ${selectedQuiz.isPublished ? 'unpublish' : 'publish'}`}
  onClick={async () => {
    if (!selectedQuiz) return;

    if (selectedQuiz.isPublished) {
      const confirmUnpublish = window.confirm(`Are you sure you want to unpublish "${selectedQuiz.name}"?`);
      if (!confirmUnpublish) return;
    }
    try {
    const response = await fetch(`http://localhost:5000/api/quizzes/${selectedQuiz.id}/toggle-publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isPublished: !selectedQuiz.isPublished }),
      });

      if (!response.ok) throw new Error('Failed to update publish status');
      const updated = await response.json();

      setMyCourses((prev) =>
        prev.map((quiz) =>
          quiz.id === selectedQuiz.id ? { ...quiz, isPublished: updated.isPublished } : quiz
        )
      );
      setSelectedQuiz((prev) =>
        prev ? { ...prev, isPublished: updated.isPublished } : prev
      );

      if (!selectedQuiz.isPublished) {
        const toast = document.createElement('div');
        toast.innerHTML = `✅ Quiz "${selectedQuiz.name}" is Published`;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong while updating publish status.');
    }
  }}
>
  {selectedQuiz.isPublished ? 'Unpublish' : 'Publish'}
</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCourses;
