import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaCog, FaSignOutAlt, FaChartBar } from 'react-icons/fa';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`admin-sidebar ${isOpen ? 'expanded' : 'collapsed'}`}>
      {/* Header */}
      <div className="admin-sidebar-header">
        {isOpen && (
          <>
            <div className="admin-sidebar-logo">👑</div>
            <h2 className="admin-sidebar-title">Master Admin</h2>
          </>
        )}
        {!isOpen && <div className="admin-sidebar-logo-small">👑</div>}
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav">
        <NavLink to="/admin" className="admin-nav-item" title="Admin Dashboard" end>
          <div className="admin-nav-icon">
            <FaChartBar />
          </div>
          {isOpen && <span className="admin-nav-text">Dashboard</span>}
        </NavLink>

        <NavLink to="/admin/smtp" className="admin-nav-item" title="SMTP Settings">
          <div className="admin-nav-icon">
            <FaCog />
          </div>
          {isOpen && <span className="admin-nav-text">SMTP Settings</span>}
        </NavLink>
      </nav>

      {/* User Section at Bottom */}
      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
          <div className="admin-nav-icon">
            <FaSignOutAlt />
          </div>
          {isOpen && <span className="admin-nav-text">Logout</span>}
        </button>

        <div className="admin-sidebar-user">
          <div className="admin-user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {isOpen && (
            <div className="admin-user-info">
              <h4>{user?.name}</h4>
              <p className="admin-badge">Master Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
