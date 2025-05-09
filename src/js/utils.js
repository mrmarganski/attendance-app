// Utility functions with no external dependencies

// Notification system
export function setupNotifications() {
  // Create toast container if it doesn't exist
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col items-end space-y-2';
    document.body.appendChild(container);
  }
}

export function showNotification(title, message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `${colors[type]} text-white p-4 rounded shadow-lg transform transition-transform duration-500 mb-2 max-w-md`;
  notification.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0">
        ${type === 'success' ? '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : ''}
        ${type === 'error' ? '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' : ''}
        ${type === 'info' ? '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' : ''}
        ${type === 'warning' ? '<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>' : ''}
      </div>
      <div class="ml-3 flex-1">
        <h3 class="font-medium">${title}</h3>
        <p class="mt-1 text-sm">${message}</p>
      </div>
    </div>
  `;
  
  document.getElementById('toast-container').appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('translate-y-8', 'opacity-0');
    setTimeout(() => {
      if (document.getElementById('toast-container')?.contains(notification)) {
        document.getElementById('toast-container').removeChild(notification);
      }
    }, 500);
  }, 3000);
}

// Date and time utilities
export function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return "N/A";
  
  // Parse times
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let durationMins = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  if (durationMins < 0) durationMins += 24 * 60; // Handle overnight sessions
  
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  
  return `${hours}h ${mins}m`;
}

// Format date for display
export function formatDateDisplay(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date)) {
      console.error("Invalid date:", dateString);
      return "Invalid date";
    }
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString || "Unknown date";
  }
}

// Student ID normalization
export function normalizeStudentId(rawId) {
  // First trim any whitespace
  const trimmedId = String(rawId).trim();
  
  // Handle case where ID already starts with 'S' or 's'
  if (/^[sS]\d+$/.test(trimmedId)) {
    return trimmedId.toUpperCase(); // Normalize to uppercase S
  } 
  
  // If it's just a number, add the 'S' prefix
  if (/^\d+$/.test(trimmedId)) {
    return 'S' + trimmedId;
  }
  
  // Return as-is if it's in another format
  return trimmedId;
}

// Local storage utilities
export function saveData() {
  try {
    localStorage.setItem('attendance-app-data', JSON.stringify(window.appState));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

export function loadData() {
  try {
    const data = localStorage.getItem('attendance-app-data');
    if (data) {
      window.appState = JSON.parse(data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error loading data:', error);
    return false;
  }
}

// Helper function to set up confirmation handlers
export function setupConfirmationHandlers(confirmCallback, cancelCallback = null) {
  // Get the modal elements
  const confirmModal = document.getElementById('confirm-modal');
  const proceedBtn = document.getElementById('confirm-proceed');
  const cancelBtn = document.getElementById('confirm-cancel');
  
  if (!confirmModal || !proceedBtn || !cancelBtn) {
    console.error('Confirmation modal elements not found');
    return;
  }
  
  // Create new buttons to avoid event listener issues
  const newProceedBtn = proceedBtn.cloneNode(true);
  proceedBtn.parentNode.replaceChild(newProceedBtn, proceedBtn);
  
  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  
  // Set up click handlers
  newProceedBtn.addEventListener('click', function() {
    if (confirmCallback) confirmCallback();
    confirmModal.classList.add('hidden');
  });
  
  newCancelBtn.addEventListener('click', function() {
    if (cancelCallback) cancelCallback();
    confirmModal.classList.add('hidden');
  });
}

// Add activity logging
export function logActivity(action, details = '') {
  const timestamp = new Date().toISOString();
  if (!window.appState.activityLog) {
    window.appState.activityLog = [];
  }
  
  window.appState.activityLog.unshift({
    timestamp,
    action,
    details
  });
  
  // Limit log size
  if (window.appState.activityLog.length > 100) {
    window.appState.activityLog = window.appState.activityLog.slice(0, 100);
  }
  
  updateActivityLog();
  saveData();
}

// Update activity log display
export function updateActivityLog() {
  const container = document.getElementById('activity-log');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!window.appState.activityLog || window.appState.activityLog.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'py-2 text-center text-gray-500 dark:text-gray-400';
    emptyMessage.textContent = 'No activity logged yet';
    container.appendChild(emptyMessage);
    return;
  }
  
  window.appState.activityLog.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded';
    
    const timestamp = new Date(entry.timestamp);
    const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    li.innerHTML = `
      <span class="text-xs text-gray-500 dark:text-gray-400">[${dateString} ${timeString}]</span>
      <span class="font-medium">${entry.action}:</span>
      <span>${entry.details}</span>
    `;
    
    container.appendChild(li);
  });
}

// Initialize today's check-ins from attendance records
export function initializeTodayCheckIns() {
  const today = getCurrentDate();
  window.appState.todayCheckIns = window.appState.attendance.filter(record => record.date === today) || [];
}

// Assign the function to the global updateUI object
window.updateUI.updateActivityLog = updateActivityLog;