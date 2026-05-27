import React, { useState } from 'react'
import { Volume2, Languages, HelpCircle, CheckSquare, Plus, AlertTriangle, ShieldCheck, Play } from 'lucide-react'

// Multilingual translations for mock tasks
const translations = {
  English: {
    "Sanitize Play Area Blocks": "Sanitize Play Area Blocks",
    "Wipe down all plastic blocks in the Play Group area with disinfectant.": "Wipe down all plastic blocks in the Play Group area with disinfectant.",
    "Repair Playground Swing Link": "Repair Playground Swing Link",
    "Fix the squeaky and loose chain on the middle swing.": "Fix the squeaky and loose chain on the middle swing.",
    "Clean Main Corridor Windows": "Clean Main Corridor Windows",
    "Wash and squeegee all low-level glass panes in the main lobby.": "Wash and squeegee all low-level glass panes in the main lobby.",
    "Mop Kitchen Dining Area": "Mop Kitchen Dining Area",
    "Sanitize and mop the floor before lunch service starts.": "Sanitize and mop the floor before lunch service starts.",
    "Location": "Location",
    "Assigned To": "Assigned To",
    "Report issue": "Report Issue",
    "Status": "Status"
  },
  Spanish: {
    "Sanitize Play Area Blocks": "Desinfectar bloques de área de juego",
    "Wipe down all plastic blocks in the Play Group area with disinfectant.": "Limpiar todos los bloques de plástico en el área de juegos con desinfectante.",
    "Repair Playground Swing Link": "Reparar cadena de columpio de patio",
    "Fix the squeaky and loose chain on the middle swing.": "Arreglar la cadena floja y chillona en el columpio del medio.",
    "Clean Main Corridor Windows": "Limpiar ventanas del pasillo principal",
    "Wash and squeegee all low-level glass panes in the main lobby.": "Lavar y limpiar todos los cristales bajos del vestíbulo principal.",
    "Mop Kitchen Dining Area": "Trapear el comedor de la cocina",
    "Sanitize and mop the floor before lunch service starts.": "Desinfectar y trapear el piso antes de comenzar el almuerzo.",
    "Location": "Ubicación",
    "Assigned To": "Asignado a",
    "Report issue": "Informar un problema",
    "Status": "Estado"
  },
  Hindi: {
    "Sanitize Play Area Blocks": "खेल क्षेत्र के ब्लॉक को साफ करें",
    "Wipe down all plastic blocks in the Play Group area with disinfectant.": "प्ले ग्रुप क्षेत्र के सभी प्लास्टिक ब्लॉकों को कीटाणुनाशक से साफ करें।",
    "Repair Playground Swing Link": "खेल के मैदान के झूले की मरम्मत करें",
    "Fix the squeaky and loose chain on the middle swing.": "बीच वाले झूले की चरमराती और ढीली जंजीर को ठीक करें।",
    "Clean Main Corridor Windows": "मुख्य गलियारे की खिड़कियां साफ करें",
    "Wash and squeegee all low-level glass panes in the main lobby.": "मुख्य लॉबी में सभी निचले स्तर के कांच के शीशों को धोएं और साफ करें।",
    "Mop Kitchen Dining Area": "रसोई के भोजन क्षेत्र में पोछा लगाएं",
    "Sanitize and mop the floor before lunch service starts.": "दोपहर के भोजन की सेवा शुरू होने से पहले फर्श को साफ करें और पोछा लगाएं।",
    "Location": "स्थान",
    "Assigned To": "सौंपा गया",
    "Report issue": "समस्या की रिपोर्ट करें",
    "Status": "स्थिति"
  }
}

