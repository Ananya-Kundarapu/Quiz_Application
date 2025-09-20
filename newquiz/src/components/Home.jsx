import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext'; 
import Header from './Header'; 
import Footer from './Footer'; 
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const aboutRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home">
      <Header />
      <div className="home-hero">
        <div className="home-hero-content">
          <div className="home-text">
            <h1 className={`hero-text ${scrolled ? 'hidden' : ''}`}>Ready to Test Your Knowledge?</h1>
            <p className={`hero-text ${scrolled ? 'hidden' : ''}`}>
              Challenge yourself with quizzes across various topics. Pick a quiz, test your knowledge, and learn something new!
            </p>
            <button onClick={() => navigate('/login')} className={`hero-text ${scrolled ? 'hidden' : ''}`}>
              Let's Begin <span className="arrow">›</span>
            </button>
          </div>

          <div className="home-image">
            <img src="/firstpg.png" alt="Quiz Illustration" />
          </div>
        </div>

        <div className="scroll-hint" onClick={scrollToAbout}>↓ Scroll to Learn More</div>
      </div>

      <div className="about-us" ref={aboutRef}>
        <h2 className="slide-in-top">About Us</h2>
        <div className="about-content">
          <div className="about-left">
            {[ 
              { img: '/a.png', text: 'Take timed quizzes and challenge yourself with each attempt.' },
              { img: '/b.png', text: 'Submit answers and get your scores instantly—no waiting!' },
              { img: '/c.png', text: 'Review your past quizzes and track your improvement over time.' },
              { img: '/d.png', text: 'Designed as a teaching tool for developers and learners alike.' },
            ].map((item, idx) => (
              <div className={`feature-card slide-in-left delay-${idx + 1}`} key={idx}>
                <img src={item.img} alt={`Feature ${idx + 1}`} />
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="about-right slide-in-right">
            <img src="/aboutimg.png" alt="About Quizify" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;