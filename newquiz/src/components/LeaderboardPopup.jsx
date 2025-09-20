import React, { useState, useEffect } from 'react';
import '../styles/LeaderboardPopup.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

function LeaderboardPopup({ onClose, leaderboard, quizQuestions }) {
  const [viewAnswersIndex, setViewAnswersIndex] = useState(null);
  const [sortedLeaderboard, setSortedLeaderboard] = useState(leaderboard);
  const [sortOption, setSortOption] = useState('topScore');

  useEffect(() => {
    sortLeaderboard(sortOption);
  }, [leaderboard, sortOption]);

  const sortLeaderboard = (option) => {
    const sorted = [...leaderboard].sort((a, b) => {
      if (option === 'topScore') {
        return b.score - a.score;
      } else if (option === 'leastScore') {
        return a.score - b.score;
      } else if (option === 'leastTime') {
        return parseTime(a.time) - parseTime(b.time);
      }
      return 0;
    });
    setSortedLeaderboard(sorted);
  };

  const parseTime = (time) => {
    const [min, sec] = time.split(':').map(Number);
    return min * 60 + sec;
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleViewAnswers = (index) => {
    setViewAnswersIndex(index);
  };

  const handleBack = () => {
    setViewAnswersIndex(null);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Quiz Leaderboard', 14, 10);
    const tableData = sortedLeaderboard.map((entry, index) => [
      index + 1,
      entry.name,
      entry.score,
      entry.time,
    ]);
    doc.autoTable({
      head: [['Rank', 'Participant', 'Score', 'Time Taken']],
      body: tableData,
      startY: 20,
    });
    doc.save('leaderboard.pdf');
  };

  const downloadExcel = () => {
    const worksheetData = sortedLeaderboard.map((entry, index) => ({
      Rank: index + 1,
      Participant: entry.name,
      Score: entry.score,
      'Time Taken': entry.time,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leaderboard');
    XLSX.writeFile(workbook, 'leaderboard.xlsx');
  };

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <button className="close-leaderboard" onClick={onClose}>×</button>

        {!viewAnswersIndex && viewAnswersIndex !== 0 ? (
          <>
            <h2 className="leaderboard-heading">Leaderboard</h2>
            <div className="sort-controls">
              <label htmlFor="sortOption">Sort by: </label>
              <select id="sortOption" value={sortOption} onChange={handleSortChange}>
                <option value="topScore">Top Scores</option>
                <option value="leastScore">Least Scores</option>
                <option value="leastTime">Least Time</option>
              </select>
              <div className="download-buttons">
                <button className="download-btn" onClick={downloadPDF}>Download PDF</button>
                <button className="download-btn" onClick={downloadExcel}>Download Excel</button>
              </div>
            </div>
            <div className="leaderboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Participant</th>
                    <th>Score</th>
                    <th>Time Taken</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((entry, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{entry.name}</td>
                      <td>{entry.score}</td>
                      <td>{entry.time}</td>
                      <td>
                        <button className="view-btn" onClick={() => handleViewAnswers(index)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="review-section">
            <h3>Quiz Review - {sortedLeaderboard[viewAnswersIndex].name}</h3>
            {quizQuestions.map((q, i) => (
              <div key={i} className="review-question">
                <p><strong>Q{i + 1}:</strong> {q.question}</p>
                <p>Your Answer: <span className={sortedLeaderboard[viewAnswersIndex].answers[i] === q.correctAnswer ? 'correct' : 'wrong'}>{sortedLeaderboard[viewAnswersIndex].answers[i]}</span></p>
                <p>Correct Answer: <span className="correct">{q.correctAnswer}</span></p>
              </div>
            ))}
            <button className="back-button" onClick={handleBack}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPopup;