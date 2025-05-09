// Admin module

export function initializeAdmin() {
  console.log('Admin module initialized');
  
  // Initialize admin login button in admin tab
  const adminLoginBtn = document.getElementById('admin-login-btn');
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
      document.getElementById('admin-login-modal').classList.remove('hidden');
    });
  }
  
  // Initialize protected sections login buttons
  document.querySelectorAll('.show-admin-login').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('admin-login-modal').classList.remove('hidden');
    });
  });
  
  // Initialize admin login modal close button
  const cancelLoginBtn = document.getElementById('cancel-admin-login');
  if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', () => {
      document.getElementById('admin-login-modal').classList.add('hidden');
      document.getElementById('admin-password').value = '';
      document.getElementById('admin-login-error').classList.add('hidden');
    });
  }
  
  // Initialize admin login form
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const password = document.getElementById('admin-password').value;
      const error = document.getElementById('admin-login-error');
      
      // Default password is "admin123" if not set in settings
      const adminPassword = window.appState.appSettings?.adminPassword || 'admin123';
      
      if (password === adminPassword) {
        // Success
        window.appState.adminLoggedIn = true;
        document.getElementById('admin-login-modal').classList.add('hidden');
        
        // Show admin status indicator
        document.getElementById('admin-status-indicator').classList.remove('hidden');
        
        // Unlock admin features
        document.querySelectorAll('.admin-only').forEach(el => {
          el.classList.remove('hidden');
        });
        
        // Hide admin login prompts
        document.querySelectorAll('.admin-login-required').forEach(el => {
          el.classList.add('hidden');
        });
        
        window.utils.logActivity('Admin', 'Admin logged in');
        window.utils.showNotification('Admin Access', 'Administrator access granted', 'success');
      } else {
        // Failed login
        error.textContent = 'Incorrect password';
        error.classList.remove('hidden');
        
        window.utils.logActivity('Admin', 'Failed admin login attempt');
      }
    });
  }
  
  // Set up admin logout button
  const adminLogoutBtn = document.getElementById('admin-logout');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', logoutAdmin);
  }
  
  // Initialize settings form
  const updateSettingsBtn = document.getElementById('update-settings');
  if (updateSettingsBtn) {
    updateSettingsBtn.addEventListener('click', updateSettings);
  }
  
  // Initialize data management buttons
  setupDataManagementButtons();
  
  // Initialize password toggle
  setupPasswordToggle();
  
  // Update activity log
  window.utils.updateActivityLog();
  
  // Display current settings
  displayCurrentSettings();
}

function logoutAdmin() {
  window.appState.adminLoggedIn = false;
  
  // Hide admin status indicator
  document.getElementById('admin-status-indicator').classList.add('hidden');
  
  // Hide admin-only elements
  document.querySelectorAll('.admin-only').forEach(el => {
    el.classList.add('hidden');
  });
  
  // Show admin login prompts
  document.querySelectorAll('.admin-login-required').forEach(el => {
    el.classList.remove('hidden');
  });
  
  // If edit mode is enabled, disable it
  if (window.appState.editModeEnabled) {
    window.appState.editModeEnabled = false;
    const editButton = document.getElementById('toggle-edit-mode');
    if (editButton) {
      editButton.innerHTML = '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Enable Admin Edit';
      editButton.classList.remove('bg-red-600');
      editButton.classList.add('bg-blue-600');
      if (window.updateUI.updateCheckInList) {
        window.updateUI.updateCheckInList();
      }
    }
  }
  
  window.utils.showNotification('Logged Out', 'Admin session ended', 'success');
  window.utils.logActivity('Admin', 'Admin logged out');
}

function setupPasswordToggle() {
  // Login modal password toggle
  const loginPasswordToggle = document.getElementById('login-password-toggle');
  const adminPassword = document.getElementById('admin-password');
  
  if (loginPasswordToggle && adminPassword) {
    loginPasswordToggle.addEventListener('click', function() {
      if (adminPassword.type === 'password') {
        adminPassword.type = 'text';
        this.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        `;
      } else {
        adminPassword.type = 'password';
        this.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        `;
      }
    });
  }
  
  // Settings page password toggle
  const settingsPasswordToggle = document.getElementById('toggle-password');
  const passwordField = document.getElementById('admin-password-field');
  
  if (settingsPasswordToggle && passwordField) {
    settingsPasswordToggle.addEventListener('click', function() {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        this.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        `;
      } else {
        passwordField.type = 'password';
        this.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        `;
      }
    });
  }
}

