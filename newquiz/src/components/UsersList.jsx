import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa';
import '../styles/UsersList.css';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

function UsersList() {
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = () => {
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/admin/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        const studentsList = data.filter(user => user.role === 'student');
        const adminsList = data.filter(user => user.role === 'admin');
        setStudents(studentsList);
        setAdmins(adminsList);
        setLoading(false);
      })
      .catch(err => {
        console.error('🔴 Error fetching users:', err);
        setError('Failed to load users.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading-message">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <button className="retry-btn" onClick={fetchUsers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="users-list">
      <button className="back-btn" onClick={() => navigate('/admin/profile')}>
        Back to Admin Profile
      </button>

      <h2>Students ({students.length})</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Full Name</th>
            <th>Email ID</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student._id}>
              <td>{index + 1}</td>
              <td>{student.fName} {student.lName}</td>
              <td>{student.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Admins ({admins.length})</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Full Name</th>
            <th>Email ID</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin, index) => (
            <tr key={admin._id}>
              <td>{index + 1}</td>
              <td>{admin.fName} {admin.lName}</td>
              <td>{admin.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="scroll-to-top" onClick={scrollToTop} title="Scroll to top">
        <FaArrowUp />
      </button>
    </div>
  );
}

export default UsersList;
