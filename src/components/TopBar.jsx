import React from 'react';
import { FaBars } from 'react-icons/fa';
import './TopBar.css';

const TopBar = ({ title, toggleSidebar }) => {
  return (
    <div className="topbar">
      <button className="sidebar-toggle-topbar" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions">
        {/* Add notification bell or other actions here */}
      </div>
    </div>
  );
};

export default TopBar;
