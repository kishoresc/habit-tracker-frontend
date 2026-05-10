import React, { useContext, useState, useEffect, useRef } from 'react';
import { HabitContext } from '../context/HabitContext';
import PageLayout from '../components/PageLayout';
import './Analytics.css';

const Analytics = ({ toggleSidebar, sidebarOpen }) => {
  const { habits, isHabitCompletedToday } = useContext(HabitContext);
  const [globalFilter, setGlobalFilter] = useState('week'); // Global filter for entire page
  const [showFilterMenu, setShowFilterMenu] = useState(false); // Toggle dropdown menu
  const [showDatePicker, setShowDatePicker] = useState(false); // Toggle date picker
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  // Filter only active habits (same as Dashboard)
  const activeHabits = habits.filter(h => h.isActive !== false);

  // Log when filter changes
  useEffect(() => {
    console.log('🔄 Filter changed to:', globalFilter);
  }, [globalFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomRangeClick = () => {
    setGlobalFilter('custom');
    setShowFilterMenu(false);
    setShowDatePicker(true);
    // Set default dates to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setCustomStartDate(firstDay);
    setCustomEndDate(today);
  };

  const formatDateRange = () => {
    if (customStartDate && customEndDate) {
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return `${customStartDate.toLocaleDateString('en-US', options)} - ${customEndDate.toLocaleDateString('en-US', options)}`;
    }
    return 'Custom Range';
  };

  const renderCalendar = (monthOffset = 0) => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() + monthOffset);
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return { monthName: `${monthNames[month]} ${year}`, days };
  };

  const handleDateClick = (date) => {
    if (!customStartDate || (customStartDate && customEndDate)) {
      setCustomStartDate(date);
      setCustomEndDate(null);
    } else {
      if (date >= customStartDate) {
        setCustomEndDate(date);
      } else {
        setCustomEndDate(customStartDate);
        setCustomStartDate(date);
      }
    }
  };

  const isDateInRange = (date) => {
    if (!customStartDate) return false;
    if (!customEndDate) return date.getTime() === customStartDate.getTime();
    return date >= customStartDate && date <= customEndDate;
  };

  const isDateSelected = (date) => {
    if (!customStartDate) return false;
    if (date.getTime() === customStartDate.getTime()) return true;
    if (customEndDate && date.getTime() === customEndDate.getTime()) return true;
    return false;
  };

  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate, endDate;
    
    if (globalFilter === 'today') {
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (globalFilter === 'week') {
      // Last 7 days including today (today - 6 to today)
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (globalFilter === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (globalFilter === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to week (last 7 days including today)
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    }
    
    return { startDate, endDate };
  };

  const getCategoryStats = () => {
    const { startDate, endDate } = getDateRange();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    const categoryCount = {};
    const categoryCompleted = {};
    
    activeHabits.forEach(habit => {
      categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
      
      const completedCount = habit.completionHistory.filter(entry => {
        if (!entry.completed) return false;
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        const entryTime = entryDate.getTime();
        return entryTime >= startTime && entryTime <= endTime;
      }).length;
      
      categoryCompleted[habit.category] = (categoryCompleted[habit.category] || 0) + completedCount;
    });
    
    return { categoryCount, categoryCompleted };
  };

  const getTopStreaks = () => {
    const { startDate, endDate } = getDateRange();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    
    const habitsWithFilteredStreaks = activeHabits.map(habit => {
      let currentStreak = 0;
      let maxStreak = 0;
      
      // Get entries in date range, sorted by date
      const filteredHistory = habit.completionHistory
        .filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          const entryTime = entryDate.getTime();
          return entryTime >= startTime && entryTime <= endTime;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      filteredHistory.forEach(entry => {
        if (entry.completed) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      
      return {
        ...habit,
        filteredStreak: maxStreak
      };
    });
    
    return habitsWithFilteredStreaks
      .sort((a, b) => b.filteredStreak - a.filteredStreak)
      .slice(0, 5);
  };

  const getLongestStreaks = () => {
    const { startDate, endDate } = getDateRange();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    
    const habitsWithFilteredStreaks = activeHabits.map(habit => {
      let currentStreak = 0;
      let maxStreak = 0;
      
      const filteredHistory = habit.completionHistory
        .filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          const entryTime = entryDate.getTime();
          return entryTime >= startTime && entryTime <= endTime;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      filteredHistory.forEach(entry => {
        if (entry.completed) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      
      return {
        ...habit,
        filteredLongestStreak: maxStreak
      };
    });
    
    return habitsWithFilteredStreaks
      .sort((a, b) => b.filteredLongestStreak - a.filteredLongestStreak)
      .slice(0, 5);
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      let completedCount = 0;
      activeHabits.forEach(habit => {
        const completed = habit.completionHistory.some(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === date.getTime() && entry.completed;
        });
        if (completed) completedCount++;
      });

      weekData.push({
        day: days[date.getDay()],
        date: date.getDate(),
        completed: completedCount,
        total: activeHabits.length
      });
    }

    return weekData;
  };

  const getTodayData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use the same logic as Dashboard
    const todayCompletedCount = activeHabits.filter(h => isHabitCompletedToday(h)).length;

    return [{
      day: 'Today',
      date: today.getDate(),
      completed: todayCompletedCount,
      total: activeHabits.length
    }];
  };

  const getMonthlyData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthData = [];

    // Show last 12 months (including previous year if needed)
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Don't show future months
      if (firstDay > today) continue;
      
      // Adjust last day if it's the current month
      const endDay = lastDay > today ? today : lastDay;
      
      let monthCompletedCount = 0;
      let monthTotalPossible = 0;

      // Count completions for this month
      const daysInMonth = endDay.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        const dateTime = date.getTime();

        monthTotalPossible += activeHabits.length;

        // Count completions for this date
        for (let h = 0; h < activeHabits.length; h++) {
          const habit = activeHabits[h];
          for (let e = 0; e < habit.completionHistory.length; e++) {
            const entry = habit.completionHistory[e];
            if (entry.completed) {
              const entryDate = new Date(entry.date);
              entryDate.setHours(0, 0, 0, 0);
              if (entryDate.getTime() === dateTime) {
                monthCompletedCount++;
                break;
              }
            }
          }
        }
      }

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      monthData.push({
        label: year !== currentYear ? `${monthNames[month]} ${year}` : monthNames[month],
        monthName: monthNames[month],
        year: year,
        completed: monthCompletedCount,
        total: monthTotalPossible
      });
    }

    return monthData;
  };

  const getCustomRangeData = () => {
    if (!customStartDate || !customEndDate) return [];

    const data = [];
    const daysDiff = Math.ceil((customEndDate - customStartDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // If range is 7 days or less, show daily breakdown
    if (daysDiff <= 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(customStartDate);
        date.setDate(customStartDate.getDate() + i);
        date.setHours(0, 0, 0, 0);
        const dateTime = date.getTime();

        let completedCount = 0;
        for (let h = 0; h < activeHabits.length; h++) {
          const habit = activeHabits[h];
          for (let e = 0; e < habit.completionHistory.length; e++) {
            const entry = habit.completionHistory[e];
            if (entry.completed) {
              const entryDate = new Date(entry.date);
              entryDate.setHours(0, 0, 0, 0);
              if (entryDate.getTime() === dateTime) {
                completedCount++;
                break;
              }
            }
          }
        }

        data.push({
          day: days[date.getDay()],
          date: date.getDate(),
          completed: completedCount,
          total: activeHabits.length
        });
      }
    } else {
      // If range spans multiple months, show monthly breakdown
      const startMonth = customStartDate.getMonth();
      const startYear = customStartDate.getFullYear();
      const endMonth = customEndDate.getMonth();
      const endYear = customEndDate.getFullYear();
      
      const monthsDiff = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
      
      if (monthsDiff > 1) {
        // Show monthly data
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 0; i < monthsDiff; i++) {
          const monthDate = new Date(startYear, startMonth + i, 1);
          const month = monthDate.getMonth();
          const year = monthDate.getFullYear();
          
          // Determine the actual start and end dates for this month within the custom range
          const monthStart = new Date(year, month, 1);
          const monthEnd = new Date(year, month + 1, 0);
          
          const actualStart = monthStart < customStartDate ? customStartDate : monthStart;
          const actualEnd = monthEnd > customEndDate ? customEndDate : monthEnd;
          
          let monthCompletedCount = 0;
          let monthTotalPossible = 0;

          // Count completions for this month
          const currentDate = new Date(actualStart);
          while (currentDate <= actualEnd) {
            const date = new Date(currentDate);
            date.setHours(0, 0, 0, 0);
            const dateTime = date.getTime();
            monthTotalPossible += activeHabits.length;

            for (let h = 0; h < activeHabits.length; h++) {
              const habit = activeHabits[h];
              for (let e = 0; e < habit.completionHistory.length; e++) {
                const entry = habit.completionHistory[e];
                if (entry.completed) {
                  const entryDate = new Date(entry.date);
                  entryDate.setHours(0, 0, 0, 0);
                  if (entryDate.getTime() === dateTime) {
                    monthCompletedCount++;
                    break;
                  }
                }
              }
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
          }

          data.push({
            label: year !== new Date().getFullYear() ? `${monthNames[month]} ${year}` : monthNames[month],
            monthName: monthNames[month],
            year: year,
            completed: monthCompletedCount,
            total: monthTotalPossible
          });
        }
      } else {
        // If within same month, group by weeks
        const weeksCount = Math.ceil(daysDiff / 7);
        for (let week = 0; week < weeksCount; week++) {
          let weekCompletedCount = 0;
          let weekTotalPossible = 0;
          const weekStart = new Date(customStartDate);
          weekStart.setDate(customStartDate.getDate() + (week * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          // Don't go beyond end date
          if (weekEnd > customEndDate) {
            weekEnd.setTime(customEndDate.getTime());
          }

          const currentDate = new Date(weekStart);
          while (currentDate <= weekEnd) {
            const date = new Date(currentDate);
            date.setHours(0, 0, 0, 0);
            const dateTime = date.getTime();
            weekTotalPossible += activeHabits.length;

            for (let h = 0; h < activeHabits.length; h++) {
              const habit = activeHabits[h];
              for (let e = 0; e < habit.completionHistory.length; e++) {
                const entry = habit.completionHistory[e];
                if (entry.completed) {
                  const entryDate = new Date(entry.date);
                  entryDate.setHours(0, 0, 0, 0);
                  if (entryDate.getTime() === dateTime) {
                    weekCompletedCount++;
                    break;
                  }
                }
              }
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
          }

          data.push({
            label: `Week ${week + 1}`,
            dateRange: `${weekStart.getDate()}/${weekStart.getMonth() + 1}-${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
            completed: weekCompletedCount,
            total: weekTotalPossible
          });
        }
      }
    }

    return data;
  };

  const getTotalCompletions = () => {
    const { startDate, endDate } = getDateRange();
    let total = 0;
    
    // Create separate date objects for comparison to avoid mutation
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    
    console.log('📊 getTotalCompletions calculation:');
    console.log('  Start time:', new Date(startTime));
    console.log('  End time:', new Date(endTime));
    
    activeHabits.forEach(habit => {
      habit.completionHistory.forEach(entry => {
        if (entry.completed) {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          const entryTime = entryDate.getTime();
          
          if (entryTime >= startTime && entryTime <= endTime) {
            total++;
            console.log('    ✓ Counted:', habit.name, 'on', new Date(entryTime));
          }
        }
      });
    });
    
    console.log('  Total completions:', total);
    
    return total;
  };

  const getAverageCompletionRate = () => {
    if (activeHabits.length === 0) return 0;
    
    const { startDate, endDate } = getDateRange();
    const totalCompletions = getTotalCompletions();
    
    // Calculate days in range more accurately
    // Normalize both dates to midnight for accurate day count
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const daysInRange = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalPossible = activeHabits.length * daysInRange;
    
    const rate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;
    
    // Debug logging
    console.log('📊 getAverageCompletionRate calculation:');
    console.log('  Start date:', startDate);
    console.log('  End date:', endDate);
    console.log('  Days in range:', daysInRange);
    console.log('  Active habits:', activeHabits.length);
    console.log('  Total completions:', totalCompletions);
    console.log('  Total possible:', totalPossible);
    console.log('  Calculation:', totalCompletions, '/', totalPossible, '=', (totalCompletions / totalPossible * 100).toFixed(2) + '%');
    console.log('  Rate (rounded):', rate + '%');
    
    return rate;
  };

  const getFilteredAverageStreak = () => {
    if (activeHabits.length === 0) return 0;
    
    const { startDate, endDate } = getDateRange();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    let totalStreak = 0;
    
    activeHabits.forEach(habit => {
      let currentStreak = 0;
      let maxStreak = 0;
      
      // Sort completion history by date
      const sortedHistory = [...habit.completionHistory]
        .filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          const entryTime = entryDate.getTime();
          return entryTime >= startTime && entryTime <= endTime;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      sortedHistory.forEach((entry, index) => {
        if (entry.completed) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      
      totalStreak += maxStreak;
    });
    
    return Math.round(totalStreak / activeHabits.length);
  };

  const getFilteredBestStreak = () => {
    if (activeHabits.length === 0) return 0;
    
    const { startDate, endDate } = getDateRange();
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    let bestStreak = 0;
    
    activeHabits.forEach(habit => {
      let currentStreak = 0;
      let maxStreak = 0;
      
      const sortedHistory = [...habit.completionHistory]
        .filter(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          const entryTime = entryDate.getTime();
          return entryTime >= startTime && entryTime <= endTime;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      sortedHistory.forEach((entry) => {
        if (entry.completed) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
      
      bestStreak = Math.max(bestStreak, maxStreak);
    });
    
    return bestStreak;
  };

  const { categoryCount, categoryCompleted } = getCategoryStats();
  const topStreaks = getTopStreaks();
  const longestStreaks = getLongestStreaks();
  const todayData = getTodayData();
  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const customRangeData = getCustomRangeData();
  
  // Determine which data to display based on filter
  let displayData = weeklyData;
  if (globalFilter === 'today') displayData = todayData;
  else if (globalFilter === 'week') displayData = weeklyData;
  else if (globalFilter === 'month') displayData = monthlyData;
  else if (globalFilter === 'custom') displayData = customRangeData;
  
  const totalCompletions = getTotalCompletions();
  const avgCompletionRate = getAverageCompletionRate();
  const avgStreak = getFilteredAverageStreak();
  const bestStreak = getFilteredBestStreak();

  // Console log for debugging
  console.log('=== ANALYTICS DATA ===');
  console.log('Current filter:', globalFilter);
  console.log('Date range:', getDateRange());
  console.log('Total habits:', habits.length);
  console.log('Active habits:', activeHabits.length);
  console.log('Total completions:', totalCompletions);
  console.log('Avg completion rate %:', avgCompletionRate);
  console.log('Avg streak:', avgStreak);
  console.log('Best streak:', bestStreak);
  console.log('Display data:', displayData);
  
  if (globalFilter === 'today') {
    const todayData = getTodayData();
    console.log('Today specific data:', todayData);
    console.log('Today completed:', todayData[0]?.completed);
    console.log('Today total:', todayData[0]?.total);
    console.log('Today percentage:', todayData[0]?.total > 0 ? Math.round((todayData[0]?.completed / todayData[0]?.total) * 100) : 0);
  }
  
  if (globalFilter === 'week') {
    console.log('Weekly data:', weeklyData);
    const weekTotal = weeklyData.reduce((sum, day) => sum + day.completed, 0);
    const weekPossible = weeklyData.reduce((sum, day) => sum + day.total, 0);
    console.log('Week total completions:', weekTotal);
    console.log('Week total possible:', weekPossible);
    console.log('Week percentage:', weekPossible > 0 ? Math.round((weekTotal / weekPossible) * 100) : 0);
  }
  
  console.log('======================');

  return (
    <PageLayout
      toggleSidebar={toggleSidebar}
      sidebarOpen={sidebarOpen}
      title="Analytics & Insights"
    >
      <div className="analytics-content">
        {/* Global Date Filter */}
        <div className="global-filter-bar">
          <div className="filter-label">
            <span className="filter-icon">📊</span>
            <span>Analytics Dashboard</span>
          </div>
          <div className="date-filter-dropdown" ref={dropdownRef}>
            <button className="filter-dropdown-btn" onClick={() => setShowFilterMenu(!showFilterMenu)}>
              <span className="calendar-icon">📅</span>
              <span className="filter-text">
                {globalFilter === 'today' && 'Today'}
                {globalFilter === 'week' && 'This Week'}
                {globalFilter === 'month' && 'This Month'}
                {globalFilter === 'custom' && formatDateRange()}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showFilterMenu && (
              <div className="filter-dropdown-menu">
                <button 
                  className={globalFilter === 'today' ? 'active' : ''} 
                  onClick={() => { setGlobalFilter('today'); setShowFilterMenu(false); }}
                >
                  📅 Today
                </button>
                <button 
                  className={globalFilter === 'week' ? 'active' : ''} 
                  onClick={() => { setGlobalFilter('week'); setShowFilterMenu(false); }}
                >
                  📊 This Week
                </button>
                <button 
                  className={globalFilter === 'month' ? 'active' : ''} 
                  onClick={() => { setGlobalFilter('month'); setShowFilterMenu(false); }}
                >
                  📅 This Month
                </button>
                <button 
                  className={globalFilter === 'custom' ? 'active' : ''} 
                  onClick={handleCustomRangeClick}
                >
                  🗓️ Custom Range
                </button>
              </div>
            )}
          </div>

          {/* Custom Date Range Picker */}
          {showDatePicker && (
            <div className="date-picker-overlay" ref={datePickerRef}>
              <div className="date-picker-container">
                <div className="date-picker-header">
                  <button className="back-btn" onClick={() => setShowDatePicker(false)}>
                    ← Back
                  </button>
                  <span className="date-picker-title">Select date range</span>
                </div>
                
                <div className="selected-range-display">
                  <span className="calendar-icon">📅</span>
                  <span className="range-text">{formatDateRange()}</span>
                  <button className="refresh-btn" onClick={() => { setCustomStartDate(null); setCustomEndDate(null); }}>
                    🔄
                  </button>
                </div>

                <div className="calendars-container">
                  {[0, 1].map((offset) => {
                    const { monthName, days } = renderCalendar(offset);
                    return (
                      <div key={offset} className="calendar-month">
                        <div className="calendar-header">
                          {offset === 0 && (
                            <button 
                              className="nav-btn" 
                              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            >
                              ‹
                            </button>
                          )}
                          <span className="month-name">{monthName}</span>
                          {offset === 1 && (
                            <button 
                              className="nav-btn" 
                              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            >
                              ›
                            </button>
                          )}
                        </div>
                        
                        <div className="calendar-grid">
                          <div className="day-header">Su</div>
                          <div className="day-header">Mo</div>
                          <div className="day-header">Tu</div>
                          <div className="day-header">We</div>
                          <div className="day-header">Th</div>
                          <div className="day-header">Fr</div>
                          <div className="day-header">Sa</div>
                          
                          {days.map((dayObj, idx) => (
                            <button
                              key={idx}
                              className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} 
                                         ${isDateSelected(dayObj.date) ? 'selected' : ''} 
                                         ${isDateInRange(dayObj.date) ? 'in-range' : ''}`}
                              onClick={() => dayObj.isCurrentMonth && handleDateClick(dayObj.date)}
                              disabled={!dayObj.isCurrentMonth}
                            >
                              {dayObj.day}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="date-picker-footer">
                  <button className="cancel-btn" onClick={() => setShowDatePicker(false)}>
                    Cancel
                  </button>
                  <button 
                    className="apply-btn" 
                    onClick={() => setShowDatePicker(false)}
                    disabled={!customStartDate || !customEndDate}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Key Metrics */}
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <h3>{totalCompletions}</h3>
              <p>Total Completions</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <h3>{avgCompletionRate}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🔥</div>
            <div className="metric-content">
              <h3>{avgStreak}</h3>
              <p>Avg Streak (days)</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⭐</div>
            <div className="metric-content">
              <h3>{bestStreak}</h3>
              <p>Best Streak</p>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          {/* Activity Chart */}
          <div className="chart-card full-width">
            <div className="card-header">
              <h3>📈 {
                globalFilter === 'today' ? 'Today\'s' : 
                globalFilter === 'week' ? 'Weekly' : 
                globalFilter === 'month' ? 'Monthly' : 
                'Custom Range'
              } Activity</h3>
            </div>
            <div className="bar-chart">
              {displayData.length > 0 ? displayData.map((data, index) => {
                const percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0;
                
                // Create meaningful tooltip for all views
                let tooltipText = '';
                if (globalFilter === 'today') {
                  tooltipText = `Today: ${data.completed} out of ${data.total} habits completed (${Math.round(percentage)}%)`;
                } else if (globalFilter === 'week') {
                  const dayName = data.day;
                  tooltipText = `${dayName}: ${data.completed} out of ${data.total} habits completed (${Math.round(percentage)}%)`;
                } else if (globalFilter === 'month') {
                  const monthLabel = data.monthName || data.label;
                  const yearLabel = data.year ? ` ${data.year}` : '';
                  tooltipText = `${monthLabel}${yearLabel}: ${data.completed} completions (${Math.round(percentage)}%)`;
                } else if (globalFilter === 'custom') {
                  const label = data.label || data.day;
                  tooltipText = `${label}: ${data.completed} completions (${Math.round(percentage)}%)`;
                }
                
                return (
                  <div key={index} className="bar-item">
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ height: `${percentage}%` }}
                        title={tooltipText}
                      ></div>
                    </div>
                    <div className="bar-label">
                      {data.day || data.label}
                    </div>
                  </div>
                );
              }) : (
                <div className="empty-state-small">No data available for selected range</div>
              )}
            </div>
          </div>

          {/* Category Performance */}
          <div className="chart-card">
            <div className="card-header">
              <h3>📂 Category Performance</h3>
            </div>
            <div className="category-performance">
              {Object.entries(categoryCount).map(([category, count]) => {
                const completed = categoryCompleted[category] || 0;
                const percentage = count > 0 ? Math.round((completed / (count * 7)) * 100) : 0;
                return (
                  <div key={category} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{category}</span>
                      <span className="category-stats">{count} habits</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${percentage}%`,
                          background: getCategoryColor(category)
                        }}
                      ></div>
                    </div>
                    <div className="category-footer">
                      <span>{completed} completions</span>
                      <span>{percentage}% rate</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Streaks Leaderboard */}
          <div className="chart-card">
            <div className="card-header">
              <h3>🔥 Current Streaks</h3>
            </div>
            <div className="leaderboard">
              {topStreaks.length > 0 ? topStreaks.map((habit, index) => (
                <div key={habit._id} className="leaderboard-item">
                  <div className="rank-badge" style={{ background: getRankColor(index) }}>
                    {index + 1}
                  </div>
                  <div className="habit-details">
                    <h4>{habit.name}</h4>
                    <span className="habit-category">{habit.category}</span>
                  </div>
                  <div className="streak-badge" style={{ display: 'inline-flex' }}>
                    🔥 {habit.filteredStreak !== undefined ? habit.filteredStreak : 0}
                  </div>
                </div>
              )) : (
                <div className="empty-state-small">No active streaks yet</div>
              )}
            </div>
          </div>

          {/* Best Streaks Ever */}
          <div className="chart-card">
            <div className="card-header">
              <h3>🏆 Best Streaks</h3>
            </div>
            <div className="leaderboard">
              {longestStreaks.length > 0 ? longestStreaks.map((habit, index) => (
                <div key={habit._id} className="leaderboard-item">
                  <div className="rank-badge trophy" style={{ background: getTrophyColor(index) }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div className="habit-details">
                    <h4>{habit.name}</h4>
                    <span className="habit-category">{habit.category}</span>
                  </div>
                  <div className="streak-badge gold" style={{ display: 'inline-flex' }}>
                    🏆 {habit.filteredLongestStreak !== undefined ? habit.filteredLongestStreak : 0}
                  </div>
                </div>
              )) : (
                <div className="empty-state-small">No streaks recorded yet</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    Health: '#48bb78',
    Fitness: '#ed8936',
    Learning: '#4299e1',
    Productivity: '#667eea',
    Mindfulness: '#9f7aea',
    Other: '#718096',
  };
  return colors[category] || '#718096';
};

const getRankColor = (index) => {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#667eea', '#9f7aea'];
  return colors[index] || '#718096';
};

const getTrophyColor = (index) => {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#667eea', '#9f7aea'];
  return colors[index] || '#718096';
};

export default Analytics;
