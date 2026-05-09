import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import { FaBell, FaUser, FaEnvelope, FaCalendar } from 'react-icons/fa';
import './Profile.css';

const Profile = ({ toggleSidebar, sidebarOpen }) => {
  const { user, updateNotificationPreference } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationEnabled || false);

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await updateNotificationPreference(newValue);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`page-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <TopBar toggleSidebar={toggleSidebar} title="Profile" />
      
      <div className="page-content">
        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
            </div>

            <div className="profile-info">
              <div className="info-item">
                <FaUser className="info-icon" />
                <div>
                  <label>Full Name</label>
                  <p>{user?.name}</p>
                </div>
              </div>

              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div>
                  <label>Email Address</label>
                  <p>{user?.email}</p>
                </div>
              </div>

              <div className="info-item">
                <FaCalendar className="info-icon" />
                <div>
                  <label>Member Since</label>
                  <p>{formatDate(user?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <h3>Settings</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <FaBell className="setting-icon" />
                <div>
                  <h4>Notifications</h4>
                  <p>Receive reminders when inactive for 10 hours</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon">🌍</div>
                <div>
                  <h4>Timezone</h4>
                  <p>Automatically detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <h3>Your Activity</h3>
            <div className="activity-stats">
              <div className="activity-item">
                <div className="activity-number">
                  {new Date(user?.lastActive).toLocaleString()}
                </div>
                <div className="activity-label">Last Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