function displayCurrentSettings() {
  // Fill in the settings form with current values
  const settings = window.appState.appSettings;
  
  const badgeTitleField = document.getElementById('badge-title');
  if (badgeTitleField) {
    badgeTitleField.value = settings.badgeTitle || 'Pomperaug Robotics Team 2064';
  }
  
  const badgeYearField = document.getElementById('badge-year');
  if (badgeYearField) {
    badgeYearField.value = settings.badgeYear || '2023-2024';
  }
  
  const badgeColorField = document.getElementById('badge-color');
  if (badgeColorField) {
    badgeColorField.value = settings.badgeColor || '#E83142';
  }
  
  const saveLocalCheckbox = document.getElementById('save-local');
  if (saveLocalCheckbox) {
    saveLocalCheckbox.checked = settings.saveLocal !== false; // Default to true
  }
}

function updateSettings() {
  // Get settings values
  const password = document.getElementById('admin-password-field')?.value;
  const saveLocal = document.getElementById('save-local')?.checked;
  const badgeTitle = document.getElementById('badge-title')?.value;
  const badgeYear = document.getElementById('badge-year')?.value;
  const badgeColor = document.getElementById('badge-color')?.value;
  
  // Initialize settings object if it doesn't exist
  if (!window.appState.appSettings) {
    window.appState.appSettings = {};
  }
  
  // Update settings
  if (password && password.trim() !== '') {
    window.appState.appSettings.adminPassword = password;
  }
  
  if (saveLocal !== undefined) {
    window.appState.appSettings.saveLocal = saveLocal;
  }
  
  if (badgeTitle) {
    window.appState.appSettings.badgeTitle = badgeTitle;
  }
  
  if (badgeYear) {
    window.appState.appSettings.badgeYear = badgeYear;
  }
  
  if (badgeColor) {
    window.appState.appSettings.badgeColor = badgeColor;
  }
  
  // Save changes
  window.utils.saveData();
  
  // Show confirmation
  window.utils.showNotification('Settings Updated', 'Your settings have been saved successfully.', 'success');
  window.utils.logActivity('Admin', 'Updated system settings');
}

function setupDataManagementButtons() {
  // Export data button
  const exportDataBtn = document.getElementById('export-data');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', exportData);
  }
  
  // Import data button
  const importDataBtn = document.getElementById('import-data');
  if (importDataBtn) {
    importDataBtn.addEventListener('click', showImportDataModal);
  }
  
  // Clear attendance button
  const clearAttendanceBtn = document.getElementById('clear-attendance');
  if (clearAttendanceBtn) {
    clearAttendanceBtn.addEventListener('click', () => {
      // Setup confirmation
      document.getElementById('confirm-title').textContent = 'Clear All Attendance';
      document.getElementById('confirm-message').textContent = 
        'This will delete ALL attendance records. This action cannot be undone. Are you sure?';
      
      // Show modal
      document.getElementById('confirm-modal').classList.remove('hidden');
      
      // Set up confirmation handlers
      window.utils.setupConfirmationHandlers(function() {
        // Clear attendance data
        window.appState.attendance = [];
        window.appState.absences = [];
        window.appState.todayCheckIns = [];
        
        // Update UI
        if (window.updateUI.updateCheckInList) {
          window.updateUI.updateCheckInList();
        }
        window.utils.saveData();
        
        // Hide modal
        document.getElementById('confirm-modal').classList.add('hidden');
        
        // Notification
        window.utils.showNotification('Data Cleared', 'All attendance records have been deleted', 'success');
        window.utils.logActivity('Admin', 'Cleared all attendance records');
      });
    });
  }
  
  // Clear students button
  const clearStudentsBtn = document.getElementById('clear-students');
  if (clearStudentsBtn) {
    clearStudentsBtn.addEventListener('click', () => {
      // Setup confirmation
      document.getElementById('confirm-title').textContent = 'Delete All Students';
      document.getElementById('confirm-message').textContent = 
        'This will delete ALL student data and related attendance records. This action cannot be undone. Are you sure?';
      
      // Show modal
      document.getElementById('confirm-modal').classList.remove('hidden');
      
      // Set up confirmation handlers
      window.utils.setupConfirmationHandlers(function() {
        // Clear student data
        window.appState.students = [];
        window.appState.attendance = [];
        window.appState.absences = [];
        window.appState.todayCheckIns = [];
        
        // Update UI
        if (window.updateUI.updateStudentList) {
          window.updateUI.updateStudentList();
        }
        if (window.updateUI.updateCheckInList) {
          window.updateUI.updateCheckInList();
        }
        window.utils.saveData();
        
        // Hide modal
        document.getElementById('confirm-modal').classList.add('hidden');
        
        // Notification
        window.utils.showNotification('Data Cleared', 'All student data has been deleted', 'success');
        window.utils.logActivity('Admin', 'Deleted all student data');
      });
    });
  }
  
  // Clear logs button
  const clearLogsBtn = document.getElementById('clear-logs');
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      // Setup confirmation
      document.getElementById('confirm-title').textContent = 'Clear Activity Logs';
      document.getElementById('confirm-message').textContent = 'This will delete all activity logs. Continue?';
      
      // Show modal
      document.getElementById('confirm-modal').classList.remove('hidden');
      
      // Set up confirmation handlers
      window.utils.setupConfirmationHandlers(function() {
        // Clear logs
        window.appState.activityLog = [];
        
        // Update UI
        if (window.updateUI.updateActivityLog) {
          window.updateUI.updateActivityLog();
        }
        window.utils.saveData();
        
        // Hide modal
        document.getElementById('confirm-modal').classList.add('hidden');
        
        // Notification
        window.utils.showNotification('Logs Cleared', 'All activity logs have been cleared', 'success');
      });
    });
  }
}

