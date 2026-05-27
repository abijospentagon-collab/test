import React, { useState, useEffect } from 'react'

// Modular Components
import Sidebar from './components/Sidebar'
import VoiceController from './components/VoiceController'
import DashboardView from './components/DashboardView'
import StudentView from './components/StudentView'
import StaffView from './components/StaffView'
import AttendanceView from './components/AttendanceView'
import InventoryView from './components/InventoryView'
import TaskView from './components/TaskView'
import CleaningView from './components/CleaningView'
import LessonPlanView from './components/LessonPlanView'
import ActivitiesView from './components/ActivitiesView'
import CommunicationView from './components/CommunicationView'
import SettingsView from './components/SettingsView'
import VoiceAssistantView from './components/VoiceAssistantView'

export default function App() {
  // Global States (fetched from backend)
  const [students, setStudents] = useState([])
  const [staff, setStaff] = useState([])
  const [inventory, setInventory] = useState([])
  const [tasks, setTasks] = useState([])
  const [activities, setActivities] = useState([])
  const [events, setEvents] = useState([])
  const [messages, setMessages] = useState({ templates: [], conversations: [] })
  const [attendance, setAttendance] = useState({ students: [], staff: [] })
  const [voiceLogs, setVoiceLogs] = useState([])

  const [activeView, setActiveView] = useState('dashboard')
  const [languagePreference, setLanguagePreference] = useState('English') // English or Tamil

  // Fetch initial state on load
  useEffect(() => {
    fetch('http://localhost:5000/api/state.php')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (data.students) setStudents(data.students);
          if (data.staff) setStaff(data.staff);
          if (data.inventory) setInventory(data.inventory);
          if (data.tasks) setTasks(data.tasks);
          if (data.activities) setActivities(data.activities);
          if (data.events) setEvents(data.events);
          if (data.messages) setMessages(data.messages);
          if (data.attendance) setAttendance(data.attendance);
          if (data.voiceLogs) setVoiceLogs(data.voiceLogs);
        }
      })
      .catch(err => console.error("Error fetching state from PHP backend:", err));
  }, []);

  // Central Sync Function
  const saveStateToBackend = (updatedFields) => {
    const nextState = {
      students: updatedFields.students !== undefined ? updatedFields.students : students,
      staff: updatedFields.staff !== undefined ? updatedFields.staff : staff,
      inventory: updatedFields.inventory !== undefined ? updatedFields.inventory : inventory,
      tasks: updatedFields.tasks !== undefined ? updatedFields.tasks : tasks,
      activities: updatedFields.activities !== undefined ? updatedFields.activities : activities,
      events: updatedFields.events !== undefined ? updatedFields.events : events,
      messages: updatedFields.messages !== undefined ? updatedFields.messages : messages,
      attendance: updatedFields.attendance !== undefined ? updatedFields.attendance : attendance,
      voiceLogs: updatedFields.voiceLogs !== undefined ? updatedFields.voiceLogs : voiceLogs
    };

    // Update local react states
    if (updatedFields.students !== undefined) setStudents(updatedFields.students);
    if (updatedFields.staff !== undefined) setStaff(updatedFields.staff);
    if (updatedFields.inventory !== undefined) setInventory(updatedFields.inventory);
    if (updatedFields.tasks !== undefined) setTasks(updatedFields.tasks);
    if (updatedFields.activities !== undefined) setActivities(updatedFields.activities);
    if (updatedFields.events !== undefined) setEvents(updatedFields.events);
    if (updatedFields.messages !== undefined) setMessages(updatedFields.messages);
    if (updatedFields.attendance !== undefined) setAttendance(updatedFields.attendance);
    if (updatedFields.voiceLogs !== undefined) setVoiceLogs(updatedFields.voiceLogs);

    // Save to backend db.json
    fetch('http://localhost:5000/api/state.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextState)
    })
    .catch(err => console.error("Error saving state to PHP backend:", err));
  };

  // Helper setters that wrap sync logic
  const handleSetStudents = (val) => {
    const next = typeof val === 'function' ? val(students) : val;
    saveStateToBackend({ students: next });
  };
  const handleSetStaff = (val) => {
    const next = typeof val === 'function' ? val(staff) : val;
    saveStateToBackend({ staff: next });
  };
  const handleSetInventory = (val) => {
    const next = typeof val === 'function' ? val(inventory) : val;
    saveStateToBackend({ inventory: next });
  };
  const handleSetTasks = (val) => {
    const next = typeof val === 'function' ? val(tasks) : val;
    saveStateToBackend({ tasks: next });
  };
  const handleSetActivities = (val) => {
    const next = typeof val === 'function' ? val(activities) : val;
    saveStateToBackend({ activities: next });
  };
  const handleSetEvents = (val) => {
    const next = typeof val === 'function' ? val(events) : val;
    saveStateToBackend({ events: next });
  };
  const handleSetMessages = (val) => {
    const next = typeof val === 'function' ? val(messages) : val;
    saveStateToBackend({ messages: next });
  };
  const handleSetAttendance = (val) => {
    const next = typeof val === 'function' ? val(attendance) : val;
    saveStateToBackend({ attendance: next });
  };

  // Sidebar count calculations
  const pendingTasksCount = tasks.filter(t => t.status !== 'Done').length
  const lowStockCount = inventory.filter(item => item.stockLevel <= item.minStockLevel).length

  const counts = {
    pendingTasks: pendingTasksCount,
    lowStockItems: lowStockCount
  }

  // Render view router
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView 
            students={students}
            staff={staff}
            attendance={attendance}
            inventory={inventory}
            tasks={tasks}
            setActiveView={setActiveView}
          />
        )
      case 'students':
        return (
          <StudentView 
            students={students}
            setStudents={handleSetStudents}
          />
        )
      case 'staff':
        return (
          <StaffView 
            staff={staff}
            setStaff={handleSetStaff}
          />
        )
      case 'attendance':
        return (
          <AttendanceView 
            students={students}
            staff={staff}
            attendance={attendance}
            setAttendance={handleSetAttendance}
          />
        )
      case 'inventory':
        return (
          <InventoryView 
            inventory={inventory}
            setInventory={handleSetInventory}
          />
        )
      case 'tasks':
        return (
          <TaskView 
            tasks={tasks}
            setTasks={handleSetTasks}
            staff={staff}
          />
        )
      case 'cleaning':
        return (
          <CleaningView 
            tasks={tasks}
            setTasks={handleSetTasks}
            staff={staff}
          />
        )
      case 'lessons':
        return (
          <LessonPlanView 
            students={students}
          />
        )
      case 'activities':
        return (
          <ActivitiesView 
            activities={activities}
            setActivities={handleSetActivities}
            events={events}
            setEvents={handleSetEvents}
            inventory={inventory}
          />
        )
      case 'communication':
        return (
          <CommunicationView 
            messages={messages}
            setMessages={handleSetMessages}
            students={students}
          />
        )
      case 'voice-portal':
        return (
          <VoiceAssistantView 
            voiceLogs={voiceLogs}
            setVoiceLogs={(logs) => saveStateToBackend({ voiceLogs: logs })}
            languagePreference={languagePreference}
            setLanguagePreference={setLanguagePreference}
            onVoiceUpdate={(newData) => {
              if (newData.students) setStudents(newData.students);
              if (newData.staff) setStaff(newData.staff);
              if (newData.inventory) setInventory(newData.inventory);
              if (newData.tasks) setTasks(newData.tasks);
              if (newData.activities) setActivities(newData.activities);
              if (newData.events) setEvents(newData.events);
              if (newData.messages) setMessages(newData.messages);
              if (newData.attendance) setAttendance(newData.attendance);
              if (newData.voiceLogs) setVoiceLogs(newData.voiceLogs);
            }}
          />
        )
      case 'settings':
        return (
          <SettingsView />
        )
      default:
        return (
          <DashboardView 
            students={students}
            staff={staff}
            attendance={attendance}
            inventory={inventory}
            tasks={tasks}
            setActiveView={setActiveView}
          />
        )
    }
  }

  return (
    <div className="app-container">
      {/* Sidebar Nav */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        counts={counts}
      />

      {/* Main Content Router Area */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* Persistent Voice Controller Assistant */}
      <VoiceController 
        students={students}
        staff={staff}
        inventory={inventory}
        tasks={tasks}
        attendance={attendance}
        voiceLogs={voiceLogs}
        languagePreference={languagePreference}
        setActiveView={setActiveView}
        onVoiceUpdate={(newData) => {
          if (newData.students) setStudents(newData.students);
          if (newData.staff) setStaff(newData.staff);
          if (newData.inventory) setInventory(newData.inventory);
          if (newData.tasks) setTasks(newData.tasks);
          if (newData.activities) setActivities(newData.activities);
          if (newData.events) setEvents(newData.events);
          if (newData.messages) setMessages(newData.messages);
          if (newData.attendance) setAttendance(newData.attendance);
          if (newData.voiceLogs) setVoiceLogs(newData.voiceLogs);
        }}
      />
    </div>
  )
}
