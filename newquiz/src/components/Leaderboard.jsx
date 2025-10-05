import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../styles/Leaderboard.css";
import { useAuth } from "../Context/AuthContext";
import { useParams} from "react-router-dom";
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

function Leaderboard() {
  const { user } = useAuth();
const { quizIdOrCustom, quizCodeUrl } = useParams(); // <-- Get the new parameter
const location = useLocation();
const isCustomQuiz = quizIdOrCustom === "custom";
const quizId = !isCustomQuiz ? quizIdOrCustom : null;
const quizCode = isCustomQuiz
  ? quizCodeUrl || location.state?.quizCode || null // Use quizCodeUrl
  : null;

if (!quizId && !quizCode) {
  console.error("No quizId or quizCode provided"); 
}

  const [leaderboard, setLeaderboard] = useState([]);
  const [sortedLeaderboard, setSortedLeaderboard] = useState([]);
  const [viewAnswersIndex, setViewAnswersIndex] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [sortOption, setSortOption] = useState("topScore");
  const [quizTitle, setQuizTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
    const formatDuration = (seconds) => {
    if (!seconds) return "00:00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

const goToCourses = () => {
  const role = user?.role;

  if (role === "Admin") {
    navigate("/admin-courses");
  } else if (role === "Student") {
    navigate("/courses");
  } else {
    navigate("/signup", { state: { message: "Please sign up to access courses" } });
  }
};

  const QuizReview = ({ entry, onBack }) => {
    const correctCount = entry.answers ? entry.answers.filter(a => a.isCorrect).length : 0;
    const totalQuestions = entry.answers ? entry.answers.length : 0;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const formatDateTime = (date) => {
if (!date || isNaN(new Date(date).getTime())) return "N/A";
      return new Date(date).toLocaleString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      }).replace(',', ' |');
    };

    return (
      <div className="quiz-review-card">
        <h2>Quiz Review - {entry.studentName}</h2>
        <p><strong>Email:</strong> {entry.email}</p>
        <p><strong>Branch:</strong> {entry.branch || "-"}</p>
        <p><strong>Score:</strong> {correctCount} / {totalQuestions} ({percentage}%)</p>
        <p><strong>Time Taken:</strong> {formatDuration(entry.duration)}</p>
        <p><strong>Started At:</strong> {formatDateTime(entry.startedAt)}</p>
        <p><strong>Submitted At:</strong> {formatDateTime(entry.submittedAt)}</p>

        {entry.answers?.map((a, i) => (
          <div key={i} className="review-question">
            <p><strong>Q{i + 1}:</strong> {a.questionText}</p>
            <p>
              Your Answer:{" "}
              <span className={a.isCorrect ? "correct" : "wrong"}>
                {a.selectedAnswer || "—"}
              </span>
            </p>
            <p>
              Correct Answer: <span className="correct">{a.correctAnswer}</span>
            </p>
          </div>
        ))}

        <button className="back-btn" onClick={onBack}>
          Back to Leaderboard
        </button>
      </div>
    );
  };

useEffect(() => {
  if (!quizId && !quizCode) return;

  const fetchLeaderboard = async () => {
    try {
      const token = user?.token;
      if (!token) return;

let endpoint;
if (quizCode) {
  endpoint = `${API_URL}/api/results/custom/leaderboard/${quizCode}`;
} else if (quizId) {
  endpoint = `${API_URL}/api/results/${quizId}/leaderboard`;
} else {
  console.error("No valid quizId or quizCode to fetch leaderboard");
  return;
}

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Leaderboard fetch failed:", text);
        alert("Leaderboard not found or you are not authorized.");
        return;
      }

      const data = await res.json();
      console.log("Fetched leaderboard data:", data);

const resultsArray = data.leaderboard || [];
const normalizedLeaderboard = resultsArray.map((r) => ({
  _id: r._id,
  studentName:
    r.studentName || 
    r.userName || 
    "Unknown",
  email: r.email || r.userEmail || "-", 
  branch: r.branch || r.userBranch || "-", 
  score: r.score ?? 0,
  duration: r.duration ?? 0,
  answers: r.answers || [],
  total: r.total || (r.answers?.length || 0),
  startedAt: r.startedAt,
  submittedAt: r.submittedAt,
}));

      setLeaderboard(normalizedLeaderboard);
      setQuizTitle(data.quizTitle || data.title || "Quiz");
      setQuizQuestions(data.questions || []);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      alert("Error fetching leaderboard");
    }
  };

  fetchLeaderboard();
}, [quizId, quizCode, user]);

  useEffect(() => {
    sortLeaderboard(sortOption);
  }, [leaderboard, sortOption]);

  const sortLeaderboard = (option) => {
    const sorted = [...leaderboard].sort((a, b) => {
      if (option === "topScore") return b.score - a.score;
      if (option === "leastScore") return a.score - b.score;
      if (option === "leastTime") return parseTime(a.time) - parseTime(b.time);
      return 0;
    });
    setSortedLeaderboard(sorted);
  };

  const parseTime = (time) => {
    const [min, sec] = time.split(":").map(Number);
    return min * 60 + sec;
  };

  const handleSortChange = (e) => setSortOption(e.target.value);

