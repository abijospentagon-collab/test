import React, { useState } from 'react'
import { Plus, Heart, Calendar, Star, BookOpen, Clock, AlertCircle, Sparkles, CheckCircle, X } from 'lucide-react'

export default function ActivitiesView({ 
  activities, 
  setActivities, 
  events, 
  setEvents, 
  inventory 
}) {
  const [tab, setTab] = useState('activities') // 'activities' or 'events'
  const [showAddActivityModal, setShowAddActivityModal] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)

  // Forms states
  const [activityForm, setActivityForm] = useState({
    name: '',
    description: '',
    class: 'Play Group',
    materials: [],
    scheduledDateTime: ''
  })
  
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    status: 'Upcoming',
    description: ''
  })

  // Select material helper
  const [tempMaterial, setTempMaterial] = useState('')

  const classesList = ['Play Group', 'Nursery', 'LKG', 'UKG']

  const toggleFavorite = (id) => {
    setActivities(activities.map(act => {
      if (act.id !== id) return act
      return { ...act, isFavorite: !act.isFavorite }
    }))
  }

  const handleAddMaterial = () => {
    if (!tempMaterial || activityForm.materials.includes(tempMaterial)) return
    setActivityForm({
      ...activityForm,
      materials: [...activityForm.materials, tempMaterial]
    })
    setTempMaterial('')
  }

  const handleRemoveMaterial = (name) => {
    setActivityForm({
      ...activityForm,
      materials: activityForm.materials.filter(m => m !== name)
    })
  }

  const handleSaveActivity = (e) => {
    e.preventDefault()
    const newAct = {
      ...activityForm,
      id: `ACT${Date.now().toString().slice(-3)}`,
      isFavorite: false
    }
    setActivities([...activities, newAct])
    setShowAddActivityModal(false)
  }

  const handleSaveEvent = (e) => {
    e.preventDefault()
    const newEv = {
      ...eventForm,
      id: `EV${Date.now().toString().slice(-3)}`
    }
    setEvents([...events, newEv])
    setShowAddEventModal(false)
  }

  const toggleEventStatus = (id) => {
    setEvents(events.map(ev => {
      if (ev.id !== id) return ev
      const nextStatus = ev.status === 'Upcoming' ? 'Ongoing' : ev.status === 'Ongoing' ? 'Completed' : 'Upcoming'
      return { ...ev, status: nextStatus }
    }))
  }

  const handleDeleteActivity = (id) => {
    if (confirm('Delete this classroom activity?')) {
      setActivities(activities.filter(a => a.id !== id))
    }
  }

  const handleDeleteEvent = (id) => {
    if (confirm('Delete this event?')) {
      setEvents(events.filter(e => e.id !== id))
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Activities & Campus Events</h1>
          <p className="page-subtitle">Schedule class exercises, assign supplies, and coordinate seasonal events.</p>
        </div>
        <div className="header-actions">
          {tab === 'activities' ? (
            <button onClick={() => setShowAddActivityModal(true)} className="btn btn-primary">
              <Plus size={16} />
              Plan Activity
            </button>
          ) : (
            <button onClick={() => setShowAddEventModal(true)} className="btn btn-primary">
              <Plus size={16} />
              Create Event
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setTab('activities')} 
          className={`btn ${tab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, maxWidth: '200px' }}
        >
          <BookOpen size={16} />
          Classroom Activities
        </button>
        <button 
          onClick={() => setTab('events')} 
          className={`btn ${tab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, maxWidth: '200px' }}
        >
          <Calendar size={16} />
          School Events ({events.length})
        </button>
      </div>

      {/* Lists */}
      {tab === 'activities' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {activities.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
              No activities planned yet.
            </div>
          ) : (
            activities.map(act => (
              <div 
                key={act.id} 
                className="glass-panel glass-panel-interactive" 
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  gap: '1rem',
                  borderTop: act.isFavorite ? '2px solid var(--primary)' : '1px solid var(--border-glass)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <span className="badge badge-warning">{act.class} Class</span>
                    
                    <button 
                      onClick={() => toggleFavorite(act.id)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: act.isFavorite ? 'var(--primary)' : 'var(--text-muted)' 
                      }}
                      title={act.isFavorite ? 'Un-favorite activity' : 'Mark as class favorite'}
                    >
                      <Heart size={20} fill={act.isFavorite ? 'var(--primary)' : 'none'} style={{ transition: 'all 0.2s' }} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '0.5rem' }}>{act.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                    {act.description}
                  </p>
                </div>

                <div>
                  <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>Supplies Consumed</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {act.materials.map((mat, i) => (
                        <span key={i} className="badge badge-primary" style={{ fontSize: '0.65rem', background: 'rgba(139, 92, 246, 0.08)' }}>
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      {new Date(act.scheduledDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    
                    <button 
                      onClick={() => handleDeleteActivity(act.id)} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No school events scheduled.
            </div>
          ) : (
            events.map(ev => {
              let statusBadge = 'badge-active'
              if (ev.status === 'Upcoming') statusBadge = 'badge-primary'
              if (ev.status === 'Completed') statusBadge = 'badge-inactive'

              return (
                <div key={ev.id} className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '4fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge ${statusBadge}`}>{ev.status}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {ev.date}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{ev.title}</h3>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {ev.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', alignItems: 'flex-end', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem' }}>
                    <button 
                      onClick={() => toggleEventStatus(ev.id)} 
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', width: '100%', textAlign: 'center' }}
                    >
                      {ev.status === 'Upcoming' ? 'Start Event' : ev.status === 'Ongoing' ? 'Complete' : 'Re-open'}
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(ev.id)} 
                      className="btn btn-secondary btn-sm" 
                      style={{ width: '100%', color: 'var(--danger)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Plan Classroom Activity</h2>
              <button onClick={() => setShowAddActivityModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Activity Name</label>
                <input 
                  type="text" 
                  required
                  value={activityForm.name}
                  onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
                  placeholder="e.g. Paint with primary colors" 
                  className="form-control" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Activity Description</label>
                <textarea 
                  required
                  rows="2"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="Briefly describe the exercise..." 
                  className="form-control" 
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Target Class</label>
                  <select 
                    value={activityForm.class}
                    onChange={(e) => setActivityForm({ ...activityForm, class: e.target.value })}
                    className="form-control"
                  >
                    {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Schedule Date & Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={activityForm.scheduledDateTime}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduledDateTime: e.target.value })}
                    className="form-control" 
                  />
                </div>
              </div>

              {/* Add materials tag input */}
              <div className="form-group">
                <label className="form-label">Materials to Consume</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select 
                    value={tempMaterial}
                    onChange={(e) => setTempMaterial(e.target.value)}
                    className="form-control"
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Choose Material --</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddMaterial} className="btn btn-secondary">
                    Add
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)', minHeight: '40px' }}>
                  {activityForm.materials.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No materials selected.</span>
                  ) : (
                    activityForm.materials.map((mat, i) => (
                      <span key={i} className="badge badge-primary" style={{ gap: '0.25rem', fontSize: '0.75rem' }}>
                        {mat}
                        <button type="button" onClick={() => handleRemoveMaterial(mat)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddActivityModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Schedule School Event</h2>
              <button onClick={() => setShowAddEventModal(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input 
                  type="text" 
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Annual Sports Day" 
                  className="form-control" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input 
                    type="date" 
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="form-control" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select 
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Guidelines</label>
                <textarea 
                  required
                  rows="3"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Details for parent invitations, schedule or resources..." 
                  className="form-control" 
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddEventModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
