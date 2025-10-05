import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import '../styles/Login.css';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setEmailError('');
    setPasswordError('');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let hasError = false;

    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        if (res.status === 404) {
          setError('User does not exist. Please sign up.');
        } else if (res.status === 401) {
          setError('Invalid credentials. Please check your email and password.');
        } else {
          setError(data.message || 'Login failed. Try again later.');
        }
        return;
      }

      const { user, token } = data;
      login(user, token);
localStorage.setItem('token', token);

if (remember) {
  localStorage.setItem('rememberToken', token);
}
      if (user.role.toLowerCase() === 'admin') {
        navigate('/admin-profile');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/nlo.png" alt="logo" className="login-logo" />
        <h2>Knowledge is power, but the ability to test it is where the fun begins!</h2>
        <p>Welcome back! Please login to your account.</p>

        {error && <p className="error-message">{error}</p>}

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={emailError ? 'input-error' : ''}
        />
        {emailError && <p className="field-error">{emailError}</p>}

        <label>Password:</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? 'input-error' : ''}
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FiEyeOff size={20} color="#777" /> : <FiEye size={20} color="#777" />}
          </span>
        </div>
        {passwordError && <p className="field-error">{passwordError}</p>}

        <div className="login-options stacked">
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <span className="forgot" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
            Forgot password?
          </span>
        </div>

        <div className="actions">
          <button className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <p className="switch-auth">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
      </div>

      <div className="login-right">
        <img src="/cycle.jpeg" alt="Login Illustration" />
      </div>
    </div>
  );
}

export default Login;
