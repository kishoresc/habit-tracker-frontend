import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import { FaBell, FaUser, FaEnvelope, FaCalendar } from 'react-icons/fa';
import './Profile.css';

const Profile = ({ toggleSidebar, sidebarOpen }) => {
  const { user, updateNotificationPreference, setUser } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationEnabled || false);
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isEditingTimezone, setIsEditingTimezone] = useState(false);

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await updateNotificationPreference(newValue);
  };

  const handleTimezoneUpdate = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ timezone })
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = { ...user, timezone };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditingTimezone(false);
        // Show success toast
        const { toast } = await import('react-toastify');
        toast.success('Timezone updated successfully!');
      } else {
        throw new Error('Failed to update timezone');
      }
    } catch (error) {
      const { toast } = await import('react-toastify');
      toast.error('Failed to update timezone');
    }
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
                  {!isEditingTimezone ? (
                    <p>{user?.timezone || 'UTC'}</p>
                  ) : (
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="timezone-select"
                    >
                      <option value="Asia/Kolkata">India (IST - Asia/Kolkata)</option>
                      <option value="America/New_York">US Eastern (EST/EDT)</option>
                      <option value="America/Chicago">US Central (CST/CDT)</option>
                      <option value="America/Denver">US Mountain (MST/MDT)</option>
                      <option value="America/Los_Angeles">US Pacific (PST/PDT)</option>
                      <option value="Europe/London">UK (GMT/BST)</option>
                      <option value="Europe/Paris">Central Europe (CET/CEST)</option>
                      <option value="Asia/Dubai">UAE (GST)</option>
                      <option value="Asia/Tokyo">Japan (JST)</option>
                      <option value="Asia/Shanghai">China (CST)</option>
                      <option value="Asia/Singapore">Singapore (SGT)</option>
                      <option value="Australia/Sydney">Australia Eastern (AEST/AEDT)</option>
                      <option value="UTC">UTC (Universal Time)</option>
                    </select>
                  )}
                </div>
              </div>
              {!isEditingTimezone ? (
                <button 
                  className="btn-edit-timezone"
                  onClick={() => setIsEditingTimezone(true)}
                >
                  Edit
                </button>
              ) : (
                <div className="timezone-actions">
                  <button 
                    className="btn-save-timezone"
                    onClick={handleTimezoneUpdate}
                  >
                    Save
                  </button>
                  <button 
                    className="btn-cancel-timezone"
                    onClick={() => {
                      setTimezone(user?.timezone || 'UTC');
                      setIsEditingTimezone(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
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
