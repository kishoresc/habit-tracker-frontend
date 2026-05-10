import React, { useContext, useState } from 'react';
import { HabitContext } from '../context/HabitContext';
import { FaTrash, FaFire, FaTrophy, FaCalendar, FaPause, FaPlay, FaEye, FaBell } from 'react-icons/fa';
import HabitCalendar from './HabitCalendar';
import { toast } from 'react-toastify';
import './HabitCard.css';

const categoryColors = {
  Health: '#48bb78',
  Fitness: '#ed8936',
  Learning: '#4299e1',
  Productivity: '#667eea',
  Mindfulness: '#9f7aea',
  Other: '#718096',
};

const HabitCard = ({ habit, serialNumber }) => {
  const { toggleHabitCompletion, deleteHabit, isHabitCompletedToday, toggleHabitStatus, updateHabitReminder } = useContext(HabitContext);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    emailReminderEnabled: habit.emailReminderEnabled || false,
    emailReminderTime: habit.emailReminderTime || '',
  });
  const isCompleted = isHabitCompletedToday(habit);
  const isActive = habit.isActive !== false; // Default to active if not set

  const handleToggle = () => {
    // Prevent action if habit is inactive
    if (!isActive) {
      toast.warning('Please activate this habit first to mark it as complete!');
      return;
    }
    
    // Prevent unchecking if already completed
    if (isCompleted) {
      toast.info('Cannot unmark a completed habit for today!');
      return;
    }
    
    // Show confirmation modal
    setShowCompleteModal(true);
  };

  const confirmComplete = async () => {
    try {
      setCompleting(true);
      await toggleHabitCompletion(habit._id);
      setShowCompleteModal(false);
    } catch (error) {
      toast.error('Failed to complete habit');
    } finally {
      setCompleting(false);
    }
  };

  const cancelComplete = () => {
    setShowCompleteModal(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteHabit(habit._id);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete habit');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleToggleStatus = () => {
    toggleHabitStatus(habit._id);
  };

  const handleScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setScheduleData({
      ...scheduleData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateHabitReminder(habit._id, scheduleData);
    if (success) {
      setShowScheduleModal(false);
      toast.success('Reminder settings updated successfully!');
    }
  };

  return (
    <>
      <div 
        className={`habit-card ${isCompleted ? 'completed' : ''} ${!isActive ? 'inactive' : ''}`}
        title={isCompleted ? 'Already completed today' : isActive ? 'Tick to complete the habit' : 'Activate habit first'}
      >
        {serialNumber && <div className="habit-serial-number">{serialNumber}</div>}
        
        <div className="habit-checkbox">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            id={`habit-${habit._id}`}
            disabled={isCompleted || !isActive}
          />
          <label htmlFor={`habit-${habit._id}`}></label>
        </div>

        <div className="habit-info">
          <h3 className="habit-name">
            {habit.name}
            {!isActive && <span className="inactive-badge">Paused</span>}
          </h3>
          <div className="habit-meta">
            <span 
              className="habit-category"
              style={{ 
                background: `${categoryColors[habit.category]}20`,
                color: categoryColors[habit.category]
              }}
            >
              {habit.category}
            </span>
            <span className="habit-streak">
              <FaFire /> {habit.currentStreak} day streak
            </span>
            {habit.longestStreak > 0 && (
              <span className="habit-longest">
                <FaTrophy /> Best: {habit.longestStreak}
              </span>
            )}
          </div>
        </div>

        <div className="habit-actions">
          <button 
            className="habit-status-btn" 
            onClick={handleToggleStatus}
            title={isActive ? 'Pause habit' : 'Resume habit'}
          >
            {isActive ? <FaPause /> : <FaPlay />}
          </button>

          <button 
            className="habit-view-btn" 
            onClick={() => setShowDetailsModal(true)}
            title="View Details"
          >
            <FaEye />
          </button>

          <button 
            className="habit-schedule-btn" 
            onClick={() => setShowScheduleModal(true)}
            title="Schedule Reminder"
          >
            <FaBell />
          </button>

          <button 
            className="habit-calendar-btn" 
            onClick={() => setShowCalendar(true)}
            title="View Calendar"
          >
            <FaCalendar />
          </button>

          <button className="habit-delete" onClick={handleDelete}>
            <FaTrash />
          </button>
        </div>
      </div>

      {showCalendar && (
        <div className="calendar-modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h2>{habit.name}</h2>
              <button className="calendar-modal-close" onClick={() => setShowCalendar(false)}>
                ×
              </button>
            </div>
            <div className="calendar-modal-body">
              <HabitCalendar habit={habit} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h2>⚠️ Delete Habit</h2>
              <button className="close-btn" onClick={cancelDelete}>×</button>
            </div>
            
            <div className="delete-modal-body">
              <p>Are you sure you want to delete <strong>"{habit.name}"</strong>?</p>
              <p className="warning-text">
                This will permanently delete this habit and all its history including your {habit.currentStreak} day streak.
              </p>
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
                {deleting ? 'Deleting...' : 'Delete Habit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={cancelComplete}>
          <div className="complete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="complete-modal-header">
              <h2>✅ Complete Habit</h2>
              <button className="close-btn" onClick={cancelComplete}>×</button>
            </div>
            
            <div className="complete-modal-body">
              <p>Are you sure you want to mark <strong>"{habit.name}"</strong> as completed for today?</p>
              <p className="success-text">
                This will increase your streak to {habit.currentStreak + 1} days! 🔥
              </p>
            </div>
            
            <div className="complete-modal-footer">
              <button 
                className="cancel-btn" 
                onClick={cancelComplete}
                disabled={completing}
              >
                Cancel
              </button>
              <button 
                className="confirm-complete-btn" 
                onClick={confirmComplete}
                disabled={completing}
              >
                {completing ? 'Completing...' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-modal-header">
              <h2>📋 Habit Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            
            <div className="details-modal-body">
              <div className="detail-item">
                <label>Name:</label>
                <p>{habit.name}</p>
              </div>
              
              <div className="detail-item">
                <label>Description:</label>
                <p>{habit.description || 'No description provided'}</p>
              </div>
              
              <div className="detail-item">
                <label>Category:</label>
                <p>{habit.category}</p>
              </div>
              
              <div className="detail-item">
                <label>Daily Target:</label>
                <p>{habit.dailyTarget}</p>
              </div>
              
              <div className="detail-item">
                <label>Current Streak:</label>
                <p>{habit.currentStreak} days 🔥</p>
              </div>
              
              <div className="detail-item">
                <label>Longest Streak:</label>
                <p>{habit.longestStreak} days 🏆</p>
              </div>
              
              <div className="detail-item">
                <label>Status:</label>
                <p>{isActive ? '✅ Active' : '⏸️ Paused'}</p>
              </div>
              
              <div className="detail-item">
                <label>Email Reminder:</label>
                <p>{habit.emailReminderEnabled ? `✅ Enabled (${habit.emailReminderTime})` : '❌ Disabled'}</p>
              </div>
              
              <div className="detail-item">
                <label>Created:</label>
                <p>{new Date(habit.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="details-modal-footer">
              <button className="btn-primary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Reminder Modal */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="schedule-modal-header">
              <h2>🔔 Schedule Reminder</h2>
              <button className="close-btn" onClick={() => setShowScheduleModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleScheduleSubmit}>
              <div className="schedule-modal-body">
                <div className="form-group">
                  <div className="toggle-group">
                    <label htmlFor="emailReminderEnabled">Enable Daily Email Reminder</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        id="emailReminderEnabled"
                        name="emailReminderEnabled"
                        checked={scheduleData.emailReminderEnabled}
                        onChange={handleScheduleChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {scheduleData.emailReminderEnabled && (
                  <div className="form-group">
                    <label htmlFor="emailReminderTime">Reminder Time</label>
                    <input
                      type="time"
                      id="emailReminderTime"
                      name="emailReminderTime"
                      value={scheduleData.emailReminderTime}
                      onChange={handleScheduleChange}
                      required={scheduleData.emailReminderEnabled}
                      className="time-picker"
                    />
                    <small className="form-hint">You'll receive an email reminder at this time daily</small>
                  </div>
                )}
              </div>
              
              <div className="schedule-modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HabitCard;
