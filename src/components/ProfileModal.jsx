import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaBell, FaUser, FaEnvelope, FaTimes, FaClock, FaGlobe, FaSave, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import api from '../config/api';
import TimezoneSelector from './TimezoneSelector';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const { user, updateNotificationPreference, setUser } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationEnabled || false);
  const [inactivityHours, setInactivityHours] = useState(user?.inactivityHours || 10);
  
  // Editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(user?.timezone || moment.tz.guess());
  const [isSaving, setIsSaving] = useState(false);

  const handleNotificationToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await updateNotificationPreference(newValue);
  };

  const handleInactivityHoursChange = async (e) => {
    const hours = parseInt(e.target.value);
    setInactivityHours(hours);
    // TODO: Add API call to update inactivity hours
    // await api.put('/auth/update-inactivity-hours', { inactivityHours: hours });
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put('/auth/profile', {
        name: name.trim(),
        email: email.trim(),
        timezone,
      });

      // Update user in context and localStorage
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setName(user?.name || '');
    setEmail(user?.email || '');
    setTimezone(user?.timezone || moment.tz.guess());
    setIsEditing(false);
  };

  const getTimezoneDisplay = (tz) => {
    const offset = moment.tz(tz).format('Z');
    return `${tz} (UTC${offset})`;
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Scrollable content wrapper */}
        <div className="profile-modal-scroll-wrapper">
          <div className="profile-modal-content">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {name?.charAt(0).toUpperCase()}
                </div>
                <h2>{name}</h2>
                <p>{email}</p>
              </div>

              <div className="profile-info">
                <div className="profile-edit-header">
                  <h3>Personal Details</h3>
                  {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                      <FaEdit /> Edit
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button 
                        className="cancel-btn" 
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button 
                        className="save-btn" 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        <FaSave /> {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <FaUser className="info-icon" />
                  <div className="info-field-wrapper">
                    <label>Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="edit-input"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p>{name}</p>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <FaEnvelope className="info-icon" />
                  <div className="info-field-wrapper">
                    <label>Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="edit-input"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p>{email}</p>
                    )}
                  </div>
                </div>

                <div className="info-item">
                  <FaGlobe className="info-icon" />
                  <div className="info-field-wrapper">
                    <label>Timezone</label>
                    {isEditing ? (
                      <TimezoneSelector
                        value={timezone}
                        onChange={setTimezone}
                        disabled={false}
                      />
                    ) : (
                      <p>{getTimezoneDisplay(timezone)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3>Notification Settings</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <FaBell className="setting-icon" />
                  <div>
                    <h4>Enable Notifications</h4>
                    <p>Receive reminders when you're inactive</p>
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

              {notificationsEnabled && (
                <div className="setting-item-full">
                  <div className="setting-info">
                    <FaClock className="setting-icon" />
                    <div className="setting-text-full">
                      <h4>Inactivity Reminder</h4>
                      <p>Send notification after being inactive</p>
                    </div>
                  </div>
                  <select
                    value={inactivityHours}
                    onChange={handleInactivityHoursChange}
                    className="hours-dropdown"
                  >
                    {Array.from({ length: 24 }, (_, i) => i + 1).map(hour => (
                      <option key={hour} value={hour}>
                        {hour} {hour === 1 ? 'hour' : 'hours'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
