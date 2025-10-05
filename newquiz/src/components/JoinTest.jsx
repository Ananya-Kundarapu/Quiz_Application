import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKeyboard } from 'react-icons/fa';
import '../styles/JoinTest.css';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

function JoinTest() {
  const navigate = useNavigate();
  const [testCode, setTestCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!testCode.trim()) {
      setError('Please enter a test code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to join a test');
      }

      const response = await fetch(`${API_URL}/api/quizzes/code/${testCode.trim()}`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid test code');
      }

      navigate(`/quiz/${encodeURIComponent(data.name)}`, {
        state: {
          isCustom: true,
          joinMode: true,
          code: data.code,
          questions: data.questions,
          timer: data.timer,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="join-test-container">
      <div className="join-test-image-section">
        <img src="/test.png" alt="Join Test Illustration" className="full-page-image" />
      </div>
      <div className="join-test-content">
        <div className="join-test-header">
          <div className="join-test-icon">
            <FaKeyboard />
          </div>
          <h1>Join a Test</h1>
          <p className="subtitle">Enter the test code provided by your instructor</p>
        </div>

        <form onSubmit={handleSubmit} className="join-test-form" noValidate>
          <div className="form-group">
            <label htmlFor="testCode">Test Code</label>
            <div className="input-container">
              <input
                type="text"
                id="testCode"
                value={testCode}
                onChange={(e) => {
                  setTestCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter test code (e.g., ABC123)"
                className={error ? 'error' : ''}
                autoFocus
                autoComplete="off"
                maxLength={10}
              />
              {isLoading && <div className="loading-spinner" aria-label="Loading"></div>}
            </div>
            {error && <p className="error-message" role="alert">{error}</p>}
          </div>

          <button type="submit" className="join-button" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Test'}
          </button>
        </form>

        <div className="join-test-footer">
          <p>
            Need help? <a href="#">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default JoinTest;
