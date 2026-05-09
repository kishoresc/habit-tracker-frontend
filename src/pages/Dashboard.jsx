import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HabitContext } from '../context/HabitContext';
import PageLayout from '../components/PageLayout';
import NotificationPrompt from '../components/NotificationPrompt';
import { 
  requestNotificationPermission, 
  showNotification, 
  updateLastActive,
  startInactivityChecker 
} from '../utils/notifications';
import './Dashboard.css';

const Dashboard = ({ toggleSidebar, sidebarOpen }) => {
  const { user, updateNotificationPreference } = useContext(AuthContext);
  const { stats, habits, isHabitCompletedToday } = useContext(HabitContext);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    updateLastActive();

    if (!user?.notificationEnabled && Notification.permission !== 'granted') {
      setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 2000);
    }

    const interval = startInactivityChecker(() => {
      showNotification('Don\'t break your streak! 🔥', {
        body: 'Time to complete today\'s habits!',
        tag: 'habit-reminder',
      });
    });

    const handleActivity = () => updateLastActive();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [user]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await updateNotificationPreference(true);
      showNotification('Notifications Enabled! 🎉', {
        body: 'We\'ll remind you to stay consistent with your habits',
      });
    }
    setShowNotificationPrompt(false);
  };

  // Get today's active habits
  const activeHabits = habits.filter(h => h.isActive !== false);
  const todayCompletedCount = activeHabits.filter(h => isHabitCompletedToday(h)).length;
  const todayProgress = activeHabits.length > 0 ? Math.round((todayCompletedCount / activeHabits.length) * 100) : 0;

  // Get top streak habit
  const topStreakHabit = habits.length > 0 
    ? habits.reduce((max, habit) => habit.currentStreak > max.currentStreak ? habit : max, habits[0])
    : null;

  // Calculate total completions (all time)
  const totalCompletions = habits.reduce((total, habit) => {
    return total + habit.completionHistory.filter(entry => entry.completed).length;
  }, 0);

  // Calculate perfect days (days where all active habits were completed)
  const getPerfectDays = () => {
    if (activeHabits.length === 0) return 0;
    
    const dateMap = new Map();
    
    activeHabits.forEach(habit => {
      habit.completionHistory.forEach(entry => {
        if (entry.completed) {
          const dateKey = new Date(entry.date).toDateString();
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, new Set());
          }
          dateMap.get(dateKey).add(habit._id);
        }
      });
    });
    
    let perfectDays = 0;
    dateMap.forEach((habitIds) => {
      if (habitIds.size === activeHabits.length) {
        perfectDays++;
      }
    });
    
    return perfectDays;
  };

  const perfectDays = getPerfectDays();

  // Console log for debugging
  console.log('=== DASHBOARD DATA ===');
  console.log('Total habits:', habits.length);
  console.log('Active habits:', activeHabits.length);
  console.log('Today completed count:', todayCompletedCount);
  console.log('Today progress %:', todayProgress);
  console.log('Total completions (all time):', totalCompletions);
  console.log('Perfect days:', perfectDays);
  console.log('Top streak (current):', topStreakHabit?.currentStreak || 0);
  console.log('Stats from backend:', stats);
  console.log('======================');

  return (
    <PageLayout
      toggleSidebar={toggleSidebar}
      sidebarOpen={sidebarOpen}
      title="Dashboard"
    >
      <div className="dashboard-content">
        <div className="dashboard-welcome fade-in">
          <div className="welcome-text">
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Here's your habit tracking overview for today</p>
          </div>
        </div>

        {/* Simple Stats Dashboard with Pie Chart */}
        <div className="today-progress-section fade-in">
          
          {/* Stats Cards */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '25px',
            marginBottom: '30px'
          }}>
            {/* Total Habits Created */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#667eea', marginBottom: '10px' }}>
                {habits.length}
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '600' }}>
                Total Habits Created
              </div>
            </div>

            {/* Active Streaks */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔥</div>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#f59e0b', marginBottom: '10px' }}>
                {habits.filter(h => h.currentStreak > 0).length}
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '600' }}>
                Streaks Maintained
              </div>
            </div>

            {/* Best Streak */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⭐</div>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#10b981', marginBottom: '10px' }}>
                {topStreakHabit?.currentStreak || 0}
              </div>
              <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '600' }}>
                Best Streak
              </div>
            </div>
          </div>

          {/* Pie Chart Section */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ 
              margin: '0 0 30px 0',
              fontSize: '22px',
              fontWeight: '700',
              color: '#1f2937',
              textAlign: 'center'
            }}>
              Habits by Category
            </h2>

            {habits.length > 0 ? (
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '60px',
                flexWrap: 'wrap'
              }}>
                {/* Pie Chart */}
                <div style={{ position: 'relative' }}>
                  <svg width="280" height="280" viewBox="0 0 280 280">
                    {(() => {
                      const categoryCount = {};
                      habits.forEach(habit => {
                        categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
                      });

                      const categories = Object.entries(categoryCount);
                      const total = habits.length;
                      let currentAngle = 0;

                      const colors = {
                        'Health': '#10b981',
                        'Fitness': '#f59e0b',
                        'Learning': '#3b82f6',
                        'Productivity': '#8b5cf6',
                        'Mindfulness': '#ec4899',
                        'Other': '#6b7280'
                      };

                      return categories.map(([category, count], index) => {
                        const percentage = (count / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        
                        // Convert to radians
                        const startRad = (startAngle - 90) * (Math.PI / 180);
                        const endRad = (endAngle - 90) * (Math.PI / 180);
                        
                        // Calculate path
                        const x1 = 140 + 120 * Math.cos(startRad);
                        const y1 = 140 + 120 * Math.sin(startRad);
                        const x2 = 140 + 120 * Math.cos(endRad);
                        const y2 = 140 + 120 * Math.sin(endRad);
                        
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        const pathData = [
                          `M 140 140`,
                          `L ${x1} ${y1}`,
                          `A 120 120 0 ${largeArc} 1 ${x2} ${y2}`,
                          `Z`
                        ].join(' ');
                        
                        currentAngle = endAngle;
                        
                        return (
                          <path
                            key={category}
                            d={pathData}
                            fill={colors[category] || colors.Other}
                            stroke="white"
                            strokeWidth="3"
                          />
                        );
                      });
                    })()}
                  </svg>
                  
                  {/* Center Circle */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', fontWeight: '700', color: '#1f2937' }}>
                      {habits.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                      Total
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {(() => {
                    const categoryCount = {};
                    habits.forEach(habit => {
                      categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
                    });

                    const colors = {
                      'Health': '#10b981',
                      'Fitness': '#f59e0b',
                      'Learning': '#3b82f6',
                      'Productivity': '#8b5cf6',
                      'Mindfulness': '#ec4899',
                      'Other': '#6b7280'
                    };

                    return Object.entries(categoryCount).map(([category, count]) => {
                      const percentage = Math.round((count / habits.length) * 100);
                      return (
                        <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: colors[category] || colors.Other,
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                              {category}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              {count} habits ({percentage}%)
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
                <p style={{ fontSize: '16px' }}>No habits created yet. Create your first habit to see the chart!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotificationPrompt && (
        <NotificationPrompt
          onEnable={handleEnableNotifications}
          onClose={() => setShowNotificationPrompt(false)}
        />
      )}
    </PageLayout>
  );
};

export default Dashboard;
