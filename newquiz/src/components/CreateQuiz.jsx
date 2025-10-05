import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/CreateQuiz.css';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

const BRANCHES = ['CSE', 'CSM', 'CSO', 'IT', 'ECE', 'ME', 'CE', 'EE'];

function CreateQuiz() {
  const [quizName, setQuizName] = useState('');
  const [description, setDescription] = useState('');
  const [timer, setTimer] = useState(5);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: '', image: null, imagePreview: null }
  ]);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('/groupq.jpg');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quizCreated, setQuizCreated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuizId, setEditQuizId] = useState(null);

  const questionRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const userData = JSON.parse(sessionStorage.getItem('user'));
  const token = sessionStorage.getItem('token');
  const isAdmin = userData?.role === 'Admin';

  useEffect(() => {
    if (location.state?.editQuizId) {
      setIsEditing(true);
      setEditQuizId(location.state.editQuizId);
      fetchQuizData(location.state.editQuizId);
    }
  }, [location.state]);

  const fetchQuizData = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load quiz');

      setQuizName(data.title || '');
      setDescription(data.description || '');
      setTimer(data.timeLimit || 5);
      setSelectedBranches(data.branches || []);
      setCoverPreview(data.image || '/groupq.jpg');
      setStartDate(data.startDate ? data.startDate.slice(0, 10) : '');
      setEndDate(data.endDate ? data.endDate.slice(0, 10) : '');

      const qs = (data.questions || []).map(q => ({
        question: q.questionText || '',
        options: q.options || ['', '', '', ''],
        correctAnswer: q.options[q.correctAnswer] || '',
        image: null,
        imagePreview: q.image || null,
      }));
      setQuestions(qs);
    } catch (err) {
      alert('Error loading quiz: ' + err.message);
      navigate('/admin-courses');
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(file);
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImage(null);
      setCoverPreview('/groupq.jpg');
    }
  };

  const adjustTimer = (action) => {
    if (action === 'increase' && timer < 60) setTimer(timer + 1);
    else if (action === 'decrease' && timer > 1) setTimer(timer - 1);
  };

  const handleBranchToggle = (branch) => {
    if (branch === 'ALL') {
      setSelectedBranches(prev => prev.length === BRANCHES.length ? [] : [...BRANCHES]);
    } else {
      setSelectedBranches(prev =>
        prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]
      );
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: '', image: null, imagePreview: null }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, e) => {
    const updated = [...questions];
    updated[index].question = e.target.value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, e) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = e.target.value;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, e) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = e.target.value;
    setQuestions(updated);
  };

  const handleOptionCountChange = (qIndex, e) => {
    const count = parseInt(e.target.value, 10);
    const updated = [...questions];
    let opts = updated[qIndex].options.slice(0, count);
    while (opts.length < count) opts.push('');
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const handleImageUpload = (qIndex, e) => {
    const file = e.target.files[0];
    const updated = [...questions];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updated[qIndex].image = file;
        updated[qIndex].imagePreview = reader.result;
        setQuestions(updated);
      };
      reader.readAsDataURL(file);
    } else {
      updated[qIndex].image = null;
      updated[qIndex].imagePreview = null;
      setQuestions(updated);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizName.trim()) return alert('Please enter a quiz name!');
if (isAdmin && selectedBranches.length === 0) {
  if (!window.confirm("No branch selected. Make this quiz available to ALL branches?")) return;
}
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return alert(`Question ${i + 1} is empty.`);
      if (q.options.some(opt => !opt.trim())) return alert(`All options must be filled for question ${i + 1}.`);
      if (!q.correctAnswer.trim()) return alert(`Correct answer not selected for question ${i + 1}.`);
    }

    try {
      const quizData = {
        title: quizName,
        description,
        timeLimit: timer,
        branches: isAdmin? selectedBranches.length > 0 ? selectedBranches: ['All']:[],
        image: typeof coverPreview === 'string' ? coverPreview : '/groupq.jpg',
        startDate,
        endDate,
        isPublished: false,
        questions: questions.map((q) => {
          const answerIndex = q.options.findIndex(opt => opt === q.correctAnswer);
          return {
            questionText: q.question,
            options: q.options,
            correctAnswer: answerIndex,
            image: q.imagePreview || null,
          };
        }),
      };
      console.log('Submitting quiz data:', quizData);  
      let res, data;
      if (isEditing && editQuizId) {
        res = await fetch(`${API_URL}/api/quizzes/${editQuizId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(quizData),
        });
        data = await res.json();
      } else {
        quizData.code = Math.random().toString(36).substring(2, 8).toUpperCase();
        res = await fetch(`${API_URL}/api/quizzes/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(quizData),
        });
        data = await res.json();
      }

