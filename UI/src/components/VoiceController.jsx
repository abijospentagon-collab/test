import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Check, X, Command } from 'lucide-react'
import { parseVoiceCommandLocally } from '../utils/voiceParser'

export default function VoiceController({ 
  students, 
  staff, 
  inventory, 
  tasks, 
  attendance,
  voiceLogs,
  languagePreference,
  setActiveView,
  onVoiceUpdate
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [showOverlay, setShowOverlay] = useState(false)
  const [parsedAction, setParsedAction] = useState(null)
  
  // Fallback keyboard command box
  const [showTypeBox, setShowTypeBox] = useState(false)
  const [typedCommand, setTypedCommand] = useState('')

  const recognitionRef = useRef(null)

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-IN'

      rec.onstart = () => {
        setIsRecording(true)
        setTranscript('Listening for command...')
        setParsedAction(null)
        setShowOverlay(true)
      }

      rec.onresult = (e) => {
        const resultText = e.results[0][0].transcript
        setTranscript(resultText)
        sendVoiceCommand(resultText)
      }

      rec.onerror = (e) => {
        console.error("Speech recognition error", e)
        setTranscript(`Error: ${e.error || 'could not capture speech'}`)
        setIsRecording(false)
      }

      rec.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = rec
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
    } else {
      try {
        recognitionRef.current?.start()
      } catch (err) {
        console.warn("Recognition start failed: speech is already active or permission denied.", err)
        setTranscript("Microphone activation failed. Use typing fallback below:")
        setShowOverlay(true)
      }
    }
  }

  // API Call to Backend NLP Engine
  const sendVoiceCommand = async (cmdText) => {
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
      
      if (data.error) {
        setParsedAction({
          type: 'UNKNOWN',
          label: 'Error',
          description: data.error,
          success: false
        });
        return;
      }

      setParsedAction({
        type: data.action?.type || 'UNKNOWN',
        label: data.success ? (data.action?.type ? data.action.type.replace('_', ' ') : 'Action Recognized') : 'Intent Unrecognized',
        description: data.message,
        speechText: data.speechText,
        success: data.success
      });

      // Execute action immediately if successful
      if (data.success) {
        // Trigger TTS in Tamil (ta-IN)
        if ('speechSynthesis' in window && data.speechText) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.speechText);
          utterance.lang = 'ta-IN';
          window.speechSynthesis.speak(utterance);
        }

        // Execute action changes in frontend UI
        if (data.action) {
          if (data.action.type === 'NAVIGATE') {
            setActiveView(data.action.targetView);
          }
          if (data.updatedData) {
            onVoiceUpdate(data.updatedData);
          }
        }

        // Auto-dismiss after 2 seconds
        setTimeout(() => {
          setShowOverlay(false);
          setParsedAction(null);
          setTranscript('');
        }, 2000);
      } else {
        // Auto-dismiss unrecognized intents after 3.5 seconds
        setTimeout(() => {
          setShowOverlay(false);
          setParsedAction(null);
          setTranscript('');
        }, 3500);
      }

    } catch (err) {
      console.warn("Error connecting to backend API, using local client-side fallback:", err);
      
      const localDbState = { 
        students, 
        staff, 
        inventory, 
        tasks, 
        attendance, 
        voiceLogs,
        activities: [],
        events: [],
        messages: { templates: [], conversations: [] }
      };
      
      const data = parseVoiceCommandLocally(cmdText, localDbState, languagePreference);

      setParsedAction({
        type: data.action?.type || 'UNKNOWN',
        label: data.success ? (data.action?.type ? data.action.type.replace('_', ' ') : 'Action Recognized') : 'Intent Unrecognized',
        description: data.message + " (Local Mode)",
        speechText: data.speechText,
        success: data.success
      });

      if (data.success) {
        if ('speechSynthesis' in window && data.speechText) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.speechText);
          utterance.lang = languagePreference === 'Tamil' ? 'ta-IN' : 'en-IN';
          window.speechSynthesis.speak(utterance);
        }

        if (data.action) {
          if (data.action.type === 'NAVIGATE') {
            setActiveView(data.action.targetView);
          }
          if (data.updatedData) {
            onVoiceUpdate(data.updatedData);
          }
        }

        setTimeout(() => {
          setShowOverlay(false);
          setParsedAction(null);
          setTranscript('');
        }, 2000);
      } else {
        setTimeout(() => {
          setShowOverlay(false);
          setParsedAction(null);
          setTranscript('');
        }, 3500);
      }
    }
  }

  const handleCancelOverlay = () => {
    setShowOverlay(false)
    setParsedAction(null)
    setTranscript('')
  }

  const handleTypeCommandSubmit = (e) => {
    e.preventDefault()
    if (!typedCommand.trim()) return
    setTranscript(typedCommand)
    sendVoiceCommand(typedCommand)
    setTypedCommand('')
  }

  return (
    <>
      {/* Floating Microphone Trigger */}
      <button 
        onClick={toggleRecording} 
        className={`voice-controller-btn ${isRecording ? 'recording' : ''}`}
        title="Voice Control (Web Speech API)"
      >
        {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
      </button>

      {/* Voice Assistant Confirmation Overlay */}
      {showOverlay && (
        <div className="glass-panel voice-overlay">
          <div className="voice-overlay-header">
            <div className="voice-status-indicator">
              {isRecording ? (
                <>
                  <span className="voice-pulse-dot" />
                  <span>Voice System: Listening...</span>
                </>
              ) : (
                <span>Voice System: Active</span>
              )}
            </div>
            <button 
              onClick={handleCancelOverlay} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* User Transcript box */}
          <div className="voice-transcript-box">
            {transcript ? (
              <span>"{transcript}"</span>
            ) : (
              <span className="voice-transcript-placeholder">
                {languagePreference === 'Tamil' 
                  ? 'சொல்லவும்: "Mark attendance for LKG" அல்லது "Go to Inventory"'
                  : 'Say: "Mark attendance for LKG", "Go to tasks" or "Create task for Savitri mop classroom"'}
              </span>
            )}
          </div>

          {/* Action Parsing Panel */}
          {parsedAction && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="voice-action-preview">
                <span className="voice-action-label" style={{ color: parsedAction.success ? 'var(--accent)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {parsedAction.success ? '✓' : '✗'} {parsedAction.label}
                </span>
                <p className="voice-action-desc">{parsedAction.description}</p>
              </div>

              <button onClick={handleCancelOverlay} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                Dismiss
              </button>
            </div>
          )}

          {/* Quick Click Simulation Buttons */}
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Quick Test Commands (Simulate Speech)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <button onClick={() => { setTranscript('Mark attendance for LKG'); sendVoiceCommand('Mark attendance for LKG'); }} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.06)' }}>Mark LKG Attendance</button>
              <button onClick={() => { setTranscript('Create task for Ramesh wash dining area'); sendVoiceCommand('Create task for Ramesh wash dining area'); }} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.04)' }}>Assign Cleaning Task</button>
              <button onClick={() => { setTranscript('Add inventory item Safety Scissors'); sendVoiceCommand('Add inventory item Safety Scissors'); }} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', background: 'rgba(217, 119, 6, 0.04)' }}>Add Safety Scissors</button>
              <button onClick={() => { setTranscript('Go to tasks'); sendVoiceCommand('Go to tasks'); }} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}>Navigate to Tasks</button>
            </div>
          </div>

          {/* Manual Input typing box */}
          <div style={{ marginTop: '0.25rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button"
                onClick={() => setShowTypeBox(!showTypeBox)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Command size={10} />
                {showTypeBox ? 'Hide Typing Fallback' : 'Type Command instead'}
              </button>
            </div>

            {showTypeBox && (
              <form onSubmit={handleTypeCommandSubmit} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                <input 
                  type="text" 
                  value={typedCommand} 
                  onChange={(e) => setTypedCommand(e.target.value)} 
                  placeholder="e.g. Create task for Ramesh clean washroom" 
                  className="form-control" 
                  style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.78rem' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.35rem' }}>
                  Parse
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
