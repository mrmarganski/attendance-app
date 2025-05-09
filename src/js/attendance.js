// Attendance tracking module

export function initializeAttendance() {
  console.log('Attendance module initialized');
  
  // Initialize attendance functionality
  setupCheckInForm();
  updateCheckInList();
  
  // Set up end meeting button
  const endMeetingBtn = document.getElementById('end-meeting');
  if (endMeetingBtn) {
    endMeetingBtn.addEventListener('click', endMeeting);
  }
  
  // Set up admin edit mode toggle
  const editModeBtn = document.getElementById('toggle-edit-mode');
  if (editModeBtn) {
    editModeBtn.addEventListener('click', toggleEditMode);
  }
}

function setupCheckInForm() {
  // Set up check-in button
  const checkInButton = document.getElementById('check-in-manual');
  if (checkInButton) {
    checkInButton.addEventListener('click', () => {
      const studentIdInput = document.getElementById('student-id-input');
      if (studentIdInput && studentIdInput.value.trim()) {
        processStudentCheckIn(studentIdInput.value.trim());
        studentIdInput.value = ''; // Clear the input
      } else {
        window.utils.showNotification('Error', 'Please enter a student ID', 'error');
      }
    });
  }
  
  // Set up quick select dropdown
  const quickSelect = document.getElementById('student-quick-select');
  if (quickSelect) {
    quickSelect.addEventListener('change', () => {
      if (quickSelect.value) {
        processStudentCheckIn(quickSelect.value);
        quickSelect.value = ''; // Reset selection
        
        // Hide the absence reason container
        document.getElementById('absence-reason-container')?.classList.add('hidden');
      }
    });
  }
  
  // Set up mark absent button
  const markAbsentBtn = document.getElementById('mark-absent');
  if (markAbsentBtn) {
    markAbsentBtn.addEventListener('click', () => {
      const quickSelect = document.getElementById('student-quick-select');
      const absenceReason = document.getElementById('absence-reason');
      
      if (quickSelect.value && absenceReason.value) {
        markStudentAbsent(quickSelect.value, absenceReason.value);
        quickSelect.value = ''; // Reset selection
        
        // Hide the absence reason container
        document.getElementById('absence-reason-container').classList.add('hidden');
      } else {
        window.utils.showNotification('Error', 'Please select a student and reason', 'error');
      }
    });
  }
  
  // Show absence reason when a student is selected
  if (quickSelect) {
    quickSelect.addEventListener('change', () => {
      const absenceContainer = document.getElementById('absence-reason-container');
      if (quickSelect.value && absenceContainer) {
        absenceContainer.classList.remove('hidden');
      } else if (absenceContainer) {
        absenceContainer.classList.add('hidden');
      }
    });
  }
}

function processStudentCheckIn(studentId) {
  // Find the student
  const student = window.appState.students.find(s => s.studentId === studentId);
  
  if (student) {
    // Get today's date and current time
    const today = window.utils.getCurrentDate();
    const checkInTime = window.utils.getCurrentTime();
    
    // Check if already checked in
    const activeCheckIn = window.appState.todayCheckIns.find(
      checkIn => checkIn.studentId === studentId && !checkIn.checkOutTime
    );
    
    if (activeCheckIn) {
      // Student is already checked in - check them out
      activeCheckIn.checkOutTime = checkInTime;
      
      updateLastActivity(student, 'check-out');
      window.utils.showNotification('Check-out Recorded', `${student.firstName} ${student.lastName} checked out at ${checkInTime}`, 'success');
    } else {
      // New check-in
      const newCheckIn = {
        date: today,
        studentId: student.studentId,
        checkInTime,
        checkOutTime: ""
      };
      
      window.appState.todayCheckIns.push(newCheckIn);
      window.appState.attendance.push(newCheckIn);
      
      // Remove from absences if marked absent today
      window.appState.absences = window.appState.absences.filter(
        absence => !(absence.date === today && absence.studentId === studentId)
      );
      
      updateLastActivity(student, 'check-in');
      window.utils.showNotification('Check-in Successful', `${student.firstName} ${student.lastName} checked in at ${checkInTime}`, 'success');
    }
    
    updateCheckInList();
    window.utils.saveData();
    return true;
  } else {
    window.utils.showNotification('Student Not Found', `No student found with ID: ${studentId}`, 'error');
    return false;
  }
}

