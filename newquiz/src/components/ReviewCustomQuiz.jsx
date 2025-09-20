import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/QuizHistory.css'; // Reusing same styles

function ReviewCustomQuiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizName, questions, participantData } = location.state || {};

  if (!questions || !participantData) {
    return <p style={{ padding: '40px' }}>Invalid review data.</p>;
  }

  return (
    <div className="main-content">
      <div className="quiz-review-card">
        <button
          className="back-button"
          style={{ position: 'absolute', top: '20px', left: '20px' }}
          onClick={() => navigate('/courses')}
        >
          ← Back
        </button>

        <h2 style={{ marginTop: '60px' }}>Quiz Review - {quizName}</h2>
        <p>Participant: {participantData.name}</p>
        <p>Score: {participantData.score}</p>
        <p>Time Taken: {participantData.timeTaken}</p>

        <p>Badges Earned:</p>
        <div className="badges-earned">
          {['b1.png', 'b2.png', 'b3.png'].map((badge, index) => (
            <img key={index} src={`/${badge}`} alt={`Badge ${index + 1}`} className="achievement-badge" />
          ))}
        </div>

        {questions.map((q, index) => (
          <div key={index} className="review-question">
            <h3>Question {index + 1}</h3>
            <p>{q.question}</p>
            <p>
              Participant Answer:{' '}
              <span className={participantData.answers[index] === q.correctAnswer ? 'correct' : 'wrong'}>
                {participantData.answers[index] || 'No Answer'}
              </span>
            </p>
            <p>
              Correct Answer: <span className="correct">{q.correctAnswer}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewCustomQuiz;
