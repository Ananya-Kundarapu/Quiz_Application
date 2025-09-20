import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import '../styles/Footer.css';

function Footer() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const protectedNavigate = (path) => {
    if (!user) {
      navigate('/signup', { state: { message: 'Please sign up to continue.' } });
    } else {
      navigate(path);
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Quick Links</h3>
          <span onClick={() => protectedNavigate(isAdmin ? '/admin-profile' : '/profile')}>Profile</span>
          <span onClick={() => protectedNavigate(isAdmin ? '/admin-courses' : '/courses')}>Courses</span>
          <span onClick={() => protectedNavigate(isAdmin ? '/admin-settings' : '/quiz-history')}>
            {isAdmin ? 'Permissions' : 'Quiz History'}
          </span>
          <span onClick={() => protectedNavigate('/settings')}>Settings</span>
        </div>

        <div className="footer-section">
          <h3>Account</h3>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>

        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Quizify. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
