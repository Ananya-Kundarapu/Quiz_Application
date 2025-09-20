import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Quiz.css';
import '../styles/LeaderboardPopup.css';
import defaultQuestionsData from '../components/DefaultQuiz';
import { useAuth } from '../Context/AuthContext'; 
import axios from 'axios'; 
import { useMemo } from 'react'; 

function Quiz() {
const location = useLocation();
const navigate = useNavigate();
const { token, loading: authLoading } = useAuth();
const { quizId: quizIdFromParams } = useParams();
const [result, setResult] = useState(null);
const isCustomQuiz = location.state?.isCustom ?? false;
const joinMode = location.state?.joinMode;
const customQuestions = location.state?.questions;

const persistedQuizId = localStorage.getItem("quizId");
const persistedQuizCode = localStorage.getItem("quizCode");
const persistedCourse = localStorage.getItem("quizCourse");

const isDefaultQuiz = location.state?.isDefaultQuiz === true;

const quizId = isDefaultQuiz
  ? null
  : (quizIdFromParams || location.state?.quizId || persistedQuizId);

const quizCode = isDefaultQuiz
  ? null
  : (location.state?.code || persistedQuizCode);
if (isDefaultQuiz && location.state?.course) {
  localStorage.setItem("quizCourse", location.state.course);
}

const course = location.state?.course || persistedCourse || "General";
const currentQKey = `currentQ_${quizId || quizCode || course}`;
const answersKey = `answers_${quizId || quizCode || course}`;

useEffect(() => {
  if (!isDefaultQuiz) {
    if (quizId) localStorage.setItem("quizId", quizId);
    if (quizCode) localStorage.setItem("quizCode", quizCode);
    if (course) localStorage.setItem("quizCourse", course);
  } else if (isDefaultQuiz && course) {
    localStorage.setItem("quizCourse", course);
    localStorage.removeItem("quizId");
    localStorage.removeItem("quizCode");
  }
}, [isDefaultQuiz, quizId, quizCode, course]);

let idKey;
if (isDefaultQuiz) {
  idKey = `default_${course}`;
} else if (isCustomQuiz) {
  idKey = `custom_${quizCode || quizId}`;
} else {
  idKey = `live_${quizId || quizCode}`;
}

useEffect(() => {
  if (!isDefaultQuiz) {
    if (location.state?.quizId) localStorage.setItem("quizId", location.state.quizId);
    if (location.state?.code) localStorage.setItem("quizCode", location.state.code);
    if (location.state?.course) localStorage.setItem("quizCourse", location.state.course);
  }
}, []);
useEffect(() => {
    if (!token || authLoading) return;
  if (isDefaultQuiz) {
    console.log("🧹 Clearing stale quizId/quizCode for default quiz");
    localStorage.removeItem("quizId");
    localStorage.removeItem("quizCode");
  }
}, [isDefaultQuiz]);
useEffect(() => {
  console.log("🌐 [DEBUG] Quiz component loaded - location.state:", location.state, "token:", token, "authLoading:", authLoading);
}, []);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
const [currentQuestion, setCurrentQuestion] = useState(() =>
  isDefaultQuiz ? 0 : parseInt(localStorage.getItem(currentQKey), 10) || 0
);

const [answers, setAnswers] = useState(() =>
  isDefaultQuiz ? [] : JSON.parse(localStorage.getItem(answersKey) || '[]')
);

const [selectedOption, setSelectedOption] = useState(null);
const [startTime, setStartTime] = useState(Date.now());

const [showConfirmation, setShowConfirmation] = useState(false);
const [showCongratulations, setShowCongratulations] = useState(false);
const [showLeaderboard, setShowLeaderboard] = useState(false);
const [quizTitle, setQuizTitle] = useState('');
const [badgesEarned, setBadgesEarned] = useState([]);

useEffect(() => {
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = "⚠️ If you refresh, you may lose your progress.";
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, []);
useEffect(() => {
  const handlePopState = (e) => {
  const ok = window.confirm("⚠️ Do you want to exit the quiz? Your progress will be lost.");
  if (!ok) {
   window.history.pushState({ page: "quiz" }, "", window.location.href);
  } else {
    navigate("/courses", { replace: true });
  }
};

  window.history.pushState({ page: "quiz" }, "", window.location.href);
  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, [navigate, currentQKey, answersKey]);

const memoizedCurrentQKey = `currentQ_${quizId || quizCode || course}`;
const memoizedAnswersKey = `answers_${quizId || quizCode || course}`;
useEffect(() => {
  if (!isDefaultQuiz) {
    localStorage.setItem(memoizedAnswersKey, JSON.stringify(answers));
    localStorage.setItem(memoizedCurrentQKey, currentQuestion);
  }
}, [answers, currentQuestion, isDefaultQuiz]); 

  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
useEffect(() => {
  console.log('isCustomQuiz:', isCustomQuiz);
  console.log('quizCode:', quizCode);
  console.log('course:', course);
  console.log('customQuestions:', customQuestions);
}, [isCustomQuiz, quizCode, course, customQuestions]);

const [fetchedQuestions, setFetchedQuestions] = useState([]);

const defaultQuestions = defaultQuestionsData[course] || [
  { questionText: "Default question?", options: ["Yes", "No"], correctAnswer: "Yes" },
];

useEffect(() => {
  console.log("🧪 activeQuestions selected:",
    customQuestions?.length > 0 ? 'customQuestions' :
    fetchedQuestions.length > 0 ? 'fetchedQuestions' : 'defaultQuestions'
  );
}, [customQuestions, fetchedQuestions, defaultQuestions]);

const activeQuestions = useMemo(() => {
  if (customQuestions?.length > 0) return customQuestions;
  if (fetchedQuestions.length > 0) return fetchedQuestions;
  return defaultQuestions;
}, [customQuestions, fetchedQuestions, defaultQuestions]);

if (isDefaultQuiz && !persistedCourse && location.state?.course) {
  localStorage.setItem("quizCourse", location.state.course);
}

  if (!activeQuestions || activeQuestions.length === 0) {
    console.log("🚫 [DEBUG] Early return - activeQuestions:", activeQuestions, "defaultQuestions:", defaultQuestions, "fetchedQuestions:", fetchedQuestions);
    return (
      <div className="quiz-loading-screen">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz">
          <h2>Loading quiz...</h2>
          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

useEffect(() => {
const initTimer = (minutes) => {
  const totalSeconds = minutes * 60;
  const now = Date.now();
  setStartTime(now);
  setTimeLeft(totalSeconds);
};

  const fetchLiveQuiz = async () => {
    if (!token || authLoading) return;
    try {
      const endpoint = quizCode
        ? `http://localhost:5000/api/quizzes/code/${quizCode}`
        : `http://localhost:5000/api/quizzes/${quizId}`;

      console.log("🌐 Fetching quiz from:", endpoint);

      const res = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch quiz", res.status);
        return;
      }

      const data = await res.json();
      const quiz = data.quiz || data;
      setQuizData(quiz);

      if (Array.isArray(quiz.questions)) {
const normalized = quiz.questions.map((q) => ({
  _id: q._id, 
  questionText: q.questionText || q.question || 'Untitled',
  options: Array.isArray(q.options) ? q.options : [],
  correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : -1,
}));

        setFetchedQuestions(normalized);
        setQuizTitle(quiz.title || '');
      }

      initTimer(Number(quiz.timeLimit) || 15);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

if (isDefaultQuiz) {
  console.log("⚡ Using DEFAULT quiz:", course);
  setFetchedQuestions([]); 
  setQuizTitle(course);
  initTimer(15);
} else if (isCustomQuiz) {
  console.log("⚡ Using CUSTOM quiz");
  setFetchedQuestions(customQuestions || []);
  initTimer(15); 
} else if (quizId || quizCode) {
  console.log("⚡ Using LIVE quiz, id/code:", quizId, quizCode);
  fetchLiveQuiz();
}
}, [isDefaultQuiz, isCustomQuiz, quizId, quizCode, token, authLoading]);

useEffect(() => {
  if (showCongratulations || showLeaderboard || timeLeft === null) return;

  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev === null) return prev;
      if (prev <= 1) {
        clearInterval(timer);
        handleSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, showCongratulations, showLeaderboard]);

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      if (currentQuestion < activeQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(answers[currentQuestion + 1] || null);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentQuestion > 0) {
        setCurrentQuestion(prev => prev - 1);
        setSelectedOption(answers[currentQuestion - 1] || null);
      }
    } else if (e.key >= '1' && e.key <= String(activeQuestions[currentQuestion].options.length)) {
      const idx = Number(e.key) - 1;
      const option = activeQuestions[currentQuestion].options[idx];
      handleAnswer(option);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [currentQuestion, answers, activeQuestions]);

  const handleAnswer = (answer) => {
    setSelectedOption(answer);
    const updated = [...answers];
    updated[currentQuestion] = answer;
    setAnswers(updated);
  };

const handleNext = async () => {
  if (currentQuestion < activeQuestions.length - 1) {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedOption(answers[currentQuestion + 1] || null);
  } else {
    setShowConfirmation(true);
  }
};

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
    }
  };
  const handleClear = (index) => {
  setSelectedOption(null);
  setAnswers((prev) => {
    const updated = [...prev];
    updated[index] = null;
    return updated;
  });
};

  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
    setSelectedOption(answers[index] || null);
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

const handleSubmit = async () => {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      await (document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.());
    }
  } catch (error) {
    console.error('Failed to exit full-screen mode:', error);
  }

const duration = Math.floor((Date.now() - startTime) / 1000);

if (!quizId) {
  const score = answers.reduce((acc, ans, idx) => {
    const correct = activeQuestions[idx].correctAnswer;
    if (typeof correct === "number") {
      const selectedIndex = activeQuestions[idx].options.indexOf(ans);
      return selectedIndex === correct ? acc + 1 : acc;
    }
    if (typeof correct === "string") {
      return ans === correct ? acc + 1 : acc;
    }
    return acc;
  }, 0);

  const percentage = (score / activeQuestions.length) * 100;
  const badges = [];
  if (percentage === 100) badges.push('winner');
  if (percentage >= 80) badges.push('powerPlayer');
  if ((Date.now() - startTime) / 1000 / activeQuestions.length < 30) badges.push('speedster');
  if (percentage >= 30 && percentage < 50) badges.push('lucky');

const resultObj = {
  score,
  total: activeQuestions.length,
  duration,
  startTime,
  submittedAt: Date.now(),
  badges, 
  questions: activeQuestions.map((q, idx) => ({
    questionText: q.questionText || q.question || 'Untitled',
    options: q.options,
    correctAnswer: typeof q.correctAnswer === "number" ? q.options[q.correctAnswer] : q.correctAnswer,
    yourAnswer: answers[idx] || null,
    isCorrect: answers[idx] === (typeof q.correctAnswer === "number" ? q.options[q.correctAnswer] : q.correctAnswer),
  }))
};

  setResult(resultObj);
  setBadgesEarned(badges); // ✅ Add this

  if (token) {
    axios.post(`http://localhost:5000/api/results/custom`, {
      quizId: quizId || null, 
      course,
      answers: activeQuestions.map((q, idx) => {
        const selectedIndex = q.options.indexOf(answers[idx]);
        return {
          questionText: q.questionText || q.question,
          correctAnswer: typeof q.correctAnswer === "number" ? q.options[q.correctAnswer] : q.correctAnswer,
          selectedAnswer: answers[idx] || null,
          isCorrect: typeof q.correctAnswer === "number"
            ? selectedIndex === q.correctAnswer
            : answers[idx] === q.correctAnswer
        };
      }),
      score,
      total: activeQuestions.length,
      duration,
      startedAt: new Date(startTime),
      submittedAt: new Date(),
      badges, // ✅ Add badges here too
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => console.log("✅ Custom/default quiz saved:", res.data))
    .catch(err => console.error("❌ Failed to save custom/default quiz:", err));
  }

  setShowCongratulations(true);
  return;
}
  try {
const payload = {
  answers: activeQuestions.map((q, idx) => {
    const selectedIndex = q.options.indexOf(answers[idx]);
    return {
      questionId: q._id,
      selectedOption: selectedIndex >= 0 ? selectedIndex : null,
    };
  }),
  duration,
  startTime,
  submittedAt: new Date(),
};
const res = await axios.post(
  `http://localhost:5000/api/results/${quizData._id}/submit`,
  payload,
  { headers: { Authorization: `Bearer ${token}` } }
);

const serverResult = res.data.result;
const resultObj = {
  score: serverResult.score,
  total: activeQuestions.length,
  duration,
  startTime,
  submittedAt: new Date(),
  questions: activeQuestions.map((q, idx) => ({
    questionText: q.questionText || q.question || 'Untitled',
    options: q.options,
    correctAnswer: typeof q.correctAnswer === "number" ? q.options[q.correctAnswer] : q.correctAnswer,
    yourAnswer: answers[idx] || null,
    isCorrect: answers[idx] === (typeof q.correctAnswer === "number" ? q.options[q.correctAnswer] : q.correctAnswer),
  }))
};

setResult(resultObj);
setBadgesEarned(serverResult.badges || []);
setShowCongratulations(true);
  } catch (err) {
    console.error("❌ Quiz submission failed:", err.response?.data || err.message);
  }
};
const handleReviewQuiz = () => {
  if (!result) return;

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

navigate('/quiz-history', {
  state: {
    reviewQuiz: true,
    quizEntry: {
      course,
      answers: result.questions.map((q, i) => ({
        questionText: q.questionText,
        selectedAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[i] === q.correctAnswer
      })),
      badges: result.badges || badgesEarned,
      duration: result.duration,
      startedAt: result.startTime,
      submittedAt: result.submittedAt
    }
  }
});
};

  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;
const totalTime = (quizData?.timeLimit ? Number(quizData.timeLimit) : 15) * 60;
const progress = timeLeft !== null ? (timeLeft / totalTime) * 360 : 0;


  if (showLeaderboard) {
    const leaderboard = JSON.parse(localStorage.getItem(`leaderboard_${quizCode}`) || '[]');
    return (
      <div className="confirmation leaderboard-popup">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz leaderboard-frame">
          <h2>Leaderboard</h2>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <span>Name</span>
              <span>Score</span>
              <span>Time</span>
            </div>
            {leaderboard.map((entry, index) => (
              <div className="leaderboard-row" key={index}>
                <span>{entry.name}</span>
                <span>{entry.score}</span>
                <span>{entry.time}</span>
              </div>
            ))}
          </div>
          <button className="go-home-button" onClick={() => navigate('/profile')}>Go Home</button>
        </div>
      </div>
    );
  }
if (showCongratulations && result) {
  const percentage = Math.round((result.score / result.total) * 100);
  const passed = percentage >= 30; // ✅ 30% pass mark

  return (
    <div className="confirmation">
      <img src="/qlo.jpg" className="logo-top-left" />
      <div className="quiz">
        {passed ? (
          <h2>Congratulations, you have passed!</h2>
        ) : (
          <h2>Better luck next time!</h2>
        )}

<p>You scored {percentage}%</p>

{badgesEarned.length > 0 && (
  <div className="badges-earned">
    <h3>You earned:</h3>
    <div className="badges-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {badgesEarned.map((badgeId) => {
        const badge = badgeData.find(b => b.id === badgeId);
        if (!badge) return null;
        return (
          <div key={badge.id} className="badge-item" title={badge.desc} style={{ textAlign: 'center' }}>
            <img src={badge.src} alt={badge.title} style={{ width: '60px', height: '60px' }} />
            <p>{badge.title}</p>
          </div>
        );
      })}
    </div>
  </div>
)}

<div className="confirmation-buttons">
  <button className="go-home-button" onClick={() => navigate('/profile')}>Go Home</button>
  <button onClick={handleReviewQuiz}>Review Quiz</button>
</div>
      </div>
    </div>
  );
}

  if (showConfirmation) {
    return (
      <div className="confirmation">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz">
          <img src="/qm.jpg" className="qm-icon" />
          <h2>Are you sure you want to submit Quiz?</h2>
          <p><strong>⏳ Time Remaining:</strong> {formatTime(timeLeft)}</p>
          <p><strong>❗ Unanswered Questions:</strong> {activeQuestions.length - answers.filter(Boolean).length}</p>
          <div className="confirmation-buttons">
            <button onClick={() => setShowConfirmation(false)}>No</button>
            <button className="yes-button" onClick={handleSubmit}>Yes</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="quiz-page">
      <img src="/qlo.jpg" className="logo-top-left" width="220px" height="68px" />
      <h2 style={{ color: '#FFFFFF' }}>{quizTitle || course}</h2>
      <div className="quiz-container">
        <div className="quiz">
          <div className="quiz-header">
            {currentQuestion > 0 && <button onClick={handlePrevious} className="previous-button">Previous</button>}
            <p className="question-number">{currentQuestion + 1}/{activeQuestions.length}</p>
            <div className="timer-container">
              <div className="timer-circle" style={{ background: `conic-gradient(#1935CA ${progress}deg, #e6e6e6 ${progress}deg)` }}>
                <p className="timer">{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</p>
              </div>
            </div>
          </div>
          <div className="question">
            <h3>Question {currentQuestion + 1}</h3>
<p>
  {activeQuestions[currentQuestion]?.questionText ||
   activeQuestions[currentQuestion]?.question ||
   '⚠️ Question not loaded'}
</p>
<div className="options">
  {(activeQuestions[currentQuestion]?.options || []).map((option, idx) => (
    <button
      key={idx}
      className={selectedOption === option ? 'selected' : ''}
      onClick={() => handleAnswer(option)}
    >
      {option}
    </button>
  ))}

  {(!activeQuestions[currentQuestion]?.options ||
    activeQuestions[currentQuestion]?.options.length === 0) && (
    <p className="no-options">⚠️ No options available for this question</p>
  )}
</div>

           <div className="action-buttons">
  <button className="clear-button" onClick={() => handleClear(currentQuestion)}>Clear</button>
  <button className="next-btn" onClick={handleNext}>
    {currentQuestion === activeQuestions.length - 1 ? 'Submit' : 'Next'}
  </button>
</div>
          </div>
        </div>
        <div className="question-navigator">
          {activeQuestions.map((_, i) => (
            <div
              key={i}
className={`navigator-item 
  ${i === currentQuestion ? 'active' : answers[i] !== undefined && answers[i] !== null ? 'answered' : ''}`}
              onClick={() => handleQuestionSelect(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Quiz;