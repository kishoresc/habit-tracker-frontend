import React, { useState, useContext } from 'react';
import { HabitContext } from '../context/HabitContext';
import './AddHabitModal.css';

const categories = ['Health', 'Fitness', 'Learning', 'Productivity', 'Mindfulness', 'Other'];

const AddHabitModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Other',
    dailyTarget: 1,
    emailReminderTime: '',
    emailReminderEnabled: false,
  });

  const { createHabit } = useContext(HabitContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await createHabit(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Habit</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Habit Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Drink 8 glasses of water"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about your habit (optional)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dailyTarget">Daily Target</label>
            <input
              type="number"
              id="dailyTarget"
              name="dailyTarget"
              value={formData.dailyTarget}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <div className="toggle-group">
              <label htmlFor="emailReminderEnabled">Enable Daily Email Reminder</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="emailReminderEnabled"
                  name="emailReminderEnabled"
                  checked={formData.emailReminderEnabled}
                  onChange={handleChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {formData.emailReminderEnabled && (
            <div className="form-group">
              <label htmlFor="emailReminderTime">Reminder Time</label>
              <input
                type="time"
                id="emailReminderTime"
                name="emailReminderTime"
                value={formData.emailReminderTime}
                onChange={handleChange}
                required={formData.emailReminderEnabled}
                className="time-picker"
              />
              <small className="form-hint">You'll receive an email reminder at this time daily</small>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
