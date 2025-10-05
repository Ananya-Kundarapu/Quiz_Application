import React, { useState,useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';

import {
  FaUser,
  FaBookOpen,
  FaClock,
  FaCog,
  FaSignOutAlt,
  FaComments,
  FaUsersCog,
} from 'react-icons/fa';

import Home from './components/Home.jsx';
import Courses from './components/Courses.jsx';
import AdminCourses from './components/AdminCourses.jsx';
import Profile from './components/Profile.jsx';
import Quiz from './components/Quiz.jsx';
import QuizHistory from './components/QuizHistory.jsx';
import Settings from './components/Settings.jsx';
import Login from './components/Login.jsx';
import Signup from './components/SignUp.jsx';
import Registration from './components/Registration.jsx';
import CreateQuiz from './components/CreateQuiz.jsx';
import JoinTest from './components/JoinTest.jsx';
import CustomQuizReview from './components/CustomQuizReview.jsx';
import ReviewCustomQuiz from './components/ReviewCustomQuiz.jsx';
import AdminProfile from './components/AdminProfile.jsx';
import AdminSettings from './components/AdminSettings.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import { useAuth } from './Context/AuthContext'; 
import './index.css';
import './App.css';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
useEffect(() => {
  if (location.state?.toast) {
    setToastMessage(location.state.toast);
    setTimeout(() => setToastMessage(null), 2000);
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location]);
  const { user, logout, loading } = useAuth(); 

  const isHomePage = location.pathname === '/';
  const isQuizPage = /^\/quiz\/[^/]+$/.test(location.pathname);
  const isAuthPage = ['/login', '/signup', '/registration'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');
  const userRole = user?.role || 'Student';
const handleLogout = async () => {
  setLoggingOut(true); 

  try {
     await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
      credentials: 'include',
    });

    setTimeout(() => {
      logout();
      setLoggingOut(false);
      navigate('/', { replace: true }); 
    }, 1500);
  } catch (error) {
    console.error('Logout failed:', error);
    setLoggingOut(false);
  }
};


  const ProtectedStudentRoute = ({ children }) => {
    if (loading) return null;
    if (!user) {
      return <Navigate to="/signup" state={{ message: 'Please sign up to continue.' }} replace />;
    }
    return children;
  };

  const ProtectedAdminRoute = ({ children }) => {
    if (loading) return null;
    if (!user || user.role !== 'Admin') {
      return <Navigate to="/signup" state={{ message: 'Please sign up to continue.' }} replace />;
    }
    return children;
  };
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/signup" state={{ message: 'Please sign up to continue.' }} replace />;
  return children;
};

if (loading) return null;

  return (
    <div className="app-container">
      {loggingOut && <div className="logout-notification">Logging out...</div>}
      {toastMessage && (
      <div className="toast-notification">{toastMessage}</div>
      )}

      {!isHomePage && !isQuizPage && !isAuthPage && (
        <nav className="sidebar">
          <div
            className="logo-container"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <img src="/nlo.png" alt="Quizify Logo" className="logo" />
          </div>

          <ul>
            <li className={location.pathname === (userRole === 'Admin' ? '/admin-profile' : '/profile') ? 'active' : ''}>
              <Link to={userRole === 'Admin' ? '/admin-profile' : '/profile'}>
                <FaUser className="icon" /> Profile
              </Link>
            </li>

            <li className={location.pathname === (userRole === 'Admin' ? '/admin-courses' : '/courses') ? 'active' : ''}>
              <Link to={userRole === 'Admin' ? '/admin-courses' : '/courses'}>
                <FaBookOpen className="icon" /> Courses
              </Link>
            </li>

            {userRole === 'Admin' ? (
              <li className={location.pathname === '/admin-settings' ? 'active' : ''}>
                <Link to="/admin-settings">
                  <FaUsersCog className="icon" /> Permissions
                </Link>
              </li>
            ) : (
              <li className={location.pathname === '/quiz-history' ? 'active' : ''}>
                <Link to="/quiz-history">
                  <FaClock className="icon" /> Quiz History
                </Link>
              </li>
            )}

            <li className={location.pathname === '/settings' ? 'active' : ''}>
              <Link to="/settings">
                <FaCog className="icon" /> Settings
              </Link>
            </li>
          </ul>

          <div className="support-logout">
            <div className="support" style={{ position: 'relative' }}>
              <img src="/supportrembg.png" alt="Support" className="support-image" />
              <button className="support-start-button">
                <FaComments style={{ marginRight: '6px' }} />
                Chat
              </button>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt className="icon" /> Log Out
            </button>
          </div>
        </nav>
      )}

      <div className={isHomePage || isQuizPage || isAuthPage || isAdminPage ? 'full-content' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/join-test" element={<JoinTest />} />
          <Route path="/profile" element={
            <ProtectedStudentRoute>
                  <Profile />
            </ProtectedStudentRoute>
          } />
<Route path="/leaderboard/:quizIdOrCustom/:quizCodeUrl?" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />          <Route path="/courses" element={<ProtectedStudentRoute><Courses /></ProtectedStudentRoute>} />
          <Route path="/quiz/:quizId" element={<ProtectedStudentRoute><Quiz /></ProtectedStudentRoute>} />
          <Route path="/quiz-history" element={<ProtectedStudentRoute><QuizHistory /></ProtectedStudentRoute>} />
          <Route path="/settings" element={<ProtectedStudentRoute><Settings /></ProtectedStudentRoute>} />
          <Route path="/create-quiz" element={<ProtectedStudentRoute><CreateQuiz /></ProtectedStudentRoute>} />
          <Route path="/custom-quiz-review" element={<ProtectedStudentRoute><CustomQuizReview /></ProtectedStudentRoute>} />
          <Route path="/review-custom" element={<ProtectedStudentRoute><ReviewCustomQuiz /></ProtectedStudentRoute>} />
          <Route path="/privacy-policy" element={<ProtectedStudentRoute><PrivacyPolicy /></ProtectedStudentRoute>} />
          {/* Admin routes */}
          <Route path="/admin-profile" element={<ProtectedAdminRoute><AdminProfile /></ProtectedAdminRoute>} />
          <Route path="/admin-courses" element={<ProtectedAdminRoute><AdminCourses /></ProtectedAdminRoute>} />
          <Route path="/admin-settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
          <Route path="/admin/create-quiz" element={<ProtectedAdminRoute><CreateQuiz /></ProtectedAdminRoute>} />
<Route path="/admin/leaderboard/:quizIdOrCustom/:quizCodeUrl?" element={<ProtectedAdminRoute><Leaderboard /></ProtectedAdminRoute>} />        </Routes>
      </div>
    </div>
  );
}

export default App;