export default function CleaningView({ tasks, setTasks, staff }) {
  const [language, setLanguage] = useState('English')
  const [showReportForm, setShowReportForm] = useState(false)
  const [issueData, setIssueData] = useState({
    title: '',
    location: '',
    description: '',
    urgency: 'Medium'
  })

  // Filter tasks belonging to cleaning/maintenance
  const supportTasks = tasks.filter(t => t.category === 'Cleaning' || t.category === 'Maintenance')

  // Text to Speech
  const readAloud = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel ongoing synthesis
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Attempt language matching
      if (language === 'Spanish') utterance.lang = 'es-ES'
      else if (language === 'Hindi') utterance.lang = 'hi-IN'
      else utterance.lang = 'en-US'
      
      window.speechSynthesis.speak(utterance)
    } else {
      alert("Text-to-speech is not supported on this browser.")
    }
  }

  // Translate helper
  const translate = (text) => {
    return translations[language]?.[text] || text
  }

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t
      const nextStatus = t.status === 'Pending' ? 'In Progress' : t.status === 'In Progress' ? 'Done' : 'Pending'
      return { ...t, status: nextStatus }
    }))
  }

  const handleReportIssue = (e) => {
    e.preventDefault()
    if (!issueData.title.trim()) return

    const newIssueTask = {
      id: `T${Date.now().toString().slice(-3)}`,
      title: `[Support Report] ${issueData.title}`,
      description: `Location: ${issueData.location}. Detail: ${issueData.description}`,
      assignedTo: 'ST205', // Assign to support maintenance staff by default
      priority: issueData.urgency,
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Maintenance'
    }

    setTasks([...tasks, newIssueTask])
    setShowReportForm(false)
    setIssueData({ title: '', location: '', description: '', urgency: 'Medium' })
    alert('Issue reported successfully! Task created for maintenance staff.')
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Support & Housekeeping</h1>
          <p className="page-subtitle">Roster schedules, location logs, and accessibility translations for cleaning staff.</p>
        </div>

        {/* Translation tools */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <Languages size={16} style={{ color: 'var(--primary)' }} />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              className="lang-select"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '600' }}
            >
              <option value="English">English</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <button onClick={() => setShowReportForm(true)} className="btn btn-danger">
            <AlertTriangle size={16} />
            {translate('Report issue')}
          </button>
        </div>
      </div>

      {/* Main Grid: Tasks checklist on left, location map/details on right */}
      <div className="dashboard-main-row">
        
        {/* Support Tasks checklist */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title">Active Housekeeping Tasks</h2>
            <span className="badge badge-active">{language} Roster</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {supportTasks.map(task => {
              const staffMember = staff.find(st => st.id === task.assignedTo)
              const translatedTitle = translate(task.title.replace("[Support Report] ", ""))
              const translatedDesc = translate(task.description)
              const displayTitle = task.title.startsWith("[Support Report] ") ? `[REPORTE] ${translatedTitle}` : translatedTitle
              
              let statusText = 'To Do'
              let statusBadge = 'badge-inactive'
              if (task.status === 'In Progress') {
                statusText = 'In Progress'
                statusBadge = 'badge-warning'
              } else if (task.status === 'Done') {
                statusText = 'Completed'
                statusBadge = 'badge-active'
              }

              return (
                <div 
                  key={task.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '1.25rem', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    background: 'rgba(255, 255, 255, 0.015)',
                    borderColor: task.status === 'Done' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-glass)'
                  }}
                >
                  <div style={{ flex: 1, marginRight: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.05rem', color: task.status === 'Done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'Done' ? 'line-through' : 'none' }}>
                        {displayTitle}
                      </span>
                      <span className={`badge ${statusBadge}`} style={{ fontSize: '0.65rem' }}>
                        {statusText}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {translatedDesc}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span><strong>{translate('Location')}:</strong> {task.category === 'Cleaning' ? 'Playrooms/Classrooms' : 'Campus Areas'}</span>
                      <span><strong>{translate('Assigned To')}:</strong> {staffMember ? staffMember.name : 'Ramesh Kumar'}</span>
                    </div>
                  </div>

                  {/* Accessible action controls */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => readAloud(`${translatedTitle}. ${translatedDesc}`)} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)' }} 
                      title="Read details aloud"
                    >
                      <Volume2 size={16} style={{ color: 'var(--primary)' }} />
                    </button>
                    
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`btn ${task.status === 'Done' ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      <CheckSquare size={14} />
                      {task.status === 'Pending' ? 'Start' : task.status === 'In Progress' ? 'Complete' : 'Re-open'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Location based tracking & guidelines info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="dashboard-panel-header">
              <h3 className="dashboard-panel-title">Location Coverage</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Kitchen & Pantry', desc: 'Sanitized at 07:30 AM', status: 'Cleaned', pct: 100 },
                { name: 'Nursery Rooms', desc: 'Active play area. Mop scheduled.', status: 'Pending', pct: 40 },
                { name: 'Main Lobby & Office', desc: 'Windows being cleaned by Anita', status: 'Ongoing', pct: 70 },
                { name: 'Washrooms & Sinks', desc: 'Disinfectant refill checklist', status: 'Cleaned', pct: 100 }
              ].map((loc, idx) => (
                <div key={idx} style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
                    <span>{loc.name}</span>
                    <span style={{ color: loc.status === 'Cleaned' ? 'var(--accent)' : 'var(--warning)' }}>{loc.status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${loc.pct}%`, height: '100%', background: loc.status === 'Cleaned' ? 'var(--accent)' : 'var(--warning)' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{loc.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.03), rgba(0,0,0,0))' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Volume2 size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.25rem' }}>Text-to-Speech Guidance</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Click the speaker button next to any task to have the description spoken aloud in the selected language. This helps non-native staff members verify task instructions accurately.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Report Issue Modal */}
      {showReportForm && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                <AlertTriangle size={20} />
                Report Campus Issue
              </h2>
              <button onClick={() => setShowReportForm(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportIssue} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input 
                  type="text" 
                  required
                  value={issueData.title}
                  onChange={(e) => setIssueData({ ...issueData, title: e.target.value })}
                  placeholder="e.g. Washroom Sink Clogged" 
                  className="form-control" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input 
                    type="text" 
                    required
                    value={issueData.location}
                    onChange={(e) => setIssueData({ ...issueData, location: e.target.value })}
                    placeholder="e.g. Main Lobby Washroom" 
                    className="form-control" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Urgency Level</label>
                  <select 
                    value={issueData.urgency}
                    onChange={(e) => setIssueData({ ...issueData, urgency: e.target.value })}
                    className="form-control"
                  >
                    <option value="High">Urgent / Critical</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Details</label>
                <textarea 
                  required
                  rows="3"
                  value={issueData.description}
                  onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
                  placeholder="Provide details about the issue (e.g. water leaking on floor, needs immediate repairs)..." 
                  className="form-control" 
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowReportForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
