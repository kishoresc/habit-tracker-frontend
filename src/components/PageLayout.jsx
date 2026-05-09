import React from 'react';
import './PageLayout.css';

const PageLayout = ({ 
  toggleSidebar, 
  sidebarOpen, 
  title, 
  children,
  footer = null,
  showFooter = false 
}) => {
  return (
    <div className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
      <div className="page-layout">
        {/* Fixed Header */}
        <div className="page-fixed-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>{title}</h1>
        </div>

        {/* Scrollable Content */}
        <div className="page-scrollable-content">
          {children}
        </div>

        {/* Fixed Footer (Optional) */}
        {showFooter && footer && (
          <div className="page-fixed-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;
