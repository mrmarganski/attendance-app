// Students module

export function initializeStudents() {
  console.log('Students module initialized');
  
  // Initialize student list
  updateStudentList();
  
  // Set up add/edit student form
  const saveStudentBtn = document.getElementById('save-student');
  if (saveStudentBtn) {
    saveStudentBtn.addEventListener('click', saveStudent);
  }
  
  // Set up cancel edit button
  const cancelEditBtn = document.getElementById('cancel-edit');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetStudentForm);
  }
  
  // Set up import students button
  const importStudentsBtn = document.getElementById('import-students');
  if (importStudentsBtn) {
    importStudentsBtn.addEventListener('click', showImportModal);
  }
  
  // Initialize the form
  resetStudentForm();
}

// Update student list display
function updateStudentList() {
  const container = document.getElementById('student-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Sort by grade then last name
  const sortedStudents = [...window.appState.students].sort((a, b) => {
    if (a.grade === b.grade) {
      return a.lastName.localeCompare(b.lastName);
    }
    return a.grade.localeCompare(b.grade);
  });
  
  if (sortedStudents.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 4;
    emptyCell.className = 'px-6 py-4 text-center text-gray-500 dark:text-gray-400';
    emptyCell.textContent = 'No students in database. Add some students to get started.';
    emptyRow.appendChild(emptyCell);
    container.appendChild(emptyRow);
    return;
  }
  
  sortedStudents.forEach(student => {
    const row = document.createElement('tr');
    
    const idCell = document.createElement('td');
    idCell.className = 'px-6 py-4 whitespace-nowrap';
    idCell.textContent = student.studentId;
    
    const nameCell = document.createElement('td');
    nameCell.className = 'px-6 py-4 whitespace-nowrap';
    nameCell.textContent = `${student.lastName}, ${student.firstName}`;
    
    const gradeCell = document.createElement('td');
    gradeCell.className = 'px-6 py-4 whitespace-nowrap';
    gradeCell.textContent = student.grade;
    
    const actionCell = document.createElement('td');
    actionCell.className = 'px-6 py-4 whitespace-nowrap flex space-x-2';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-opacity-90';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editStudent(student.studentId));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-opacity-90';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteStudent(student.studentId));
    
    actionCell.appendChild(editBtn);
    actionCell.appendChild(deleteBtn);
    
    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(gradeCell);
    row.appendChild(actionCell);
    
    container.appendChild(row);
  });
  
  // Update student count
  const totalStudentsEl = document.getElementById('total-students');
  if (totalStudentsEl) totalStudentsEl.textContent = window.appState.students.length;
  
  // Update student dropdowns
  updateStudentDropdowns();
}

function updateStudentDropdowns() {
  // Update quick select dropdown
  const quickSelect = document.getElementById('student-quick-select');
  if (quickSelect) {
    // Save current selection
    const currentValue = quickSelect.value;
    
    // Clear options except the first one
    while (quickSelect.options.length > 1) {
      quickSelect.remove(1);
    }
    
    // Sort students by last name
    const sortedStudents = [...window.appState.students].sort((a, b) => 
      a.lastName.localeCompare(b.lastName)
    );
    
    // Add students to dropdown
    sortedStudents.forEach(student => {
      const option = document.createElement('option');
      option.value = student.studentId;
      option.textContent = `${student.lastName}, ${student.firstName} (${student.grade})`;
      quickSelect.appendChild(option);
    });
    
    // Restore selection if possible
    if (currentValue) {
      quickSelect.value = currentValue;
    }
  }
}

