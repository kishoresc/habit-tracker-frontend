import React from 'react';
import './NotificationPrompt.css';

const NotificationPrompt = ({ onEnable, onClose }) => {
  return (
    <div className="notification-prompt fade-in">
      <div className="notification-content">
        <div className="notification-icon">🔔</div>
        <div className="notification-text">
          <h3>Stay on Track!</h3>
          <p>Enable notifications to get reminders and never miss your habits</p>
        </div>
        <div className="notification-actions">
          <button className="btn btn-primary" onClick={onEnable}>
            Enable Notifications
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
