import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserCheck, FaUserPlus, FaTrash, FaEye } from 'react-icons/fa';
import api from '../config/api';
import { toast } from 'react-toastify';
import PageLayout from '../components/PageLayout';
import './AdminDashboard.css';

const AdminDashboard = ({ toggleSidebar, sidebarOpen }) => {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalHabits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics'),
      ]);
      
      // Extract users array from response
      const usersData = usersRes.data.users || usersRes.data || [];
      
      setUsers(usersData);
      setAnalytics({
        totalUsers: analyticsRes.data.totalUsers || 0,
        activeUsers: analyticsRes.data.activeUsers || 0,
        newUsersThisMonth: analyticsRes.data.newUsersLast30Days || 0,
        totalHabits: analyticsRes.data.totalHabits || 0,
        totalCompletions: analyticsRes.data.totalCompletions || 0,
        averageHabitsPerUser: analyticsRes.data.averageHabitsPerUser || 0,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/admin/users/${userToDelete.id}`);
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleViewHabits = async (user) => {
    setSelectedUser(user);
    setShowHabitsModal(true);
    setLoadingHabits(true);
    
    try {
      const response = await api.get(`/admin/users/${user._id}/habits`);
      setUserHabits(response.data || []);
    } catch (error) {
      console.error('Error fetching user habits:', error);
      toast.error('Failed to load user habits');
      setUserHabits([]);
    } finally {
      setLoadingHabits(false);
    }
  };

  const closeHabitsModal = () => {
    setShowHabitsModal(false);
    setSelectedUser(null);
    setUserHabits([]);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <PageLayout
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        title="Master Admin Dashboard"
      >
        <div className="loading-container">
          <div className="loading">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      toggleSidebar={toggleSidebar}
      sidebarOpen={sidebarOpen}
      title="Master Admin Dashboard"
    >
      <div className="admin-dashboard-content">
        {/* Analytics Cards */}
        <div className="admin-analytics-cards">
          <div className="admin-card">
            <div className="admin-card-icon">
              <FaUsers />
            </div>
            <div className="admin-card-content">
              <h3>Total Users</h3>
              <p className="admin-card-value">{analytics.totalUsers}</p>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">
              <FaUserCheck />
            </div>
            <div className="admin-card-content">
              <h3>Active Users</h3>
              <p className="admin-card-value">{analytics.activeUsers}</p>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">
              <FaUserPlus />
            </div>
            <div className="admin-card-content">
              <h3>New This Month</h3>
              <p className="admin-card-value">{analytics.newUsersThisMonth}</p>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">
              <FaUsers />
            </div>
            <div className="admin-card-content">
              <h3>Total Habits</h3>
              <p className="admin-card-value">{analytics.totalHabits}</p>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">
              <FaUserCheck />
            </div>
            <div className="admin-card-content">
              <h3>Total Completions</h3>
              <p className="admin-card-value">{analytics.totalCompletions}</p>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">
              <FaUserPlus />
            </div>
            <div className="admin-card-content">
              <h3>Avg Habits/User</h3>
              <p className="admin-card-value">{analytics.averageHabitsPerUser}</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-users-section">
          <div className="users-header">
            <h2>All Users</h2>
            <div className="users-count">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length} users
            </div>
          </div>
          <div className="admin-table-container">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Habits</th>
                  <th>Total Completions</th>
                  <th>Active Streaks</th>
                  <th>Joined Date</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{indexOfFirstUser + index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.stats?.totalHabits || 0}</td>
                      <td>{user.stats?.totalCompletions || 0}</td>
                      <td>{user.stats?.activeStreaks || 0}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>{formatDate(user.lastActive)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="view-btn"
                            onClick={() => handleViewHabits(user)}
                            title="View Habits"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn" 
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button 
                className="pagination-btn" 
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h2>⚠️ Confirm Delete</h2>
              <button className="close-btn" onClick={cancelDelete}>×</button>
            </div>
            
            <div className="delete-modal-body">
              <p>Are you sure you want to delete user <strong>"{userToDelete?.name}"</strong>?</p>
              <p className="warning-text">This will also delete all their habits permanently.</p>
            </div>
            
            <div className="delete-modal-footer">
              <button 
                className="cancel-btn" 
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Habits Modal */}
      {showHabitsModal && (
        <div className="modal-overlay" onClick={closeHabitsModal}>
          <div className="habits-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Habits - {selectedUser?.name}</h2>
              <button className="close-btn" onClick={closeHabitsModal}>×</button>
            </div>
            
            <div className="modal-body">
              {loadingHabits ? (
                <div className="loading">Loading habits...</div>
              ) : userHabits.length === 0 ? (
                <div className="empty-state">
                  <p>No habits found for this user</p>
                </div>
              ) : (
                <div className="habits-list">
                  {userHabits.map((habit, index) => (
                    <div key={habit._id} className="habit-item">
                      <div className="habit-number">{index + 1}</div>
                      <div className="habit-details">
                        <h3>{habit.name}</h3>
                        <div className="habit-stats">
                          <div className="stat-item">
                            <span className="stat-label">Total Completions:</span>
                            <span className="stat-value">
                              {habit.completionHistory?.filter(h => h.completed).length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default AdminDashboard;
