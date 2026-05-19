import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import TimezoneSelector from '../components/TimezoneSelector';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    timezone: moment.tz.guess(), // Auto-detect timezone using moment-timezone
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Email validation function
  const validateEmail = (email) => {
    // Check if email is empty
    if (!email) {
      return 'Email is required';
    }

    // Check for @ symbol
    if (!email.includes('@')) {
      return 'Email must contain @ symbol';
    }

    // Split email into local and domain parts
    const parts = email.split('@');
    
    // Check if there's text before @
    if (parts[0].length === 0) {
      return 'Email must have text before @ symbol';
    }

    // Check if there's text after @
    if (parts.length < 2 || parts[1].length === 0) {
      return 'Email must have domain after @ symbol';
    }

    // Check if domain has a dot
    if (!parts[1].includes('.')) {
      return 'Email domain must contain a dot (e.g., gmail.com)';
    }

    // Split domain into name and extension
    const domainParts = parts[1].split('.');
    
    // Check if domain name exists
    if (domainParts[0].length === 0) {
      return 'Email must have domain name (e.g., gmail, yahoo)';
    }

    // Check if extension exists and is valid
    if (domainParts[domainParts.length - 1].length < 2) {
      return 'Email must have valid extension (e.g., .com, .in, .org)';
    }

    // Full regex validation for proper email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    return '';
  };

  // Name validation
  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return '';
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    let error = '';
    if (name === 'email') {
      error = validateEmail(value);
    } else if (name === 'name') {
      error = validateName(value);
    } else if (name === 'password') {
      error = validatePassword(value);
      // Also revalidate confirm password if it has a value
      if (formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
        }));
      }
    } else if (name === 'confirmPassword') {
      error = validateConfirmPassword(value, formData.password);
    }

    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    // Update all errors
    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // Check if there are any errors
    if (nameError || emailError || passwordError || confirmPasswordError) {
      toast.error('Please fix all validation errors');
      return;
    }

    const success = await register(formData.name, formData.email, formData.password, formData.timezone);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Start your habit tracking journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={errors.name ? 'input-error' : ''}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., user@gmail.com"
              className={errors.email ? 'input-error' : ''}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password (min 6 characters)"
              className={errors.password ? 'input-error' : ''}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'input-error' : ''}
              required
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="timezone">Timezone</label>
            <TimezoneSelector
              value={formData.timezone}
              onChange={(tz) => setFormData({ ...formData, timezone: tz })}
              required
            />
            <small className="form-text">Your timezone is auto-detected. Change if needed.</small>
          </div>

          <button type="submit" className="btn btn-primary">
            Register
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
