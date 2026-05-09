import React, { useState, useContext } from 'react';
import { HabitContext } from '../context/HabitContext';
import HabitCard from './HabitCard';
import './HabitList.css';

const HabitList = ({ filter = 'all' }) => {
  const { habits, isHabitCompletedToday } = useContext(HabitContext);
  const [currentPage, setCurrentPage] = useState(1);
  const habitsPerPage = 5;

  // Filter habits based on selected filter
  const filteredHabits = habits.filter(habit => {
    if (filter === 'active') {
      return habit.isActive !== false; // Show active habits (default is active)
    } else if (filter === 'inactive') {
      return habit.isActive === false; // Show inactive habits
    } else if (filter === 'completed') {
      return isHabitCompletedToday(habit); // Show only completed today
    }
    return true; // Show all habits if filter is 'all'
  });

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredHabits.length / habitsPerPage);
  const indexOfLastHabit = currentPage * habitsPerPage;
  const indexOfFirstHabit = indexOfLastHabit - habitsPerPage;
  const currentHabits = filteredHabits.slice(indexOfFirstHabit, indexOfLastHabit);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (filteredHabits.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3>No habits found</h3>
        <p>
          {filter === 'active' && 'No active habits yet. Start building positive habits!'}
          {filter === 'inactive' && 'No inactive habits.'}
          {filter === 'completed' && 'No habits completed today. Keep going!'}
          {filter === 'all' && 'No habits yet. Start building positive habits by adding your first one!'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="habit-list">
        {currentHabits.map((habit, index) => (
          <HabitCard 
            key={habit._id} 
            habit={habit} 
            serialNumber={indexOfFirstHabit + index + 1}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button 
            className="pagination-btn" 
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
};

export default HabitList;