function saveStudent() {
  const studentIdField = document.getElementById('student-id-field');
  const firstName = document.getElementById('first-name');
  const lastName = document.getElementById('last-name');
  const grade = document.getElementById('grade');
  const editStudentId = document.getElementById('edit-student-id');
  
  if (!studentIdField.value || !firstName.value || !lastName.value || !grade.value) {
    window.utils.showNotification('Missing Information', 'Please fill out all fields', 'error');
    return;
  }
  
  // Normalize student ID
  const normalizedId = window.utils.normalizeStudentId(studentIdField.value);
  
  // Check if editing or adding new
  if (editStudentId.value) {
    // Find the student being edited
    const studentIndex = window.appState.students.findIndex(s => s.studentId === editStudentId.value);
    if (studentIndex === -1) {
      window.utils.showNotification('Error', 'Student not found', 'error');
      return;
    }
    
    // Check if ID is being changed and if it would conflict
    if (normalizedId !== editStudentId.value) {
      const idExists = window.appState.students.some(s => s.studentId === normalizedId && s.studentId !== editStudentId.value);
      if (idExists) {
        window.utils.showNotification('Error', 'A student with this ID already exists', 'error');
        return;
      }
    }
    
    // Update the student
    const oldId = window.appState.students[studentIndex].studentId;
    window.appState.students[studentIndex] = {
      studentId: normalizedId,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      grade: grade.value
    };
    
    // If ID changed, update all references in attendance, etc.
    if (normalizedId !== oldId) {
      // Update attendance records
      window.appState.attendance.forEach(record => {
        if (record.studentId === oldId) {
          record.studentId = normalizedId;
        }
      });
      
      // Update absences
      window.appState.absences.forEach(absence => {
        if (absence.studentId === oldId) {
          absence.studentId = normalizedId;
        }
      });
      
      // Update today's check-ins
      window.appState.todayCheckIns.forEach(checkIn => {
        if (checkIn.studentId === oldId) {
          checkIn.studentId = normalizedId;
        }
      });
    }
    
    window.utils.showNotification('Success', `${firstName.value} ${lastName.value} updated successfully`, 'success');
    window.utils.logActivity('Student', `Updated student: ${firstName.value} ${lastName.value} (${normalizedId})`);
  } else {
    // Check if ID already exists
    const idExists = window.appState.students.some(s => s.studentId === normalizedId);
    if (idExists) {
      window.utils.showNotification('Error', 'A student with this ID already exists', 'error');
      return;
    }
    
    // Add new student
    window.appState.students.push({
      studentId: normalizedId,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      grade: grade.value
    });
    
    window.utils.showNotification('Success', `${firstName.value} ${lastName.value} added successfully`, 'success');
    window.utils.logActivity('Student', `Added new student: ${firstName.value} ${lastName.value} (${normalizedId})`);
  }
  
  // Reset form, update lists, and save data
  resetStudentForm();
  updateStudentList();
  window.utils.saveData();
}

function editStudent(studentId) {
  const student = window.appState.students.find(s => s.studentId === studentId);
  if (!student) return;
  
  // Fill the form with student data
  document.getElementById('student-form-title').textContent = 'Edit Student';
  document.getElementById('save-student').textContent = 'Update Student';
  document.getElementById('edit-student-id').value = student.studentId;
  document.getElementById('student-id-field').value = student.studentId;
  document.getElementById('first-name').value = student.firstName;
  document.getElementById('last-name').value = student.lastName;
  document.getElementById('grade').value = student.grade;
  document.getElementById('cancel-edit').classList.remove('hidden');
  
  // Scroll to the form
  document.getElementById('student-form-title').scrollIntoView({ behavior: 'smooth' });
}

function resetStudentForm() {
  document.getElementById('student-form-title').textContent = 'Add New Student';
  document.getElementById('save-student').textContent = 'Add Student';
  document.getElementById('edit-student-id').value = '';
  document.getElementById('student-id-field').value = '';
  document.getElementById('first-name').value = '';
  document.getElementById('last-name').value = '';
  document.getElementById('grade').value = '';
  document.getElementById('cancel-edit').classList.add('hidden');
}