function exportData() {
  // Prepare data for export
  const exportData = {
    students: window.appState.students,
    attendance: window.appState.attendance,
    absences: window.appState.absences,
    settings: window.appState.appSettings,
    activityLog: window.appState.activityLog,
    customization: window.appState.badgeCustomization
  };
  
  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Create download link
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `attendance_backup_${date}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
  
  window.utils.showNotification('Export Complete', 'Data exported successfully', 'success');
  window.utils.logActivity('Admin', 'Exported data to file');
}

function showImportDataModal() {
  // Create modal for data import
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 class="text-lg font-semibold mb-4">Import Data</h3>
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Paste the JSON data from a previous export.
      </p>
      <textarea class="w-full h-32 p-2 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white mb-4"></textarea>
      <div class="flex justify-end space-x-2">
        <button class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-opacity-90 close-btn">
          Cancel
        </button>
        <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-opacity-90 import-btn">
          Import
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle import button
  modal.querySelector('.import-btn').addEventListener('click', function() {
    try {
      const jsonString = modal.querySelector('textarea').value.trim();
      if (!jsonString) {
        window.utils.showNotification('Error', 'No data entered', 'error');
        return;
      }
      
      const data = JSON.parse(jsonString);
      
      // Update app state with imported data
      if (data.students) window.appState.students = data.students;
      if (data.attendance) window.appState.attendance = data.attendance;
      if (data.absences) window.appState.absences = data.absences;
      if (data.settings) window.appState.appSettings = { ...window.appState.appSettings, ...data.settings };
      if (data.customization) window.appState.badgeCustomization = { ...window.appState.badgeCustomization, ...data.customization };
      if (data.activityLog) window.appState.activityLog = data.activityLog;
      
      // Update UI
      if (window.updateUI.updateStudentList) window.updateUI.updateStudentList();
      if (window.updateUI.updateCheckInList) window.updateUI.updateCheckInList();
      if (window.updateUI.updateActivityLog) window.updateUI.updateActivityLog();
      
      // Close modal
      document.body.removeChild(modal);
      
      window.utils.showNotification('Import Complete', 'Data imported successfully', 'success');
      window.utils.logActivity('Admin', 'Imported data from clipboard');
      window.utils.saveData();
      
    } catch (error) {
      window.utils.showNotification('Import Error', 'Invalid data format: ' + error.message, 'error');
    }
  });
  
  // Handle close button
  modal.querySelector('.close-btn').addEventListener('click', function() {
    document.body.removeChild(modal);
  });
}