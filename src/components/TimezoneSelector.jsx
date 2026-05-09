import React, { useState, useEffect, useRef, useMemo } from 'react';
import moment from 'moment-timezone';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './TimezoneSelector.css';

const TimezoneSelector = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTimezones, setFilteredTimezones] = useState([]);
  const dropdownRef = useRef(null);

  // Get all timezones (memoized to avoid recreating on every render)
  const allTimezones = useMemo(() => moment.tz.names(), []);

  useEffect(() => {
    // Filter timezones based on search term
    if (searchTerm) {
      const filtered = allTimezones.filter(tz =>
        tz.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTimezones(filtered);
    } else {
      setFilteredTimezones(allTimezones);
    }
  }, [searchTerm, allTimezones]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (timezone) => {
    onChange(timezone);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const getTimezoneDisplay = (tz) => {
    const offset = moment.tz(tz).format('Z');
    return `${tz} (UTC${offset})`;
  };

  return (
    <div className="timezone-selector" ref={dropdownRef}>
      <div
        className={`timezone-selector-input ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="timezone-value">
          {value ? getTimezoneDisplay(value) : 'Select timezone'}
        </span>
        <span className="timezone-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="timezone-dropdown">
          <div className="timezone-search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="timezone-search"
              placeholder="Search timezone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={handleClearSearch}>
                <FaTimes />
              </button>
            )}
          </div>

          <div className="timezone-list">
            {filteredTimezones.length > 0 ? (
              filteredTimezones.map((tz) => (
                <div
                  key={tz}
                  className={`timezone-option ${value === tz ? 'selected' : ''}`}
                  onClick={() => handleSelect(tz)}
                >
                  {getTimezoneDisplay(tz)}
                </div>
              ))
            ) : (
              <div className="timezone-no-results">
                No timezones found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneSelector;
