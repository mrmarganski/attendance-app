// Import styles
import './css/styles.css'

// Global app state
window.appState = {
  students: [
    { studentId: "S1001", firstName: "John", lastName: "Smith", grade: "Grade 10" },
    { studentId: "S1002", firstName: "Emma", lastName: "Johnson", grade: "Grade 11" },
    { studentId: "S1003", firstName: "Michael", lastName: "Williams", grade: "Grade 11" }
  ],
  todayCheckIns: [],
  attendance: [],
  absences: [],
  activityLog: [],
  adminLoggedIn: false,
  editModeEnabled: false,
  appSettings: {
    badgeTitle: "Pomperaug Robotics Team 2064",
    badgeYear: "2023-2024",
    badgeColor: "#E83142",
    adminPassword: "admin123", // Default admin password
    saveLocal: true,
    darkMode: true
  },
  badgeCustomization: {
    patternStyle: 1,
    patternOpacity: 0.2,
    customLogo: null,
    useCustomLogo: false
  }
};

// UI update functions used across modules
window.updateUI = {
  updateStudentList: null, // Will be assigned in the students module
  updateCheckInList: null, // Will be assigned in the attendance module
  updateActivityLog: null  // Will be assigned in the utils module
};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Attendance Tracker initialized');
  
  try {
    // Import modules - using dynamic imports to avoid circular dependencies
    const utils = await import('./js/utils.js');
    const navigation = await import('./js/navigation.js');
    const attendance = await import('./js/attendance.js');
    const students = await import('./js/students.js');
    const admin = await import('./js/admin.js');
    
    // Set up global utility functions
    window.utils = utils;
    
    // Initialize utilities
    utils.setupNotifications();
    
    // Load saved data
    if (utils.loadData()) {
      utils.showNotification('Data Loaded', 'Your saved data has been loaded successfully', 'success');
    }
    
    // Initialize components
    navigation.setupTabNavigation();
    students.initializeStudents();
    attendance.initializeAttendance();
    admin.initializeAdmin();
    
    // Set up dark mode toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        // Save dark mode preference
        window.appState.appSettings.darkMode = document.documentElement.classList.contains('dark');
        utils.saveData();
      });
    }
    
    // Apply dark mode from settings
    if (window.appState.appSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Set current date display
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateDisplay.textContent = new Date().toLocaleDateString(undefined, options);
    }
    
    // Set up confirmation modal close button
    const cancelConfirmBtn = document.getElementById('confirm-cancel');
    if (cancelConfirmBtn) {
      cancelConfirmBtn.addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.add('hidden');
      });
    }
    
    // Log application start
    utils.logActivity('System', 'Application initialized');
    
    // Test button functionality (for development)
    const testButton = document.getElementById('test-button');
    if (testButton) {
      testButton.addEventListener('click', () => {
        utils.showNotification('Test Successful', 'Your app is working correctly!', 'success');
      });
    }
  } catch (error) {
    console.error('Error initializing application:', error);
    // Display error in UI so user knows something went wrong
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-500 text-white p-4 m-4 rounded';
    errorDiv.innerHTML = `<h2 class="text-lg font-bold">Initialization Error</h2><p>${error.message}</p>`;
    document.body.prepend(errorDiv);
  }
});