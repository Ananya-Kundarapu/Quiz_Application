import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import '../styles/SignUp.css';

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [userExistsError, setUserExistsError] = useState('');

  const handleSignup = async () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setUserExistsError('');

    let hasError = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!passwordRegex.test(password)) {
      setPasswordError(
        'Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character'
      );
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await fetch('http://localhost:5000/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.exists) {
        setUserExistsError('User already exists, please log in');
        return;
      }

      localStorage.setItem('signupData', JSON.stringify({ email, password }));
      navigate('/registration', { state: { email, password } });

    } catch (err) {
      console.error('Signup error:', err);
      setUserExistsError('Server error. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src="/signupbg.webp" alt="Background" className="signup-bg" />
        <div className="signup-left-overlay">
          <img src="/nlo.png" alt="Logo" className="signup-logo" />
          <div className="quote">
            <p>
              The only way to <strong>do great work</strong> is to{' '}
              <strong>love what you do.</strong>
            </p>
            <span>- Steve Jobs</span>
          </div>
        </div>
      </div>

      <div className="signup-right">
        <h2 className="text-[#1935CA]">Sign Up</h2>

        {userExistsError && <p className="field-error">{userExistsError}</p>}

        <div className="input-wrapper">
          <FiMail className="input-icon" />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? 'input-error' : ''}
          />
          <div className="error-space">
            {emailError && <p className="field-error">{emailError}</p>}
          </div>
        </div>

        <div className="input-wrapper password-field">
          <FiLock className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? 'input-error' : ''}
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
          <div className="error-space">
            {passwordError && <p className="field-error">{passwordError}</p>}
          </div>
        </div>

        <div className="input-wrapper password-field">
          <FiLock className="input-icon" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={confirmPasswordError ? 'input-error' : ''}
          />
          <span
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </span>
          <div className="error-space">
            {confirmPasswordError && <p className="field-error">{confirmPasswordError}</p>}
          </div>
        </div>

        <button className="signup-btn" onClick={handleSignup}>Sign Up</button>

        <div className="divider">
          <hr /> <span>or</span> <hr />
        </div>

        <div className="social-buttons">
          <button className="social-btn">
            <img src="/google.jpg" alt="Google" />
            Google
          </button>
          <button className="social-btn">
            <img src="/facebook.jpg" alt="Facebook" />
            Facebook
          </button>
        </div>

        <p className="login-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Log In</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
