import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminProfile.css';
import { useAuth } from '../Context/AuthContext';

function AdminProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [totalUsers, setTotalUsers] = useState(null);
  const [totalQuizzes, setTotalQuizzes] = useState(null);
  const [userError, setUserError] = useState(null);
  const [userLoadError, setUserLoadError] = useState(null);
  const [quizLoadError, setQuizLoadError] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const backendBase = 'http://localhost:5000';
  const isUploadedPic = user?.profilePic?.startsWith('/uploads/');
  const isBlob = user?.profilePic?.startsWith('blob:');
  const profileImage = isUploadedPic
    ? `${backendBase}${user.profilePic}`
    : isBlob || !user?.profilePic
    ? '/profile.png'
    : user.profilePic;

  useEffect(() => {
    if (!user) {
      setUserError('No user data found. Please log in.');
      return;
    }

const headers = user?.token
  ? { Authorization: `Bearer ${user.token}` }
  : {};


    fetch('/api/admin/total-users', { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTotalUsers(data.count);
        setLoadingUsers(false);
      })
      .catch(err => {
        setUserLoadError('Failed to fetch total users.');
        console.error('Fetch total-users error:', err);
        setTotalUsers(0);
        setLoadingUsers(false);
      });

      fetch(`${backendBase}/api/admin/total-quizzes`, { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTotalQuizzes(data.count);
        setLoadingQuizzes(false);
      })
      .catch(err => {
        setQuizLoadError('Failed to fetch total quizzes.');
        console.error('Fetch total-quizzes error:', err);
        setTotalQuizzes(0);
        setLoadingQuizzes(false);
      });
  }, [user]);

  const handleUsersClick = () => {
    navigate('/admin-settings');
  };

  const handleCoursesClick = () => {
    navigate('/admin-courses');
  };

  if (!user && userError) {
    return <div className="error-message">{userError}</div>;
  }

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="admin-profile">
      <div className="admin-header">
        <img
          src={profileImage}
          alt="Profile"
          className="admin-profile-image"
        />
        <div className="admin-profile-info">
          <h1 style={{ color: '#1935CA' }}>{user.fName} {user.lName}</h1>
          <p>Manage Quizzes and Users with Precision!</p>
          <div className="progress-bar" style={{ backgroundColor: '#ddd' }}>
            <div
              className="progress"
              style={{ width: '100%', backgroundColor: '#1935CA' }}
            />
          </div>
        </div>
      </div>

      <div className="row-widgets">
        <div className="users-card half-width" onClick={handleUsersClick}>
          <h3>Total Users (Admins + Students)</h3>
          {loadingUsers ? (
            <p>Loading...</p>
          ) : userLoadError ? (
            <p className="error-text">{userLoadError}</p>
          ) : (
            <p>{totalUsers}</p>
          )}
        </div>

        <div className="custom-quiz-card half-width">
          <h3>Create Quiz</h3>
          <p>Design and share new quizzes for users!</p>
          <button onClick={() => navigate('/admin/create-quiz')}>
            + Create Quiz
          </button>
        </div>
      </div>

      <div className="quizzes-card">
        <h3>Total Quizzes Created</h3>
        {loadingQuizzes ? (
          <p>Loading...</p>
        ) : quizLoadError ? (
          <p className="error-text">{quizLoadError}</p>
        ) : (
          <>
            <p>{totalQuizzes}</p>
            <button
              onClick={handleCoursesClick}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#1935CA',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              View Courses
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;