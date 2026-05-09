import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/api';
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';

export const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    averageStreak: 0,
    weeklyPercentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchStats();
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/habits');
      setHabits(response.data);
      console.log('📊 Habits fetched:', response.data.length, 'habits');
      console.log('Habits data:', response.data);
    } catch (error) {
      toast.error('Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/habits/stats');
      setStats(response.data);
      console.log('📈 Stats fetched from backend:', response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const createHabit = async (habitData) => {
    try {
      const response = await api.post('/habits', habitData);
      setHabits([response.data, ...habits]);
      fetchStats();
      toast.success('Habit created successfully!');
      return true;
    } catch (error) {
      toast.error('Failed to create habit');
      return false;
    }
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const response = await api.put(`/habits/${habitId}/complete`);
      setHabits(habits.map((h) => (h._id === habitId ? response.data : h)));
      fetchStats();
      toast.success('Habit updated!');
    } catch (error) {
      toast.error('Failed to update habit');
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(habits.filter((h) => h._id !== habitId));
      fetchStats();
      toast.success('Habit deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete habit');
    }
  };

  const toggleHabitStatus = async (habitId) => {
    try {
      const habit = habits.find(h => h._id === habitId);
      const newStatus = habit.isActive === false ? true : false;
      
      const response = await api.put(`/habits/${habitId}/status`, { isActive: newStatus });
      setHabits(habits.map((h) => (h._id === habitId ? response.data : h)));
      
      toast.success(newStatus ? 'Habit activated!' : 'Habit paused!');
    } catch (error) {
      toast.error('Failed to update habit status');
    }
  };

  const updateHabitReminder = async (habitId, reminderData) => {
    try {
      const response = await api.put(`/habits/${habitId}/reminder`, reminderData);
      setHabits(habits.map((h) => (h._id === habitId ? response.data : h)));
      return true;
    } catch (error) {
      toast.error('Failed to update reminder settings');
      return false;
    }
  };

  const isHabitCompletedToday = (habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCompletion = habit.completionHistory.find((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    const isCompleted = todayCompletion ? todayCompletion.completed : false;
    
    // Log for debugging
    // console.log(`Habit "${habit.name}" completed today:`, isCompleted);
    
    return isCompleted;
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        stats,
        loading,
        fetchHabits,
        createHabit,
        toggleHabitCompletion,
        deleteHabit,
        toggleHabitStatus,
        updateHabitReminder,
        isHabitCompletedToday,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};