function deleteStudent(studentId) {
  // Setup confirmation
  document.getElementById('confirm-title').textContent = 'Delete Student';
  document.getElementById('confirm-message').textContent = 'Are you sure you want to delete this student? This will also remove their attendance records.';
  
  // Show modal
  document.getElementById('confirm-modal').classList.remove('hidden');
  
  // Set up confirmation handlers
  window.utils.setupConfirmationHandlers(function() {
    // Find the student
    const studentIndex = window.appState.students.findIndex(s => s.studentId === studentId);
    if (studentIndex === -1) return;
    
    const student = window.appState.students[studentIndex];
    
    // Remove the student
    window.appState.students.splice(studentIndex, 1);
    
    // Remove their attendance records
    window.appState.attendance = window.appState.attendance.filter(record => record.studentId !== studentId);
    
    // Remove from absences
    window.appState.absences = window.appState.absences.filter(record => record.studentId !== studentId);
    
    // Remove from today's check-ins
    window.appState.todayCheckIns = window.appState.todayCheckIns.filter(checkIn => checkIn.studentId !== studentId);
    
    // Update UI
    updateStudentList();
    if (window.updateUI.updateCheckInList) window.updateUI.updateCheckInList();
    window.utils.saveData();
    
    // Hide modal
    document.getElementById('confirm-modal').classList.add('hidden');
    
    // Notification and logging
    window.utils.showNotification('Student Deleted', `${student.firstName} ${student.lastName} has been deleted`, 'success');
    window.utils.logActivity('Student', `Deleted student: ${student.firstName} ${student.lastName} (${studentId})`);
  });
}

function showImportModal() {
  // Create modal for CSV import
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 class="text-lg font-semibold mb-4">Import Students</h3>
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Paste CSV data with the format:<br>
        StudentID,FirstName,LastName,Grade
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
    const csvData = modal.querySelector('textarea').value.trim();
    if (!csvData) {
      window.utils.showNotification('Error', 'No data entered', 'error');
      return;
    }
    
    const result = importStudentsFromCSV(csvData);
    if (result.success) {
      document.body.removeChild(modal);
    }
  });
  
  // Handle close button
  modal.querySelector('.close-btn').addEventListener('click', function() {
    document.body.removeChild(modal);
  });
}

function importStudentsFromCSV(csvData) {
  try {
    // Split lines and filter out empty ones
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      window.utils.showNotification('Error', 'No data found in CSV', 'error');
      return { success: false, count: 0 };
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each line
    lines.forEach(line => {
      // Handle both comma and tab delimiters
      const parts = line.includes(',') ? line.split(',') : line.split('\t');
      
      // Need at least ID, first name, last name, and grade
      if (parts.length >= 4) {
        const [studentId, firstName, lastName, grade] = parts.map(p => p.trim());
        
        // Check for required fields
        if (!studentId || !firstName || !lastName || !grade) {
          errorCount++;
          return;
        }
        
        // Normalize the student ID
        const normalizedId = window.utils.normalizeStudentId(studentId);
        
        // Check if ID already exists
        const existingIndex = window.appState.students.findIndex(s => s.studentId === normalizedId);
        
        if (existingIndex !== -1) {
          // Update existing student
          window.appState.students[existingIndex] = {
            studentId: normalizedId,
            firstName,
            lastName,
            grade
          };
        } else {
          // Add new student
          window.appState.students.push({
            studentId: normalizedId,
            firstName,
            lastName,
            grade
          });
        }
        
        successCount++;
      } else if (line.trim() !== '') {
        errorCount++;
      }
    });
    
    // Update UI
    updateStudentList();
    window.utils.saveData();
    
    // Show results
    if (errorCount > 0) {
      window.utils.showNotification('Import Complete', `Imported ${successCount} students with ${errorCount} errors`, 'warning');
    } else {
      window.utils.showNotification('Import Complete', `Successfully imported ${successCount} students`, 'success');
    }
    
    window.utils.logActivity('Import', `Imported ${successCount} students from CSV`);
    
    return { success: true, count: successCount };
  } catch (error) {
    console.error('CSV import error:', error);
    window.utils.showNotification('Import Error', `Failed to import data: ${error.message}`, 'error');
    return { success: false, count: 0 };
  }
}

// Assign the function to the global updateUI object
window.updateUI.updateStudentList = updateStudentList;