function markStudentAbsent(studentId, reason) {
  const student = window.appState.students.find(s => s.studentId === studentId);
  if (!student) {
    window.utils.showNotification('Error', 'Student not found', 'error');
    return false;
  }
  
  const today = window.utils.getCurrentDate();
  
  // Check if student is already checked in
  const alreadyCheckedIn = window.appState.todayCheckIns.some(
    checkIn => checkIn.studentId === studentId
  );
  
  if (alreadyCheckedIn) {
    window.utils.showNotification('Already Checked In', `${student.firstName} ${student.lastName} is already checked in today.`, 'warning');
    return false;
  }
  
  // Check if already marked absent
  const alreadyAbsent = window.appState.absences.some(
    absence => absence.date === today && absence.studentId === studentId
  );
  
  if (alreadyAbsent) {
    window.utils.showNotification('Already Absent', `${student.firstName} ${student.lastName} is already marked absent today.`, 'info');
    return false;
  }
  
  // Record absence
  const newAbsence = {
    date: today,
    studentId,
    reason: reason || 'Unspecified'
  };
  
  window.appState.absences.push(newAbsence);
  
  updateLastActivity(student, 'absent', reason);
  window.utils.showNotification('Absence Recorded', `${student.firstName} ${student.lastName} marked absent (${reason})`, 'success');
  
  updateCheckInList();
  window.utils.saveData();
  
  return true;
}

