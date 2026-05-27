import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database read/write helpers
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return {};
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

// REST Endpoints
app.get('/api/status', (req, res) => {
  res.json({ status: 'running', service: 'Sorted OS Backend API' });
});

app.get('/api/state', (req, res) => {
  res.json(readDB());
});

app.post('/api/state', (req, res) => {
  const newState = req.body;
  if (!newState || typeof newState !== 'object') {
    return res.status(400).json({ error: 'Invalid state object' });
  }
  writeDB(newState);
  res.json({ success: true, message: 'State synchronized successfully.' });
});

// NLP Speech Command Processor
  const transcript = req.body.transcript || req.body.message;
  const languagePreference = req.body.languagePreference || 'English';
  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  const db = readDB();
  const rawText = transcript.toLowerCase().trim();
  const today = new Date().toISOString().split('T')[0];

  let result = {
    success: false,
    message: "Command not recognized. Please try again or use the template guidelines.",
    speechText: {
      en: "Sorry, I could not understand that command.",
      ta: "மன்னிக்கவும், அந்த கட்டளையை என்னால் புரிந்து கொள்ள முடியவில்லை."
    },
    action: null
  };

  // 1. Mark Attendance
  if (rawText.includes('mark attendance for')) {
    let targetClass = 'LKG';
    let targetTamilClass = 'எல்.கே.ஜி';
    if (rawText.includes('nursery')) { targetClass = 'Nursery'; targetTamilClass = 'நர்சரி'; }
    else if (rawText.includes('play group') || rawText.includes('playgroup')) { targetClass = 'Play Group'; targetTamilClass = 'ப்ளே குரூப்'; }
    else if (rawText.includes('ukg')) { targetClass = 'UKG'; targetTamilClass = 'யு.கே.ஜி'; }

    const list = [...(db.attendance?.students || [])];
    const classStudents = db.students?.filter(s => s.status === 'Active' && s.class === targetClass) || [];

    if (classStudents.length > 0) {
      classStudents.forEach(student => {
        const idx = list.findIndex(item => item.date === today && item.studentId === student.id);
        if (idx > -1) {
          list[idx] = { ...list[idx], status: 'Present', remarks: 'Marked via Voice (Express Server)' };
        } else {
          list.push({ date: today, studentId: student.id, status: 'Present', remarks: 'Marked via Voice (Express Server)' });
        }
      });

      db.attendance = { ...(db.attendance || {}), students: list };
      result.success = true;
      result.message = `Marked attendance for all students in class ${targetClass}.`;
      result.speechText = {
        en: `Attendance marked successfully for class ${targetClass}.`,
        ta: `${targetTamilClass} வகுப்பிற்கு வருகை பதிவு செய்யப்பட்டது.`
      };
      result.action = { type: 'MARK_ATTENDANCE', targetClass };
    } else {
      result.message = `No active students found in class ${targetClass}.`;
      result.speechText = {
        en: `No active students found in class ${targetClass}.`,
        ta: `${targetTamilClass} வகுப்பில் மாணவர்கள் யாரும் இல்லை.`
      };
    }
  }

  // 2. Create Task
  else if (rawText.includes('create task') || rawText.includes('assign task')) {
    let assigneeId = 'ST203'; // Default Savitri Devi
    let assigneeName = 'Savitri Devi';
    let assigneeTamil = 'சாவித்திரி தேவி';

    if (rawText.includes('ramesh') || rawText.includes('kitchen') || rawText.includes('maintenance')) {
      assigneeId = 'ST205';
      assigneeName = 'Ramesh Kumar';
      assigneeTamil = 'ரமேஷ் குமார்';
    } else if (rawText.includes('priya') || rawText.includes('lkg teacher')) {
      assigneeId = 'ST201';
      assigneeName = 'Priya Sen';
      assigneeTamil = 'பிரியா சென்';
    } else if (rawText.includes('anita') || rawText.includes('ukg teacher')) {
      assigneeId = 'ST204';
      assigneeName = 'Anita Kapoor';
      assigneeTamil = 'அனிதா கபூர்';
    } else if (rawText.includes('admin') || rawText.includes('rohan')) {
      assigneeId = 'ST202';
      assigneeName = 'Rohan Das';
      assigneeTamil = 'ரோஹன் தாஸ்';
    }

    // Extract task details
    let taskTitle = 'Clean classroom';
    const splitKeywords = ['staff', 'for', 'to'];
    let parsedTitle = '';
    
    for (const kw of splitKeywords) {
      const idx = rawText.indexOf(kw);
      if (idx > -1) {
        const rawSuffix = transcript.slice(idx + kw.length).trim();
        const cleanSuffix = rawSuffix.replace(/savitri|ramesh|priya|anita|rohan|cleaning staff|support staff/gi, '').trim();
        if (cleanSuffix.length > 3) {
          parsedTitle = cleanSuffix;
          break;
        }
      }
    }

    if (parsedTitle) {
      taskTitle = parsedTitle.charAt(0).toUpperCase() + parsedTitle.slice(1);
    } else {
      taskTitle = `Housekeeping assignment`;
    }

    const newTask = {
      id: `T${Date.now().toString().slice(-3)}`,
      title: taskTitle,
      description: `Voice task assigned from server: ${taskTitle}`,
      assignedTo: assigneeId,
      priority: 'Medium',
      status: 'Pending',
      dueDate: today,
      category: 'Cleaning'
    };

    db.tasks = [...(db.tasks || []), newTask];
    result.success = true;
    result.message = `Created task "${taskTitle}" and assigned to ${assigneeName}.`;
    result.speechText = {
      en: `Task assigned successfully to ${assigneeName}.`,
      ta: `பணி வெற்றிகரமாக உருவாக்கப்பட்டு ${assigneeTamil}விடம் ஒப்படைக்கப்பட்டது.`
    };
    result.action = { type: 'CREATE_TASK', task: newTask };
  }

  // 3. Add Inventory Item
  else if (rawText.includes('add inventory') || rawText.includes('add material') || rawText.includes('add item')) {
    let itemName = 'Crayons Set';
    const matchKeywords = ['inventory', 'material', 'item'];
    
    for (const kw of matchKeywords) {
      const idx = rawText.indexOf(kw);
      if (idx > -1) {
        const rawItem = transcript.slice(idx + kw.length).trim();
        if (rawItem.length > 2) {
          itemName = rawItem.charAt(0).toUpperCase() + rawItem.slice(1);
          break;
        }
      }
    }

    const inventoryList = [...(db.inventory || [])];
    const itemIndex = inventoryList.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (itemIndex > -1) {
      inventoryList[itemIndex].stockLevel += 10;
      result.message = `Updated stock level of "${inventoryList[itemIndex].name}" (+10).`;
    } else {
      const newItem = {
        id: `INV${Date.now().toString().slice(-3)}`,
        name: itemName,
        category: 'Replaceable items',
        stockLevel: 10,
        minStockLevel: 5,
        unit: 'units'
      };
      inventoryList.push(newItem);
      result.message = `Added new item "${itemName}" to inventory ledger with 10 units.`;
    }

    db.inventory = inventoryList;
    result.success = true;
    result.speechText = {
      en: `Inventory ledger updated successfully for ${itemName}.`,
      ta: `சரக்கு புத்தகத்தில் ${itemName} சேர்க்கப்பட்டது.`
    };
    result.action = { type: 'ADD_INVENTORY', itemName };
  }

  // 4. Navigation
  else if (rawText.startsWith('go to') || rawText.startsWith('open') || rawText.startsWith('show')) {
    let targetView = 'dashboard';
    let viewName = 'Dashboard';
    let viewTamil = 'முகப்பு';

    if (rawText.includes('student')) { targetView = 'students'; viewName = 'Students'; viewTamil = 'மாணவர்கள்'; }
    else if (rawText.includes('staff')) { targetView = 'staff'; viewName = 'Staff Management'; viewTamil = 'பணியாளர்கள்'; }
    else if (rawText.includes('attendance')) { targetView = 'attendance'; viewName = 'Attendance'; viewTamil = 'வருகை'; }
    else if (rawText.includes('task') || rawText.includes('board')) { targetView = 'tasks'; viewName = 'Tasks Board'; viewTamil = 'பணிகள்'; }
    else if (rawText.includes('inventory') || rawText.includes('material')) { targetView = 'inventory'; viewName = 'Inventory Ledger'; viewTamil = 'சரக்கு'; }
    else if (rawText.includes('cleaning') || rawText.includes('housekeeping')) { targetView = 'cleaning'; viewName = 'Support & Cleaning'; viewTamil = 'சுத்தம்'; }
    else if (rawText.includes('lesson')) { targetView = 'lessons'; viewName = 'Lesson Planning'; viewTamil = 'பாடத் திட்டம்'; }
    else if (rawText.includes('activit') || rawText.includes('event')) { targetView = 'activities'; viewName = 'Activities & Events'; viewTamil = 'செயல்பாடுகள்'; }
    else if (rawText.includes('messag') || rawText.includes('chat') || rawText.includes('communication')) { targetView = 'communication'; viewName = 'Communication'; viewTamil = 'தொடர்பு'; }
    else if (rawText.includes('setting')) { targetView = 'settings'; viewName = 'Settings'; viewTamil = 'அமைப்புகள்'; }
    else if (rawText.includes('voice') || rawText.includes('portal') || rawText.includes('assistant')) { targetView = 'voice-portal'; viewName = 'Voice Assistant Portal'; viewTamil = 'குரல் உதவியாளர்'; }

    result.success = true;
    result.message = `Navigated to ${viewName}.`;
    result.speechText = {
      en: `Switching to ${viewName} screen.`,
      ta: `${viewTamil} பக்கத்திற்கு மாற்றப்படுகிறது.`
    };
    result.action = { type: 'NAVIGATE', targetView };
  }

  // 5. Individual Student Attendance By Name (Fallback Match)
  else {
    let foundStudent = null;
    let studentStatus = 'Present';
    let statusTamil = 'வருகை பதிவு செய்யப்பட்டது';
    let statusEnglish = 'Present';

    const studentsList = db.students || [];
    for (const s of studentsList) {
      if (s.status === 'Active') {
        const parts = s.name.toLowerCase().split(' ');
        const firstName = parts[0];
        if (rawText.includes(firstName)) {
          foundStudent = s;
          break;
        }
      }
    }

    if (foundStudent) {
      if (rawText.includes('absent') || 
          rawText.includes('varala') || 
          rawText.includes('varavillai') || 
          rawText.includes('illa') || 
          rawText.includes('leave')) {
        studentStatus = 'Absent';
        statusTamil = 'விடுப்பு பதிவு செய்யப்பட்டது';
        statusEnglish = 'Absent';
      }

      const list = [...(db.attendance?.students || [])];
      const idx = list.findIndex(item => item.date === today && item.studentId === foundStudent.id);
      
      if (idx > -1) {
        list[idx] = { ...list[idx], status: studentStatus, remarks: 'Marked via Voice (Express Server Fallback)' };
      } else {
        list.push({ date: today, studentId: foundStudent.id, status: studentStatus, remarks: 'Marked via Voice (Express Server Fallback)' });
      }

      db.attendance = { ...(db.attendance || {}), students: list };
      result.success = true;
      result.message = `Marked student ${foundStudent.name} as ${studentStatus}.`;
      result.speechText = {
        en: `${foundStudent.name} marked as ${statusEnglish}.`,
        ta: `${foundStudent.name} ${statusTamil}.`
      };
      result.action = {
        type: 'MARK_ATTENDANCE',
        studentId: foundStudent.id,
        status: studentStatus
      };
    }
  }

  // Save transaction log
  const newLog = {
    id: `LOG${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toLocaleTimeString(),
    voiceText: transcript,
    success: result.success,
    message: result.message,
    actionType: result.action?.type || 'UNKNOWN'
  };

  db.voiceLogs = [newLog, ...(db.voiceLogs || [])].slice(0, 30); // limit to 30 logs

  writeDB(db);

  res.json({
    success: result.success,
    message: result.message,
    speechText: languagePreference === 'Tamil' ? result.speechText.ta : result.speechText.en,
    action: result.action,
    updatedData: db
  });
});

app.listen(PORT, () => {
  console.log(`Sorted Backend Server running on http://localhost:${PORT}`);
});
