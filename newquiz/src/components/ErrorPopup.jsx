import '../styles/ErrorPopup.css';
function ErrorPopup({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="error-overlay" onClick={onClose}>
      <div className="error-modal" onClick={(e) => e.stopPropagation()}>
        <button className="error-close" onClick={onClose}>×</button>
        <div className="error-text">
          <h2>Error fetching data for this visual</h2>
          <p>Couldn't retrieve the data for this visual. Please try again later.</p>
          <p className="error-secondary">
            Please try again later or contact support. If you contact support, please provide these details.
          </p>
          <a href="#" className="error-link">Contact support</a>
        </div>
        <div className="error-image">
          <img src="/err.jpg" alt="Error Visual" />
        </div>
      </div>
    </div>
  );
}
export default ErrorPopup;