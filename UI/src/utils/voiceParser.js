export function parseVoiceCommandLocally(transcript, db, languagePreference) {
  const rawText = transcript.toLowerCase().trim();
  const today = new Date().toISOString().split('T')[0];

  const result = {
    success: false,
    message: "Command not recognized. Please try again or use standard templates.",
    speechText: {
      en: "Sorry, I could not understand that command.",
      ta: "மன்னிக்கவும், அந்த கட்டளையை என்னால் புரிந்து கொள்ள முடியவில்லை."
    },
    action: null
  };

  // Deep clone database state to avoid mutation
  const updatedDb = JSON.parse(JSON.stringify(db));
  if (!updatedDb.students) updatedDb.students = [];
  if (!updatedDb.staff) updatedDb.staff = [];
  if (!updatedDb.inventory) updatedDb.inventory = [];
  if (!updatedDb.tasks) updatedDb.tasks = [];
  if (!updatedDb.attendance) updatedDb.attendance = { students: [], staff: [] };
  if (!updatedDb.voiceLogs) updatedDb.voiceLogs = [];

  // Helper function to format time
  const getFormattedTime = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours.toString().padStart(2, '0')}:${minutes}:${d.getSeconds().toString().padStart(2, '0')} ${ampm}`;
  };

  // 1. MARK ATTENDANCE FOR CLASS
  if (rawText.includes('mark attendance for') || rawText.includes('mark attendance') || rawText.includes('take attendance')) {
    let targetClass = 'LKG';
    let targetTamilClass = 'எல்.கே.ஜி';

    if (rawText.includes('nursery')) {
      targetClass = 'Nursery';
      targetTamilClass = 'நர்சரி';
    } else if (rawText.includes('play group') || rawText.includes('playgroup')) {
      targetClass = 'Play Group';
      targetTamilClass = 'ப்ளே குரூப்';
    } else if (rawText.includes('ukg')) {
      targetClass = 'UKG';
      targetTamilClass = 'யு.கே.ஜி';
    }

    const classStudents = updatedDb.students.filter(
      (s) => s.status === 'Active' && s.class === targetClass
    );

    if (classStudents.length > 0) {
      classStudents.forEach((student) => {
        const existingRecord = updatedDb.attendance.students.find(
          (item) => item.date === today && item.studentId === student.id
        );
        if (existingRecord) {
          existingRecord.status = 'Present';
          existingRecord.remarks = 'Voice command (Local Fallback)';
        } else {
          updatedDb.attendance.students.push({
            date: today,
            studentId: student.id,
            status: 'Present',
            remarks: 'Voice command (Local Fallback)'
          });
        }
      });

      result.success = true;
      result.message = `Marked attendance for all students in class ${targetClass}.`;
      result.speechText = {
        en: `Attendance marked successfully for class ${targetClass}.`,
        ta: `${targetTamilClass} வகுப்பிற்கு வருகை பதிவு செய்யப்பட்டது.`
      };
      result.action = {
        type: "MARK_ATTENDANCE",
        targetClass: targetClass
      };
    } else {
      result.message = `No active students found in class ${targetClass}.`;
      result.speechText = {
        en: `No active students found in class ${targetClass}.`,
        ta: `${targetTamilClass} வகுப்பில் மாணவர்கள் யாரும் இல்லை.`
      };
    }
  }

  // 2. CREATE TASK
  else if (/create\s+(a\s+)?task|assign\s+(a\s+)?task|new\s+task|add\s+(a\s+|new\s+)?task|set\s+(a\s+)?task/i.test(rawText)) {
    let assigneeId = 'ST203'; // Savitri Devi
    let assigneeName = 'Savitri Devi';
    let assigneeTamil = 'சாவித்திரி தேவி';

    if (/ramesh|kitchen|maintenance/i.test(rawText)) {
      assigneeId = 'ST205';
      assigneeName = 'Ramesh Kumar';
      assigneeTamil = 'ரமேஷ் குமார்';
    } else if (/priya|lkg teacher/i.test(rawText)) {
      assigneeId = 'ST201';
      assigneeName = 'Priya Sen';
      assigneeTamil = 'பிரியா சென்';
    } else if (/anita|ukg teacher/i.test(rawText)) {
      assigneeId = 'ST204';
      assigneeName = 'Anita Kapoor';
      assigneeTamil = 'அனிதா கபூர்';
    } else if (/admin|rohan/i.test(rawText)) {
      assigneeId = 'ST202';
      assigneeName = 'Rohan Das';
      assigneeTamil = 'ரோஹன் தாஸ்';
    }

    let taskTitle = '';
    const titleMatch = transcript.match(/task\s+(?:for|to|titled?|called|named)\s+(?:\w+\s+)?(.+)/i);
    if (titleMatch) {
      const candidate = titleMatch[1].replace(/\b(savitri|ramesh|priya|anita|rohan|kumar|devi|sen|kapoor|das)\b/ig, '').trim();
      if (candidate.length > 3) {
        taskTitle = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }

    if (!taskTitle) {
      const afterName = transcript.replace(/^.*?(ramesh|savitri|priya|anita|rohan)\s*/i, '').trim();
      if (afterName.length > 3 && afterName.toLowerCase() !== transcript.toLowerCase()) {
        taskTitle = afterName.charAt(0).toUpperCase() + afterName.slice(1);
      }
    }

    if (!taskTitle || taskTitle.length < 3) {
      taskTitle = 'General housekeeping';
    }

    const newTask = {
      id: "T" + Math.floor(100 + Math.random() * 900),
      title: taskTitle,
      description: "Voice-assigned task (Local): " + taskTitle,
      assignedTo: assigneeId,
      priority: "Medium",
      status: "Pending",
      dueDate: today,
      category: "Cleaning"
    };

    updatedDb.tasks.push(newTask);

    result.success = true;
    result.message = `Task "${taskTitle}" created and assigned to ${assigneeName}.`;
    result.speechText = {
      en: `Task created and assigned to ${assigneeName}.`,
      ta: `பணி உருவாக்கப்பட்டு ${assigneeTamil} விடம் ஒப்படைக்கப்பட்டது.`
    };
    result.action = {
      type: "CREATE_TASK",
      task: newTask
    };
  }

  // 3. ADD INVENTORY
  else if (/add\s+(an?\s+)?(inventory|material|item)|restock/i.test(rawText)) {
    let itemName = 'Crayons Set';
    const matchKeywords = ['inventory', 'material', 'item'];

    for (const kw of matchKeywords) {
      const idx = rawText.indexOf(kw);
      if (idx !== -1) {
        const rawItem = transcript.substring(idx + kw.length).trim();
        if (rawItem.length > 2) {
          itemName = rawItem.charAt(0).toUpperCase() + rawItem.slice(1);
          break;
        }
      }
    }

    const itemIndex = updatedDb.inventory.findIndex(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );

    if (itemIndex > -1) {
      updatedDb.inventory[itemIndex].stockLevel += 10;
      result.message = `Updated stock level of "${updatedDb.inventory[itemIndex].name}" (+10).`;
    } else {
      const newItem = {
        id: "INV" + Math.floor(100 + Math.random() * 900),
        name: itemName,
        category: "Replaceable items",
        stockLevel: 10,
        minStockLevel: 5,
        unit: "units"
      };
      updatedDb.inventory.push(newItem);
      result.message = `Added new item "${itemName}" to inventory ledger with 10 units.`;
    }

    result.success = true;
    result.speechText = {
      en: `Inventory ledger updated successfully for ${itemName}.`,
      ta: `சரக்கு புத்தகத்தில் ${itemName} சேர்க்கப்பட்டது.`
    };
    result.action = {
      type: "ADD_INVENTORY",
      itemName: itemName
    };
  }

  // 4. NAVIGATION
  else if (/go\s+to|open\s+(the\s+)?|show\s+(me\s+)?|navigate\s+to|switch\s+to/i.test(rawText)) {
    let targetView = 'dashboard';
    let viewName = 'Dashboard';
    let viewTamil = 'முகப்பு';

    if (rawText.includes('student')) {
      targetView = 'students';
      viewName = 'Students';
      viewTamil = 'மாணவர்கள்';
    } else if (rawText.includes('staff')) {
      targetView = 'staff';
      viewName = 'Staff Management';
      viewTamil = 'பணியாளர்கள்';
    } else if (rawText.includes('attendance')) {
      targetView = 'attendance';
      viewName = 'Attendance';
      viewTamil = 'வருகை';
    } else if (rawText.includes('task') || rawText.includes('board')) {
      targetView = 'tasks';
      viewName = 'Tasks Board';
      viewTamil = 'பணிகள்';
    } else if (rawText.includes('inventory') || rawText.includes('material')) {
      targetView = 'inventory';
      viewName = 'Inventory Ledger';
      viewTamil = 'சரக்கு';
    } else if (rawText.includes('cleaning') || rawText.includes('housekeeping')) {
      targetView = 'cleaning';
      viewName = 'Support & Cleaning';
      viewTamil = 'சுத்தம்';
    } else if (rawText.includes('lesson')) {
      targetView = 'lessons';
      viewName = 'Lesson Planning';
      viewTamil = 'பாடத் திட்டம்';
    } else if (rawText.includes('activit') || rawText.includes('event')) {
      targetView = 'activities';
      viewName = 'Activities & Events';
      viewTamil = 'செயல்பாடுகள்';
    } else if (rawText.includes('messag') || rawText.includes('chat') || rawText.includes('communication')) {
      targetView = 'communication';
      viewName = 'Communication';
      viewTamil = 'தொடர்பு';
    } else if (rawText.includes('setting')) {
      targetView = 'settings';
      viewName = 'Settings';
      viewTamil = 'அமைப்புகள்';
    } else if (rawText.includes('voice') || rawText.includes('portal') || rawText.includes('assistant')) {
      targetView = 'voice-portal';
      viewName = 'Voice Assistant Portal';
      viewTamil = 'குரல் உதவியாளர்';
    }

    result.success = true;
    result.message = `Navigated to ${viewName}.`;
    result.speechText = {
      en: `Switching to ${viewName} screen.`,
      ta: `${viewTamil} பக்கத்திற்கு மாற்றப்படுகிறது.`
    };
    result.action = {
      type: "NAVIGATE",
      targetView: targetView
    };
  }

  // 5. ADD A NEW STUDENT
  else if (/add\s+(a\s+)?student|enroll\s+(a\s+)?student|register\s+(a\s+)?student|new\s+student|^add\s+(?!a\s|an\s|item|task|inventory|liquid|soap|glue|hand)([a-z]+)/i.test(rawText)) {
    let studentName = 'New Student';
    const nameMatch = transcript.match(/(?:named?|called)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
    if (nameMatch) {
      studentName = nameMatch[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    } else {
      const addMatch = transcript.match(/^add\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
      if (addMatch) {
        const candidate = addMatch[1].trim();
        if (!/^(a|an|item|task|inventory|student|liquid|soap|glue|hand)$/i.test(candidate)) {
          studentName = candidate.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
      }
    }

    let studentClass = 'LKG';
    if (/nursery/i.test(rawText)) studentClass = 'Nursery';
    else if (/play\s*group/i.test(rawText)) studentClass = 'Play Group';
    else if (/ukg/i.test(rawText)) studentClass = 'UKG';
    else if (/lkg/i.test(rawText)) studentClass = 'LKG';

    const existingIds = updatedDb.students.map(s => s.id);
    let maxId = 100;
    existingIds.forEach(sid => {
      const num = parseInt(sid.substring(1), 10);
      if (!isNaN(num) && num > maxId) maxId = num;
    });
    const newId = 'S' + (maxId + 1);

    const newStudent = {
      id: newId,
      name: studentName,
      class: studentClass,
      section: "A",
      age: 4,
      parentName: "Parent of " + studentName,
      parentPhone: "+91 00000 00000",
      email: studentName.toLowerCase().replace(/\s+/g, '.') + "@example.com",
      status: "Active",
      enrollmentDate: today
    };

    updatedDb.students.push(newStudent);

    result.success = true;
    result.message = `Added new student "${studentName}" (ID: ${newId}) to ${studentClass} class.`;
    result.speechText = {
      en: `Student ${studentName} has been enrolled successfully in class ${studentClass}.`,
      ta: `${studentName} மாணவராக ${studentClass} வகுப்பில் சேர்க்கப்பட்டார்.`
    };
    result.action = {
      type: "ADD_STUDENT",
      student: newStudent
    };
  }

  // 6. REMOVE STUDENT
  else if (/remove\s+student|delete\s+student|deactivate\s+student|discharge\s+student/i.test(rawText)) {
    let foundStudentIndex = -1;
    const nameMatch = transcript.match(/(?:remove|delete|deactivate|discharge)\s+student\s+([A-Za-z]+)/i);

    if (nameMatch) {
      const targetName = nameMatch[1].toLowerCase().trim();
      foundStudentIndex = updatedDb.students.findIndex((s) => {
        const parts = s.name.toLowerCase().split(' ');
        return parts.includes(targetName);
      });
    }

    if (foundStudentIndex > -1) {
      updatedDb.students[foundStudentIndex].status = 'Inactive';
      const studentName = updatedDb.students[foundStudentIndex].name;
      const studentId = updatedDb.students[foundStudentIndex].id;

      result.success = true;
      result.message = `Student ${studentName} has been deactivated.`;
      result.speechText = {
        en: `${studentName} has been removed from the active student list.`,
        ta: `${studentName} மாணவர் பட்டியலிலிருந்து நீக்கப்பட்டார்.`
      };
      result.action = {
        type: "REMOVE_STUDENT",
        studentId: studentId
      };
    } else {
      result.message = "Could not find a student to remove. Please say the student's first name clearly.";
      result.speechText = {
        en: "Student not found. Please say the name clearly.",
        ta: "மாணவர் கண்டுபிடிக்கப்படவில்லை. தெளிவாக பெயர் சொல்லுங்கள்."
      };
    }
  }

  // 7. TASK STATUS UPDATE
  else if (/mark\s+(.+)\s+(done|completed|in\s+progress|pending)/i.test(rawText) || /complete\s+task\s+(.+)/i.test(rawText)) {
    let taskTitleQuery = '';
    let targetStatus = 'Done';
    let statusLabel = 'Done';
    let statusTamil = 'முடிக்கப்பட்டது';

    const matchDone = rawText.match(/mark\s+(.+)\s+(done|completed)/i);
    const matchInProgress = rawText.match(/mark\s+(.+)\s+(in\s+progress)/i);
    const matchPending = rawText.match(/mark\s+(.+)\s+(pending)/i);
    const matchComplete = rawText.match(/complete\s+task\s+(.+)/i);

    if (matchDone) {
      taskTitleQuery = matchDone[1].trim();
      targetStatus = 'Done';
    } else if (matchInProgress) {
      taskTitleQuery = matchInProgress[1].trim();
      targetStatus = 'In Progress';
      statusLabel = 'In Progress';
      statusTamil = 'செயல்பாட்டில் உள்ளது';
    } else if (matchPending) {
      taskTitleQuery = matchPending[1].trim();
      targetStatus = 'Pending';
      statusLabel = 'Pending';
      statusTamil = 'நிலுவையில் உள்ளது';
    } else if (matchComplete) {
      taskTitleQuery = matchComplete[1].trim();
      targetStatus = 'Done';
    }

    const taskIndex = updatedDb.tasks.findIndex(
      (t) => t.title.toLowerCase().includes(taskTitleQuery.toLowerCase()) || 
             taskTitleQuery.toLowerCase().includes(t.title.toLowerCase())
    );

    if (taskIndex > -1) {
      updatedDb.tasks[taskIndex].status = targetStatus;
      const title = updatedDb.tasks[taskIndex].title;
      const taskId = updatedDb.tasks[taskIndex].id;

      result.success = true;
      result.message = `Task '${title}' status updated to '${statusLabel}'.`;
      result.speechText = {
        en: `Task ${title} has been updated to ${statusLabel}.`,
        ta: `பணி '${title}' ${statusTamil} என மாற்றப்பட்டது.`
      };
      result.action = {
        type: "UPDATE_TASK",
        taskId: taskId,
        status: targetStatus
      };
    }
  }

  // 8. INDIVIDUAL STUDENT ATTENDANCE BY NAME
  else {
    let foundStudentIndex = -1;
    let studentStatus = 'Present';
    let statusTamil = 'வருகை பதிவு செய்யப்பட்டது';
    let statusEnglish = 'Present';

    foundStudentIndex = updatedDb.students.findIndex((s) => {
      if (s.status !== 'Active') return false;
      const first = s.name.split(' ')[0].toLowerCase();
      return rawText.includes(first);
    });

    if (foundStudentIndex > -1) {
      const student = updatedDb.students[foundStudentIndex];
      if (rawText.includes('absent') || 
          rawText.includes('varala') || 
          rawText.includes('varavillai') || 
          rawText.includes('illa') || 
          rawText.includes('leave')) {
        studentStatus = 'Absent';
        statusTamil = 'விடுப்பு பதிவு செய்யப்பட்டது';
        statusEnglish = 'Absent';
      }

      const existingRecordIndex = updatedDb.attendance.students.findIndex(
        (item) => item.date === today && item.studentId === student.id
      );

      if (existingRecordIndex > -1) {
        updatedDb.attendance.students[existingRecordIndex].status = studentStatus;
        updatedDb.attendance.students[existingRecordIndex].remarks = 'Voice command (Local Fallback)';
      } else {
        updatedDb.attendance.students.push({
          date: today,
          studentId: student.id,
          status: studentStatus,
          remarks: 'Voice command (Local Fallback)'
        });
      }

      result.success = true;
      result.message = `Marked student ${student.name} as ${studentStatus}.`;
      result.speechText = {
        en: `${student.name} marked as ${statusEnglish}.`,
        ta: `${student.name} ${statusTamil}.`
      };
      result.action = {
        type: "MARK_ATTENDANCE",
        studentId: student.id,
        status: studentStatus
      };
    }
  }

  // Log voice transaction
  const newLog = {
    id: "LOG" + Math.floor(1000 + Math.random() * 9000),
    timestamp: getFormattedTime(),
    voiceText: transcript,
    success: result.success,
    message: result.message,
    actionType: result.action ? result.action.type : 'UNKNOWN'
  };

  updatedDb.voiceLogs.unshift(newLog);
  updatedDb.voiceLogs = updatedDb.voiceLogs.slice(0, 30); // limit to 30 logs

  const spokenResponse = languagePreference === 'Tamil' ? result.speechText.ta : result.speechText.en;

  return {
    success: result.success,
    message: result.message,
    speechText: spokenResponse,
    action: result.action,
    updatedData: updatedDb
  };
}
