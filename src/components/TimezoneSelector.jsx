import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment-timezone';
import './TimezoneSelector.css';

const TimezoneSelector = ({ value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timezones, setTimezones] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get all timezone names
    const tzNames = moment.tz.names();
    
    // Create timezone list with UTC offsets
    const tzList = tzNames.map(tz => {
      const offset = moment.tz(tz).format('Z');
      return {
        value: tz,
        label: `${tz} (UTC${offset})`,
        offset: offset
      };
    });

    setTimezones(tzList);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTimezones = timezones.filter(tz =>
    tz.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTimezone = timezones.find(tz => tz.value === value);

  const handleSelect = (timezone) => {
    onChange(timezone.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="timezone-selector" ref={dropdownRef}>
      <div 
        className="timezone-selector-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="timezone-icon">🌍</div>
        <div className="timezone-value">
          {selectedTimezone ? selectedTimezone.label : 'Select timezone...'}
        </div>
        <div className={`timezone-arrow ${isOpen ? 'open' : ''}`}>▼</div>
      </div>

      {isOpen && (
        <div className="timezone-dropdown">
          <div className="timezone-search">
            <input
              type="text"
              placeholder="Search timezone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div className="timezone-list">
            {filteredTimezones.length > 0 ? (
              filteredTimezones.map((tz) => (
                <div
                  key={tz.value}
                  className={`timezone-option ${tz.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(tz)}
                >
                  {tz.label}
                </div>
              ))
            ) : (
              <div className="timezone-no-results">No timezones found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneSelector;
