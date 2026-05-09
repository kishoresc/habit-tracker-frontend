import React, { createContext, useState, useEffect } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password });

      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // Show different success message for master admin
      if (userData.role === 'masterAdmin') {
        toast.success('Welcome back, Master Admin!');
      } else {
        toast.success('Login successful!');
      }
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateNotificationPreference = async (enabled) => {
    try {
      await api.put('/auth/notification', { notificationEnabled: enabled });
      const updatedUser = { ...user, notificationEnabled: enabled };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update notification preference');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        register,
        login,
        logout,
        updateNotificationPreference,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
