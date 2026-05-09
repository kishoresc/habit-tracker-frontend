import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import HabitList from '../components/HabitList';
import AddHabitModal from '../components/AddHabitModal';
import './AllHabits.css';

const AllHabits = ({ toggleSidebar, sidebarOpen }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('active');

  return (
    <PageLayout
      toggleSidebar={toggleSidebar}
      sidebarOpen={sidebarOpen}
      title="All Habits"
    >
      <div className="allhabits-content">
        <div className="habits-header">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inactive
            </button>
            <button 
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed Today
            </button>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Add New Habit
          </button>
        </div>

        <div className="habits-grid">
          <HabitList filter={filter} />
        </div>
      </div>

      {showAddModal && (
        <AddHabitModal onClose={() => setShowAddModal(false)} />
      )}
    </PageLayout>
  );
};

export default AllHabits;
