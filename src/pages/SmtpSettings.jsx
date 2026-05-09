import React, { useState, useEffect } from 'react';
import { FaSave, FaCheckCircle } from 'react-icons/fa';
import api from '../config/api';
import { toast } from 'react-toastify';
import PageLayout from '../components/PageLayout';
import './SmtpSettings.css';

const SmtpSettings = ({ toggleSidebar, sidebarOpen }) => {
  const [settings, setSettings] = useState({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'Habit Tracker',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [passwordExists, setPasswordExists] = useState(false); // Track if password exists

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/smtp');
      if (response.data) {
        // Check if password exists (backend sends a flag or we check username)
        const hasPassword = response.data.username && response.data.username !== '';
        setPasswordExists(hasPassword);
        
        setSettings({
          ...response.data,
          password: hasPassword ? '••••••••••••••••' : '', // Show dots if password exists
        });
      }
    } catch (error) {
      console.error('Failed to fetch SMTP settings:', error);
      toast.error('Failed to load SMTP settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If password field is being changed and it had dots, clear it first
    if (name === 'password' && passwordExists && settings.password === '••••••••••••••••') {
      setSettings((prev) => ({
        ...prev,
        password: value,
      }));
      setPasswordExists(false);
      return;
    }
    
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!settings.host || !settings.username || !settings.fromEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      // Only send password if it's been changed (not the dots placeholder)
      const dataToSend = { ...settings };
      if (!dataToSend.password || dataToSend.password === '••••••••••••••••') {
        delete dataToSend.password;
      }
      
      await api.put('/smtp', dataToSend);
      toast.success('SMTP settings saved successfully');
      
      // Refresh settings
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save SMTP settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.host || !settings.username) {
      toast.error('Please fill in SMTP host and username first');
      return;
    }

    try {
      setTesting(true);
      await api.post('/smtp/test');
      toast.success('SMTP connection test successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'SMTP connection test failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        title="SMTP Settings"
      >
        <div className="loading-container">
          <div className="loading">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  // Footer content
  const footerContent = (
    <div className="smtp-footer-actions">
      <button
        type="button"
        className="test-btn"
        onClick={handleTestConnection}
        disabled={testing || saving}
      >
        <FaCheckCircle />
        {testing ? 'Testing...' : 'Test Connection'}
      </button>
      <button
        type="submit"
        className="save-btn"
        onClick={handleSubmit}
        disabled={saving || testing}
      >
        <FaSave />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );

  return (
    <PageLayout
      toggleSidebar={toggleSidebar}
      sidebarOpen={sidebarOpen}
      title="SMTP Settings"
      showFooter={true}
      footer={footerContent}
    >
      <form onSubmit={handleSubmit} className="smtp-form-horizontal">
        {/* Server Configuration */}
        <div className="smtp-section">
          <h3 className="section-title">Server Configuration</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="host">SMTP Host *</label>
              <input
                type="text"
                id="host"
                name="host"
                value={settings.host}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="port">Port *</label>
              <input
                type="number"
                id="port"
                name="port"
                value={settings.port}
                onChange={handleChange}
                placeholder="587"
                required
              />
            </div>

            <div className="form-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  name="secure"
                  checked={settings.secure}
                  onChange={handleChange}
                />
                <span>Use SSL/TLS (Port 465)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="smtp-section">
          <h3 className="section-title">Authentication</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="username">Username / Email *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={settings.username}
                onChange={handleChange}
                placeholder="your-email@gmail.com"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password / App Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={settings.password}
                onChange={handleChange}
                placeholder={passwordExists ? "Click to change password" : "Enter your app password"}
              />
              {passwordExists && settings.password === '••••••••••••••••' && (
                <small className="field-hint">Password is saved. Click to change it.</small>
              )}
            </div>
          </div>
        </div>

        {/* Sender Information */}
        <div className="smtp-section">
          <h3 className="section-title">Sender Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="fromEmail">From Email *</label>
              <input
                type="email"
                id="fromEmail"
                name="fromEmail"
                value={settings.fromEmail}
                onChange={handleChange}
                placeholder="noreply@habittracker.com"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="fromName">From Name</label>
              <input
                type="text"
                id="fromName"
                name="fromName"
                value={settings.fromName}
                onChange={handleChange}
                placeholder="Habit Tracker"
              />
            </div>
          </div>
        </div>
      </form>
    </PageLayout>
  );
};

export default SmtpSettings;
