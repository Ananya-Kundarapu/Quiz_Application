import React, { useState, useEffect } from 'react';
import '../styles/AdminSettings.css';
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('students');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BRANCHES = ['CSE', 'CSM', 'CSO', 'IT', 'ECE', 'ME', 'CE', 'EE'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.id || decoded._id);
      } catch (err) {
        console.error('❌ Token decode error:', err);
      }
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const role = activeTab === 'students' ? 'Student' : 'Admin';

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

const res = await fetch(`${API_URL}/api/users?role=${role}`, { headers }); 
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setSearchTerm('');
    setSelectedBranch('All');
  }, [activeTab]);

  // Filter users
  useEffect(() => {
    let filtered = [...users];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((u) =>
        (u.name || `${u.fName || ''} ${u.lName || ''}`.trim()).toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    if (activeTab === 'students' && selectedBranch !== 'All') {
      filtered = filtered.filter((u) => u.branch === selectedBranch);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedBranch, activeTab]);

  const handleDelete = async (id) => {
    if (String(id) === String(currentUserId)) {
      alert("⚠️ You cannot delete yourself.");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('token');

    try {
      const headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
      };

        const res = await fetch(`${API_URL}/api/users/${id}`, { 
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to delete user');
        return;
      }

      setUsers((prev) => prev.filter((u) => (u.id || u._id) !== id));
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert('An error occurred while deleting the user.');
    }
  };

  return (
    <div className="admin-settings">
      <h1>User Management</h1>

      {/* Search input row */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tabs and Branch Filter */}
      <div className="top-controls">
        <div className="tabs">
          <button
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={activeTab === 'admins' ? 'active' : ''}
            onClick={() => setActiveTab('admins')}
          >
            Admins
          </button>
        </div>

        {activeTab === 'students' && (
          <div className="branch-filter-wrapper">
            <select
              className="branch-filter"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="All">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* User Table */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-text">Error: {error}</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Name</th>
              <th>Email</th>
              {activeTab === 'students' && <th>Branch</th>}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
              filteredUsers.map((u, i) => {
                const userId = u.id || u._id;
                const isMe = String(userId) === String(currentUserId);
                return (
                  <tr key={userId}>
                    <td>{i + 1}</td>
                    <td>{u.name || `${u.fName || ''} ${u.lName || ''}`.trim()}</td>
                    <td>{u.email}</td>
                    {activeTab === 'students' && <td>{u.branch || '-'}</td>}
                    <td>
                      {isMe && activeTab === 'admins' ? (
                        <span className="me-label">Me</span>
                      ) : (
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(userId)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={activeTab === 'students' ? 5 : 4}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminSettings;
