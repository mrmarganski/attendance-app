// Tab navigation system - no external dependencies

export function setupTabNavigation() {
  // Tab navigation
  const tabLinks = document.querySelectorAll('#tabs a');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const tabId = link.getAttribute('data-tab');
      
      // Admin restriction check
      if (!window.appState.adminLoggedIn) {
        const restrictedTabs = ['students', 'badges', 'attendance', 'admin'];
        if (restrictedTabs.includes(tabId)) {
          // Show login modal
          document.getElementById('admin-login-modal').classList.remove('hidden');
          return;
        }
      }
      
      // Update active tab appearance
      tabLinks.forEach(l => {
        l.classList.remove('border-primary', 'text-primary', 'active');
        l.classList.add('border-transparent');
      });
      link.classList.add('border-primary', 'text-primary', 'active');
      link.classList.remove('border-transparent');
      
      // Show active tab content
      tabPanes.forEach(pane => {
        pane.classList.add('hidden');
      });
      document.getElementById(tabId).classList.remove('hidden');
    });
  });
  
  // Attendance sub-tabs (Present, Absent, All)
  const attendanceTabs = document.querySelectorAll('[data-attendance-tab]');
  const attendanceContent = document.querySelectorAll('.attendance-tab-content');
  
  attendanceTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      
      const tabId = tab.getAttribute('data-attendance-tab');
      
      // Update active tab
      attendanceTabs.forEach(t => {
        t.classList.remove('border-primary', 'text-primary', 'active');
        t.classList.add('border-transparent');
      });
      tab.classList.add('border-primary', 'text-primary', 'active');
      tab.classList.remove('border-transparent');
      
      // Show active content
      attendanceContent.forEach(content => {
        content.classList.add('hidden');
      });
      document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    });
  });
}