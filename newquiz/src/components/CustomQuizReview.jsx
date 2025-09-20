import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/QuizHistory.css';
function CustomQuizReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { course, questions } = location.state || {};
  if (!course || !questions) {
    return (
      <div style={{ padding: '40px'}}>
        <h2>Invalid or missing review data.</h2>
      </div>
    );
  }
  return (
    <div className="main-content">
      <div
        className="quiz-review-card"
        style={{
          position: 'relative',
          paddingTop: '60px',
          paddingBottom: '30px',
        }}
      >
        <button
          className="back-button"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: '#1935CA',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontFamily: 'Poppins',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/courses', { state: { reopenPopupFor: course } })}
        >
          ← Back
        </button>
        <h2 style={{ marginTop: '20px' }}>Quiz Questions: {course}</h2>
        <p style={{ marginBottom: '20px', fontStyle: 'italic' }}>
          Below are the questions and correct answers created by the quiz author.
        </p>

        {questions.map((q, index) => (
          <div key={index} className="review-question">
            <h3>Question {index + 1}</h3>
            <p>{q.question}</p>
            <p>
              <strong>Correct Answer:</strong>{' '}
              <span className="correct">{q.correctAnswer}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default CustomQuizReview;