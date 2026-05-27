import React, { useState } from 'react'
import { Mic, MicOff, Volume2, Languages, HelpCircle, FileText, CheckCircle2, XCircle, Command, Play } from 'lucide-react'
import { parseVoiceCommandLocally } from '../utils/voiceParser'

export default function VoiceAssistantView({ 
  students,
  staff,
  inventory,
  tasks,
  activities,
  events,
  messages,
  attendance,
  voiceLogs, 
  setVoiceLogs, 
  languagePreference, 
  setLanguagePreference,
  onVoiceUpdate
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [statusMsg, setStatusMsg] = useState('Standby - Ready for voice input')
  const [typedCommand, setTypedCommand] = useState('')
  const [showIndicator, setShowIndicator] = useState(false)

  // API Call to Backend
  const sendVoiceCommand = async (cmdText) => {
    setStatusMsg('Processing command with PHP NLP engine...')
    setShowIndicator(true)

    try {
      const response = await fetch('http://localhost:5000/api/voice.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: cmdText,
          languagePreference: 'Tamil'
        })
      });

      const data = await response.json();
      setShowIndicator(false)

      if (data.error) {
        setStatusMsg(`Error: ${data.error}`);
        return;
      }

      setStatusMsg(data.message);

      // Trigger text to speech on frontend in Tamil (ta-IN)
      if ('speechSynthesis' in window && data.speechText) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.speechText);
        utterance.lang = 'ta-IN';
        window.speechSynthesis.speak(utterance);
      }

      // Sync state back to React
      if (data.updatedData) {
        onVoiceUpdate(data.updatedData);
      }

    } catch (err) {
      console.warn("Error communicating with PHP backend, using local client-side fallback:", err);
      
      const localDbState = { students, staff, inventory, tasks, activities, events, messages, attendance, voiceLogs };
      const data = parseVoiceCommandLocally(cmdText, localDbState, languagePreference);
      
      setShowIndicator(false);
      setStatusMsg(data.message + " (Local Mode)");

      // Trigger text to speech on frontend
      if ('speechSynthesis' in window && data.speechText) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.speechText);
        utterance.lang = languagePreference === 'Tamil' ? 'ta-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }

      // Sync state back to React
      if (data.updatedData) {
        onVoiceUpdate(data.updatedData);
      }
    }
  }

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please use the typing fallback.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setStatusMsg('Speech captured.');
    } else {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-IN'

      rec.onstart = () => {
        setIsRecording(true)
        setTranscript('')
        setStatusMsg('Listening to your speech...')
      }

      rec.onresult = (e) => {
        const txt = e.results[0][0].transcript
        setTranscript(txt)
        sendVoiceCommand(txt)
      }

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e)
        setStatusMsg(`Speech recognition error: ${e.error}`);
        setIsRecording(false)
      }

      rec.onend = () => {
        setIsRecording(false)
      }

      rec.start()
    }
  }

  const handleTypeSubmit = (e) => {
    e.preventDefault()
    if (!typedCommand.trim()) return
    setTranscript(typedCommand)
    sendVoiceCommand(typedCommand)
    setTypedCommand('')
  }

  const clearLogs = () => {
    if (confirm("Are you sure you want to clear the voice transaction log?")) {
      setVoiceLogs([]);
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Voice Assistant Portal</h1>
          <p className="page-subtitle">Central speech controller linked directly to our PHP NLP backend processing system.</p>
        </div>

        {/* Interaction Info */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <Languages size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)' }}>
              Mode: Listen (English) ➔ Respond (Tamil)
            </span>
          </div>
        </div>
      </div>


      {/* Main Layout Grid */}
      <div className="dashboard-main-row" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
        
        {/* Left Column: Voice Hub Trigger & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Circular Voice Hub Card */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1.2rem' }}>Voice Speech Hub</h3>
            
            {/* Pulsing Voice Trigger */}
            <div style={{ position: 'relative', margin: '1rem 0' }}>
              {isRecording && (
                <>
                  <div className="voice-wave-ring" style={{ animationDelay: '0s' }} />
                  <div className="voice-wave-ring" style={{ animationDelay: '0.6s' }} />
                  <div className="voice-wave-ring" style={{ animationDelay: '1.2s' }} />
                </>
              )}
              
              <button 
                onClick={toggleRecording}
                className={`voice-portal-trigger-btn ${isRecording ? 'active' : ''}`}
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isRecording ? 'linear-gradient(135deg, var(--danger), #e11d48)' : 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: isRecording ? '0 0 30px rgba(244, 63, 94, 0.4)' : '0 8px 24px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>System Status</span>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: isRecording ? 'var(--danger)' : 'var(--accent)' }}>
                {statusMsg}
              </span>
            </div>

            {/* Transcript Card */}
            <div style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {transcript ? (
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-primary)' }}>"{transcript}"</p>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Click the mic and say a command. Captured transcript will appear here.</p>
              )}
            </div>
          </div>

          {/* Fallback Command Input Form */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Command size={15} style={{ color: 'var(--primary)' }} />
              Type Command (Backend Parsing)
            </h3>
            
            <form onSubmit={handleTypeSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={typedCommand} 
                onChange={(e) => setTypedCommand(e.target.value)} 
                placeholder="e.g. Mark attendance for LKG" 
                className="form-control"
                style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Parse Command
              </button>
            </form>
          </div>

          {/* Guidelines Templates */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={15} style={{ color: 'var(--warning)' }} />
              Voice Command Templates
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { text: 'Mark attendance for LKG', desc: 'Sets all active LKG students to Present.' },
                { text: 'Create task for Ramesh mop dining area', desc: 'Assigns cleaning tasks to staff.' },
                { text: 'Add inventory item Colored Chart Paper', desc: 'Adds/increments supply stock level.' },
                { text: 'Go to inventory', desc: 'Switches the dashboard view.' }
              ].map((cmd, i) => (
                <button 
                  key={i}
                  onClick={() => { setTranscript(cmd.text); sendVoiceCommand(cmd.text); }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '0.5rem 0.75rem' }}
                >
                  <div>
                    <code style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>"{cmd.text}"</code>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cmd.desc}</span>
                  </div>
                  <Play size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Voice logs table */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--accent)' }} />
              Voice Command Transaction Log
            </h2>
            
            {voiceLogs.length > 0 && (
              <button onClick={clearLogs} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                Clear Logs
              </button>
            )}
          </div>

          <div className="table-container" style={{ flex: 1, maxHeight: '550px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Timestamp</th>
                  <th>Spoken Phrase</th>
                  <th>Action / Description</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {voiceLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                      No voice transactions logged yet. Use the Speech Hub to trigger operations!
                    </td>
                  </tr>
                ) : (
                  voiceLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.timestamp}</td>
                      <td style={{ fontWeight: '600', fontStyle: 'italic', fontSize: '0.85rem' }}>"{log.voiceText}"</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>
                          <strong>{log.actionType}</strong>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{log.message}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {log.success ? (
                          <span className="badge badge-active" style={{ fontSize: '0.65rem', gap: '0.15rem' }}>
                            <CheckCircle2 size={10} /> Success
                          </span>
                        ) : (
                          <span className="badge badge-inactive" style={{ fontSize: '0.65rem', gap: '0.15rem' }}>
                            <XCircle size={10} /> Unmatched
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  )
}
