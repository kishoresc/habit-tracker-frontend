import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaHome, FaChartLine, FaSignOutAlt, FaTasks } from 'react-icons/fa';
import ProfileModal from './ProfileModal';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  return (
    <>
      <div className={`sidebar-new ${isOpen ? 'expanded' : 'collapsed'}`}>
        {/* Header */}
        <div className="sidebar-header-new">
          {isOpen && (
            <>
              <div className="sidebar-logo">🎯</div>
              <h2 className="sidebar-title">Habit Tracker</h2>
            </>
          )}
          {!isOpen && <div className="sidebar-logo-small">🎯</div>}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav-new">
          <NavLink to="/dashboard" className="nav-item-new" title="Dashboard">
            <div className="nav-icon">
              <FaHome />
            </div>
            {isOpen && <span className="nav-text">Dashboard</span>}
          </NavLink>

          <NavLink to="/habits" className="nav-item-new" title="All Habits">
            <div className="nav-icon">
              <FaTasks />
            </div>
            {isOpen && <span className="nav-text">All Habits</span>}
          </NavLink>

          <NavLink to="/analytics" className="nav-item-new" title="Analytics">
            <div className="nav-icon">
              <FaChartLine />
            </div>
            {isOpen && <span className="nav-text">Analytics</span>}
          </NavLink>
        </nav>

        {/* User Section at Bottom */}
        <div className="sidebar-footer-new">
          <button className="logout-btn-new" onClick={handleLogout} title="Logout">
            <div className="nav-icon">
              <FaSignOutAlt />
            </div>
            {isOpen && <span className="nav-text">Logout</span>}
          </button>

          <div className="sidebar-user-new" onClick={handleProfileClick}>
            <div className="user-avatar-new">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="user-info-new">
                <h4>{user?.name}</h4>
                <p>{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
