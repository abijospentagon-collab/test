import React, { useState } from 'react'
import { Send, FileText, Megaphone, Users, User, Clock, CheckCircle } from 'lucide-react'

export default function CommunicationView({ messages, setMessages, students }) {
  const [activeChatIndex, setActiveChatIndex] = useState(0)
  const [inputText, setInputText] = useState('')
  
  // Broadcast Compose State
  const [broadcastType, setBroadcastType] = useState('Announcement') // template types
  const [broadcastTarget, setBroadcastTarget] = useState('Parents') // Parents or Staff
  const [broadcastSubject, setBroadcastSubject] = useState('')
  const [broadcastContent, setBroadcastContent] = useState('')

  // Load template
  const handleLoadTemplate = (tpl) => {
    setBroadcastType(tpl.type)
    setBroadcastSubject(tpl.subject)
    setBroadcastContent(tpl.content)
  }

  // Send Broadcast
  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!broadcastContent.trim() || !broadcastSubject.trim()) return

    // Simulated broadcast
    alert(`Broadcast sent successfully!\nTarget: All Active ${broadcastTarget}\nType: ${broadcastType}\nSubject: ${broadcastSubject}`)
    setBroadcastSubject('')
    setBroadcastContent('')
  }

  // Send Chat message
  const handleSendChatMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const conversations = [...(messages.conversations || [])]
    const activeConvo = conversations[activeChatIndex]
    
    if (activeConvo) {
      activeConvo.messages.push({
        sender: 'admin',
        text: inputText.trim(),
        timestamp: new Date().toISOString()
      })
      setMessages({
        ...messages,
        conversations
      })
      setInputText('')
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Parent-Admin Communication</h1>
          <p className="page-subtitle">Draft school announcements, send urgent reminders, and message active parents directly.</p>
        </div>
      </div>

      <div className="messages-layout">
        
        {/* Left Hand Column: Templates & Broadcast Composer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Templates list */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <FileText size={16} style={{ color: 'var(--primary)' }} />
                Message Templates
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(messages.templates || []).map((tpl, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => handleLoadTemplate(tpl)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', justifyContent: 'flex-start', textAlign: 'left', padding: '0.65rem 0.85rem' }}
                >
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block' }}>{tpl.type}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                      {tpl.subject}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast composer */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
                <Megaphone size={16} style={{ color: 'var(--accent)' }} />
                Broadcast Announcement
              </h2>
            </div>

            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Send To:</label>
                  <select 
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    className="form-control"
                    style={{ padding: '0.4rem' }}
                  >
                    <option value="Parents">All Parents</option>
                    <option value="Staff">All Staff</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Type:</label>
                  <select 
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value)}
                    className="form-control"
                    style={{ padding: '0.4rem' }}
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Event Reminder">Event Reminder</option>
                    <option value="Fee Reminder">Fee Reminder</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subject Line</label>
                <input 
                  type="text"
                  required
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  placeholder="e.g. Summer Camp Sign-up"
                  className="form-control"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message Content</label>
                <textarea 
                  required
                  rows="4"
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Type broadcast detail..."
                  className="form-control"
                  style={{ fontSize: '0.85rem', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={14} />
                Send Broadcast
              </button>
            </form>
          </div>

        </div>

        {/* Right Hand Column: 1-on-1 Admin to Parent Chat logs */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1rem' }}>
          
          {/* Chat threads */}
          <div className="chats-list" style={{ borderRight: '1px solid var(--border-glass)', paddingRight: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'block', padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}>
              Parent Dialogs
            </span>
            
            {(messages.conversations || []).map((chat, idx) => {
              const lastMsg = chat.messages[chat.messages.length - 1]
              return (
                <div 
                  key={chat.studentId}
                  onClick={() => setActiveChatIndex(idx)}
                  className={`chat-thread-card ${activeChatIndex === idx ? 'active' : ''}`}
                >
                  <div className="chat-thread-header">
                    <span className="chat-thread-name">{chat.parentName}</span>
                    <span className="chat-thread-time">
                      {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Parent of: {chat.studentName}</span>
                  <p className="chat-thread-snippet">
                    {lastMsg ? lastMsg.text : 'No messages'}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Active Chat Window */}
          <div className="chat-window">
            {activeChatIndex !== null && messages.conversations?.[activeChatIndex] ? (
              <>
                <div className="chat-window-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="sidebar-avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{messages.conversations[activeChatIndex].parentName}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Direct channel • Parent of {messages.conversations[activeChatIndex].studentName} ({messages.conversations[activeChatIndex].studentId})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dialog Messages */}
                <div className="chat-messages-container">
                  {messages.conversations[activeChatIndex].messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`message-bubble sender-${msg.sender}`}
                    >
                      <span>{msg.text}</span>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reply Composer */}
                <form onSubmit={handleSendChatMessage} className="chat-input-bar">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Reply to ${messages.conversations[activeChatIndex].parentName}...`}
                    className="form-control"
                    style={{ flex: 1, padding: '0.5rem 1rem' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Select a parent thread to chat
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