if (res.ok) {
  setQuizCreated(true);
  setTimeout(() => {
    if (isEditing) {
      // Editing: go to Courses (student) or AdminCourses (admin)
      const path = isAdmin ? '/admin-courses' : '/courses';
      navigate(path, {
        state: {
          toast: 'Changes saved successfully!',
          refresh: true,
        },
      });
    } else {
      if (isAdmin) {
        // Admin just created quiz → go to AdminCourses
        navigate('/admin-courses', {
          state: {
            refresh: true,
            saveConfirmation: 'Quiz created successfully!',
          },
        });
      } else {
navigate('/courses', {
  state: {
    refresh: true,
    saveConfirmation: 'Quiz created successfully!',
    newQuizId: data?.quiz?._id || null,
    quizTitle: quizName,
    customQuestions: questions,
  },
});
      }
    }
  }, 1500);
} else {
        console.error('Quiz creation failed:', data);
        alert(data.message || 'Failed to save quiz.');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Something went wrong!\n' + (err.message || ''));
    }
  };

  const scrollToQuestion = (index) => {
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="create-quiz-container">
      {!quizCreated ? (
        <>
          <div className="quiz-name-section">
            <h2>{isEditing ? 'Edit Quiz Name' : 'Enter Quiz Name'}</h2>
            <input type="text" value={quizName} onChange={(e) => setQuizName(e.target.value)} placeholder="Enter quiz name" />
          </div>

          <div className="description-section">
            <h3>Quiz Description (Optional)</h3>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter quiz description" />
          </div>

          <div className="cover-image-section">
            <h3>Cover Image</h3>
            <input type="file" accept="image/*" onChange={handleCoverUpload} />
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                style={{
                  width: '300px',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginTop: '10px',
                  border: '1px solid #ccc',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              />
            )}
          </div>

          <div className="availability-section">
            <h3>Quiz Availability</h3>
            <label>
              Start Date: <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label style={{ marginLeft: '20px' }}>
              End Date: <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>

          <div className="timer-section">
            <h3>Set Timer</h3>
            <div className="timer-controls">
              <button onClick={() => adjustTimer('decrease')}>-</button>
              <span>{timer} minutes</span>
              <button onClick={() => adjustTimer('increase')}>+</button>
            </div>
          </div>

          {isAdmin && (
            <div className="branch-selection-section">
              <h3>Select Branches</h3>
              <div className="branch-options">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBranches.length === BRANCHES.length}
                    onChange={() => handleBranchToggle('ALL')}
                  />
                  All Branches
                </label>
                {BRANCHES.map(branch => (
                  <label key={branch}>
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch)}
                      onChange={() => handleBranchToggle(branch)}
                    />
                    {branch}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="questions-section">
            <h3>Questions</h3>
            {questions.map((q, index) => (
              <div key={index} className="question-card" ref={(el) => (questionRefs.current[index] = el)}>
                <h4>Question {index + 1}</h4>
                <input type="text" value={q.question} onChange={(e) => handleQuestionChange(index, e)} placeholder="Enter your question" />

                <div className="options-section">
                  <label>
                    Select Number of Options:
                    <select value={q.options.length} onChange={(e) => handleOptionCountChange(index, e)}>
                      {[2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>

                  {q.options.map((opt, oIndex) => (
                    <input key={oIndex} type="text" value={opt} onChange={(e) => handleOptionChange(index, oIndex, e)} placeholder={`Option ${oIndex + 1}`} />
                  ))}
                </div>

                <select value={q.correctAnswer} onChange={(e) => handleCorrectAnswerChange(index, e)}>
                  <option value="">Select Correct Answer</option>
                  {q.options.map((opt, oIndex) => (
                    <option key={oIndex} value={opt}>{opt}</option>
                  ))}
                </select>

                <div className="image-upload">
                  <label>Upload Image (optional):</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e)} />
                  {q.imagePreview && <img src={q.imagePreview} alt={`Q${index + 1}`} style={{ maxWidth: '200px', marginTop: '10px' }} />}
                </div>

                <button className="delete-question-btn" onClick={() => removeQuestion(index)}>Delete Question</button>
              </div>
            ))}
            <button onClick={addQuestion}>+ Add Question</button>
          </div>

          <button onClick={handleSubmitQuiz} className="submit-quiz-btn">{isEditing ? 'Save Changes' : 'Create Quiz'}</button>

          {/* Navigator */}
          <div className="question-navigator">
            <div className="navigator-list">
              {questions.map((_, index) => (
                <button key={index} onClick={() => scrollToQuestion(index)} className="navigator-item">{index + 1}</button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="quiz-created-message">
          <h2>{isEditing ? 'Changes Applied!' : 'Quiz Created!'}</h2>
          <p>{isEditing ? 'Your changes have been saved successfully.' : 'Your quiz has been successfully created and stored.'}</p>
        </div>
      )}
    </div>
  );
}

export default CreateQuiz;