function updateCheckInList() {
  // Update present students list
  const presentList = document.getElementById('check-in-list');
  if (presentList) {
    presentList.innerHTML = '';
    
    const today = window.utils.getCurrentDate();
    let presentCount = 0;
    
    // Sort by check-in time (newest first)
    const sorted = [...window.appState.todayCheckIns].sort((a, b) => {
      return b.checkInTime.localeCompare(a.checkInTime);
    });
    
    if (sorted.length > 0) {
      sorted.forEach(checkIn => {
        const student = window.appState.students.find(s => s.studentId === checkIn.studentId);
        if (!student) return;
        
        presentCount++;
        
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.className = 'px-6 py-4 whitespace-nowrap';
        nameCell.innerHTML = `
          <div class="text-sm font-medium">${student.firstName} ${student.lastName}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${student.grade}</div>
        `;
        
        const timeCell = document.createElement('td');
        timeCell.className = 'px-6 py-4 whitespace-nowrap';
        
        if (checkIn.checkOutTime) {
          timeCell.innerHTML = `
            <div class="text-sm">${checkIn.checkInTime} – ${checkIn.checkOutTime}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Duration: ${window.utils.calculateDuration(checkIn.checkInTime, checkIn.checkOutTime)}</div>
          `;
        } else {
          timeCell.innerHTML = `
            <div class="text-sm">${checkIn.checkInTime}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Currently checked in</div>
          `;
        }
        
        const actionCell = document.createElement('td');
        actionCell.className = 'px-6 py-4 whitespace-nowrap flex space-x-2';
        
        if (!checkIn.checkOutTime) {
          const checkOutBtn = document.createElement('button');
          checkOutBtn.className = 'text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-opacity-90';
          checkOutBtn.textContent = 'Check Out';
          checkOutBtn.addEventListener('click', () => {
            checkIn.checkOutTime = window.utils.getCurrentTime();
            updateCheckInList();
            updateLastActivity(student, 'check-out');
            window.utils.showNotification('Check-out Recorded', `${student.firstName} ${student.lastName} checked out`, 'success');
            window.utils.saveData();
          });
          
          actionCell.appendChild(checkOutBtn);
        } else {
          const checkedOutBadge = document.createElement('span');
          checkedOutBadge.className = 'text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full';
          checkedOutBadge.textContent = 'Checked Out';
          
          actionCell.appendChild(checkedOutBadge);
        }
        
        row.appendChild(nameCell);
        row.appendChild(timeCell);
        row.appendChild(actionCell);
        
        presentList.appendChild(row);
      });
    } else {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 3;
      emptyCell.className = 'py-8 text-center text-gray-500 dark:text-gray-400';
      emptyCell.textContent = 'No students checked in today';
      emptyRow.appendChild(emptyCell);
      presentList.appendChild(emptyRow);
    }
    
    // Update present count badge
    const presentCountEl = document.getElementById('present-count');
    if (presentCountEl) presentCountEl.textContent = presentCount;
  }
  
  // Update absent students list
  const absentList = document.getElementById('absent-list');
  if (absentList) {
    absentList.innerHTML = '';
    
    const today = window.utils.getCurrentDate();
    
    // Filter for today's absences
    const todayAbsences = window.appState.absences.filter(absence => absence.date === today);
    
    if (todayAbsences.length > 0) {
      todayAbsences.forEach(absence => {
        const student = window.appState.students.find(s => s.studentId === absence.studentId);
        if (!student) return;
        
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.className = 'px-6 py-4 whitespace-nowrap';
        nameCell.innerHTML = `
          <div class="text-sm font-medium">${student.firstName} ${student.lastName}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${student.grade}</div>
        `;
        
        const reasonCell = document.createElement('td');
        reasonCell.className = 'px-6 py-4 whitespace-nowrap';
        reasonCell.textContent = absence.reason || 'Unspecified';
        
        const actionCell = document.createElement('td');
        actionCell.className = 'px-6 py-4 whitespace-nowrap flex space-x-2';
        
        const markPresentBtn = document.createElement('button');
        markPresentBtn.className = 'text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-opacity-90';
        markPresentBtn.textContent = 'Mark Present';
        markPresentBtn.addEventListener('click', () => {
          // Remove from absences
          window.appState.absences = window.appState.absences.filter(a => 
            !(a.date === today && a.studentId === student.studentId)
          );
          
          // Check in the student
          processStudentCheckIn(student.studentId);
        });
        
        actionCell.appendChild(markPresentBtn);
        
        row.appendChild(nameCell);
        row.appendChild(reasonCell);
        row.appendChild(actionCell);
        
        absentList.appendChild(row);
      });
    } else {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 3;
      emptyCell.className = 'py-8 text-center text-gray-500 dark:text-gray-400';
      emptyCell.textContent = 'No absences recorded today';
      emptyRow.appendChild(emptyCell);
      absentList.appendChild(emptyRow);
    }
    
    // Update absent count badge
    const absentCountEl = document.getElementById('absent-count');
    if (absentCountEl) absentCountEl.textContent = todayAbsences.length;
  }
  
  // Update all students list (if it exists)
  const allStudentsList = document.getElementById('all-students-list');
  if (allStudentsList) {
    allStudentsList.innerHTML = '';
    
    const today = window.utils.getCurrentDate();
    
    // Create a set of students who are present or absent
    const presentStudentIds = new Set(window.appState.todayCheckIns.map(checkIn => checkIn.studentId));
    const absentStudentIds = new Set(window.appState.absences.filter(a => a.date === today).map(a => a.studentId));
    
    // Sort students by last name
    const sortedStudents = [...window.appState.students].sort((a, b) => a.lastName.localeCompare(b.lastName));
    
    sortedStudents.forEach(student => {
      const row = document.createElement('tr');
      
      const nameCell = document.createElement('td');
      nameCell.className = 'px-6 py-4 whitespace-nowrap';
      nameCell.innerHTML = `
        <div class="text-sm font-medium">${student.firstName} ${student.lastName}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">${student.grade}</div>
      `;
      
      const statusCell = document.createElement('td');
      statusCell.className = 'px-6 py-4 whitespace-nowrap';
      
      const isPresent = presentStudentIds.has(student.studentId);
      const isAbsent = absentStudentIds.has(student.studentId);
      
      if (isPresent) {
        const checkIn = window.appState.todayCheckIns.find(c => c.studentId === student.studentId);
        statusCell.innerHTML = `
          <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Present</span>
          ${checkIn.checkOutTime ? '<span class="ml-2 text-xs text-gray-500">Checked out</span>' : '<span class="ml-2 text-xs text-gray-500">Currently in</span>'}
        `;
      } else if (isAbsent) {
        const absence = window.appState.absences.find(a => a.date === today && a.studentId === student.studentId);
        statusCell.innerHTML = `
          <span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Absent</span>
          <span class="ml-2 text-xs text-gray-500">${absence.reason || 'Unspecified'}</span>
        `;
      } else {
        statusCell.innerHTML = `
          <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Not Recorded</span>
        `;
      }
      
      const actionCell = document.createElement('td');
      actionCell.className = 'px-6 py-4 whitespace-nowrap flex space-x-2';
      
      if (!isPresent && !isAbsent) {
        const checkInBtn = document.createElement('button');
        checkInBtn.className = 'text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-opacity-90';
        checkInBtn.textContent = 'Check In';
        checkInBtn.addEventListener('click', () => {
          processStudentCheckIn(student.studentId);
        });
        
        const absentBtn = document.createElement('button');
        absentBtn.className = 'text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-opacity-90';
        absentBtn.textContent = 'Absent';
        absentBtn.addEventListener('click', () => {
          // Show a quick modal to select reason
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
          modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md w-full">
              <h4 class="font-medium mb-2">Mark ${student.firstName} Absent</h4>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-700 mb-3">
                <option value="Sick">Sick</option>
                <option value="Family Commitment">Family Commitment</option>
                <option value="School Event">School Event</option>
                <option value="Sports">Sports</option>
                <option value="Other Extracurricular">Other Extracurricular</option>
                <option value="Transportation">Transportation</option>
                <option value="Other">Other</option>
              </select>
              <div class="flex justify-end space-x-2">
                <button class="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-opacity-90 cancel-btn">
                  Cancel
                </button>
                <button class="px-3 py-1 bg-red-500 text-white rounded hover:bg-opacity-90 confirm-btn">
                  Mark Absent
                </button>
              </div>
            </div>
          `;
          
          document.body.appendChild(modal);
          
          // Handle confirm button
          modal.querySelector('.confirm-btn').addEventListener('click', function() {
            const reason = modal.querySelector('select').value;
            markStudentAbsent(student.studentId, reason);
            document.body.removeChild(modal);
          });
          
          // Handle cancel button
          modal.querySelector('.cancel-btn').addEventListener('click', function() {
            document.body.removeChild(modal);
          });
        });
        
        actionCell.appendChild(checkInBtn);
        actionCell.appendChild(absentBtn);
      } else {
        const statusLabel = document.createElement('span');
        statusLabel.className = 'text-xs text-gray-500';
        statusLabel.textContent = 'Status recorded';
        
        actionCell.appendChild(statusLabel);
      }
      
      row.appendChild(nameCell);
      row.appendChild(statusCell);
      row.appendChild(actionCell);
      
      allStudentsList.appendChild(row);
    });
  }
  
  // Update checked in count (if it exists)
  const checkedInCountEl = document.getElementById('checked-in-count');
  if (checkedInCountEl) {
    const currentlyCheckedIn = window.appState.todayCheckIns.filter(checkIn => !checkIn.checkOutTime).length;
    checkedInCountEl.textContent = currentlyCheckedIn;
  }
}

function updateLastActivity(student, type, details = '') {
  const lastActivity = document.getElementById('last-activity');
  if (!lastActivity) return;
  
  const time = window.utils.getCurrentTime();
  
  let html = '';
  
  if (type === 'check-in') {
    html = `
      <div class="flex items-center">
        <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div>
          <div class="font-medium">${student.firstName} ${student.lastName}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Checked in at ${time}</div>
        </div>
      </div>
    `;
  } else if (type === 'check-out') {
    html = `
      <div class="flex items-center">
        <div class="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center mr-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>
        <div>
          <div class="font-medium">${student.firstName} ${student.lastName}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Checked out at ${time}</div>
        </div>
      </div>
    `;
  } else if (type === 'absent') {
    html = `
      <div class="flex items-center">
        <div class="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center mr-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <div>
          <div class="font-medium">${student.firstName} ${student.lastName}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Marked absent: ${details || 'Unspecified'}</div>
        </div>
      </div>
    `;
  }
  
  lastActivity.innerHTML = html;
}

function endMeeting() {
  // Only allow admins to end the meeting
  if (!window.appState.adminLoggedIn) {
    window.utils.showNotification('Admin Required', 'You must be logged in as admin to end the meeting.', 'error');
    
    // Show login modal
    document.getElementById('admin-login-modal').classList.remove('hidden');
    return;
  }
  
  // Setup confirmation
  document.getElementById('confirm-title').textContent = 'End Meeting';
  document.getElementById('confirm-message').textContent = 
    'This will sign out all currently checked-in students and mark anyone who didn\'t check in as absent. Continue?';
  
  // Show modal
  document.getElementById('confirm-modal').classList.remove('hidden');
  
  // Set up confirmation handlers
  window.utils.setupConfirmationHandlers(function() {
    const today = window.utils.getCurrentDate();
    const currentTime = window.utils.getCurrentTime();
    let signedOutCount = 0;
    let markedAbsentCount = 0;
    
    // 1. Sign out all students who are currently checked in
    window.appState.todayCheckIns.forEach(checkIn => {
      if (!checkIn.checkOutTime) {
        checkIn.checkOutTime = currentTime;
        signedOutCount++;
        
        // Update in the main attendance array too
        const attendanceRecord = window.appState.attendance.find(
          record => record.date === today && 
                  record.studentId === checkIn.studentId && 
                  !record.checkOutTime
        );
        
        if (attendanceRecord) {
          attendanceRecord.checkOutTime = currentTime;
        }
      }
    });
    
    // 2. Mark all students who never checked in as absent
    const checkedInStudentIds = new Set(window.appState.todayCheckIns.map(c => c.studentId));
    const absentStudentIds = window.appState.students
      .filter(student => !checkedInStudentIds.has(student.studentId))
      .map(student => student.studentId);
    
    // Don't mark students who are already marked absent again
    const existingAbsences = window.appState.absences
      .filter(absence => absence.date === today)
      .map(absence => absence.studentId);
    
    const existingAbsenceSet = new Set(existingAbsences);
    
    absentStudentIds.forEach(studentId => {
      if (!existingAbsenceSet.has(studentId)) {
        window.appState.absences.push({
          date: today,
          studentId,
          reason: 'Did not attend'
        });
        markedAbsentCount++;
      }
    });
    
    // Update UI and save data
    updateCheckInList();
    window.utils.saveData();
    
    // Hide modal
    document.getElementById('confirm-modal').classList.add('hidden');
    
    // Show summary
    window.utils.showNotification('Meeting Ended', `${signedOutCount} students signed out, ${markedAbsentCount} marked absent`, 'success');
    window.utils.logActivity('Meeting', `Meeting ended with ${window.appState.todayCheckIns.length} students present and ${window.appState.absences.filter(a => a.date === today).length} absent`);
  });
}

function toggleEditMode() {
  // Only allow admins to enable edit mode
  if (!window.appState.adminLoggedIn) {
    window.utils.showNotification('Admin Required', 'You must be logged in as admin to edit attendance records.', 'error');
    
    // Show login modal
    document.getElementById('admin-login-modal').classList.remove('hidden');
    return;
  }
  
  window.appState.editModeEnabled = !window.appState.editModeEnabled;
  
  const editButton = document.getElementById('toggle-edit-mode');
  if (editButton) {
    if (window.appState.editModeEnabled) {
      editButton.innerHTML = '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Disable Admin Edit';
      editButton.classList.remove('bg-blue-600');
      editButton.classList.add('bg-red-600');
      window.utils.showNotification('Edit Mode Enabled', 'You can now edit attendance records', 'info');
    } else {
      editButton.innerHTML = '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Enable Admin Edit';
      editButton.classList.remove('bg-red-600');
      editButton.classList.add('bg-blue-600');
      window.utils.showNotification('Edit Mode Disabled', 'Attendance records are now protected', 'success');
    }
  }
  
  // Force update of the check-in list to show/hide edit options
  updateCheckInList();

  // In the updateCheckInList function, add this to the actionCell creation
if (window.appState.editModeEnabled) {
  // Add edit/delete buttons for admin mode
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-opacity-90 ml-2';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => {
    // Confirm before deleting
    document.getElementById('confirm-title').textContent = 'Delete Check-in';
    document.getElementById('confirm-message').textContent = 
      `Are you sure you want to delete this check-in record for ${student.firstName} ${student.lastName}?`;
    
    // Show modal
    document.getElementById('confirm-modal').classList.remove('hidden');
    
    // Set up confirmation handlers
    window.utils.setupConfirmationHandlers(function() {
      // Remove from todayCheckIns and attendance
      window.appState.todayCheckIns = window.appState.todayCheckIns.filter(c => 
        !(c.studentId === checkIn.studentId && c.checkInTime === checkIn.checkInTime)
      );
      
      window.appState.attendance = window.appState.attendance.filter(a => 
        !(a.studentId === checkIn.studentId && a.date === checkIn.date && a.checkInTime === checkIn.checkInTime)
      );
      
      // Update UI
      updateCheckInList();
      window.utils.saveData();
      
      // Hide modal
      document.getElementById('confirm-modal').classList.add('hidden');
      
      // Notification
      window.utils.showNotification('Record Deleted', `Check-in record for ${student.firstName} ${student.lastName} has been deleted`, 'success');
    });
  });
  
  actionCell.appendChild(deleteBtn);
}
}
    

// Assign the function to the global updateUI object
window.updateUI.updateCheckInList = updateCheckInList;