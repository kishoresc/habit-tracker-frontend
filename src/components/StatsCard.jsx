import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="stats-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stats-icon" style={{ background: `${color}20` }}>
        <span style={{ fontSize: '32px' }}>{icon}</span>
      </div>
      <div className="stats-content">
        <h3>{title}</h3>
        <p className="stats-value" style={{ color }}>{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
