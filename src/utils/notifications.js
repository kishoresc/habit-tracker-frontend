// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Show browser notification
export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options,
    });
  }
};

// Check if user has been inactive for 10 hours
export const checkInactivity = () => {
  const lastActive = localStorage.getItem('lastActive');
  
  if (!lastActive) {
    localStorage.setItem('lastActive', Date.now());
    return false;
  }

  const tenHours = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
  const timeSinceActive = Date.now() - parseInt(lastActive);

  if (timeSinceActive >= tenHours) {
    return true;
  }

  return false;
};

// Update last active timestamp
export const updateLastActive = () => {
  localStorage.setItem('lastActive', Date.now());
};

// Start inactivity checker
export const startInactivityChecker = (callback) => {
  // Check every hour
  const interval = setInterval(() => {
    if (checkInactivity()) {
      callback();
    }
  }, 60 * 60 * 1000); // Check every hour

  return interval;
};