const handleViewAnswers = async (index) => {
  try {
    const token = user?.token;
    const resultId = sortedLeaderboard[index]._id;
const endpoint = quizCode
  ? `${API_URL}/api/results/custom/result/${resultId}`
  : `${API_URL}/api/results/${resultId}`;

    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch result");

    const data = await res.json();
    sortedLeaderboard[index].answers = data.answers || [];
    setViewAnswersIndex(index);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch quiz answers");
  }
};

  const handleBack = () => setViewAnswersIndex(null);

const downloadPDF = () => {
  const doc = new jsPDF();
  const logo = new Image();
  logo.src = "/nlo.png";
  logo.onload = () => {
    doc.addImage(logo, "PNG", 10, 8, 43, 14);
    doc.setFontSize(16);
    doc.text(`Leaderboard - ${quizTitle}`, 14, 45);
    const tableData = sortedLeaderboard.map((entry, i) => [
      i + 1,
      entry.studentName,
      entry.email,
      entry.branch || "-",
      entry.score,
      formatDuration(entry.duration),
    ]);

    autoTable(doc, {
      head: [["Rank", "Name", "Email", "Branch", "Score", "Time Taken"]],
      body: tableData,
      startY: 55,
      headStyles: {
        fillColor: [25, 53, 202], // 1935CA color
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        halign: "center",
      },
    });

    const safeTitle = quizTitle.replace(/\s+/g, "_");
    doc.save(`${safeTitle}_Leaderboard.pdf`);
  };
};

const downloadExcel = () => {
  const worksheetData = sortedLeaderboard.map((entry, i) => ({
    Rank: i + 1,
    Name: entry.studentName,
    Email: entry.email,
    Branch: entry.branch || "-",
    Score: entry.score,
    "Time Taken": formatDuration(entry.duration),
  }));
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leaderboard");

  const safeTitle = quizTitle.replace(/\s+/g, "_");
  XLSX.writeFile(workbook, `${safeTitle}_Leaderboard.xlsx`);
};

  return (
<div className={`leaderboard-container ${user?.role === "Admin" ? "admin" : "student"}`}>
      {viewAnswersIndex === null ? (
        <>
<h2 className="leaderboard-heading">
  Leaderboard {quizTitle ? `- ${quizTitle}` : ""}
</h2>
<div className="sort-controls">
  <div className="download-buttons">
    <button className="download-btn" onClick={downloadPDF}>Download PDF</button>
    <button className="download-btn" onClick={downloadExcel}>Download Excel</button>
  </div>
</div>
<div className="filter-search-row">
  <input
    type="text"
    placeholder="Search by name, email, or branch..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
  />
  <div className="filter-select">
    <label htmlFor="sortOption">Sort by: </label>
    <select id="sortOption" value={sortOption} onChange={handleSortChange}>
      <option value="topScore">Top Scores</option>
      <option value="leastScore">Least Scores</option>
      <option value="leastTime">Least Time</option>
    </select>
  </div>
</div>
          <div className="leaderboard-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th>View Analysis</th>
                </tr>
              </thead>
<tbody>
{sortedLeaderboard
  .filter((entry) => {
    const term = searchTerm.toLowerCase();
    return (
      entry.studentName.toLowerCase().includes(term) ||
      entry.email.toLowerCase().includes(term) ||
      (entry.branch || "-").toLowerCase().includes(term)
    );
  })
  .map((entry, index) => (
    <tr key={index}>
      <td>{index + 1}</td>
      <td>{entry.studentName}</td>
      <td>{entry.email}</td>
      <td>{entry.branch || "-"}</td>
      <td>
        {entry.answers
          ? `${entry.answers.filter(a => a.isCorrect).length} / ${entry.answers.length}`
          : `${entry.score} / ${entry.total || "-"}`}
      </td>
      <td>{formatDuration(entry.duration)}</td>
      <td>
        <button className="view-btn" onClick={() => handleViewAnswers(index)}>
          View Analysis
        </button>
      </td>
    </tr>
))}
</tbody>
            </table>
          </div>

          <div className="back-to-courses">
            <button className="back-btn" onClick={goToCourses}>Back to Courses</button>
          </div>
        </>
      ) : (
        <QuizReview
          entry={sortedLeaderboard[viewAnswersIndex]}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default Leaderboard;
