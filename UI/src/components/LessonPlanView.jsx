import React, { useState } from 'react'
import { Plus, Edit2, Copy, Trash2, X, Clipboard, AlignLeft } from 'lucide-react'

export default function LessonPlanView({ students }) {
  const [plans, setPlans] = useState([
    { id: "LP701", class: "LKG", topic: "Intro to Primary Colors", duration: "45 mins", objective: "Identify Red, Blue, and Yellow in classroom objects.", activities: "Sing color song; Paint with primary colors; Sort colorful blocks.", materials: "Colored Chart Paper, Painting sets, Building Blocks" },
    { id: "LP702", class: "Play Group", topic: "Animal Noise Identification", duration: "30 mins", objective: "Imitate sounds of farm animals (cow, sheep, pig).", activities: "Read farm animal booklet; play audio clips; play animal matching cards.", materials: "Animal storybook, Audio player, Flash cards" },
    { id: "LP703", class: "UKG", topic: "Basic Geometry Shapes", duration: "50 mins", objective: "Draw and count edges of circle, square, triangle.", activities: "Draw shapes in sandboxes; Cut shapes out of cardboards; Build matching puzzles.", materials: "Safety Scissors, Sand trays, Shape puzzles" }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)

  const [formData, setFormData] = useState({
    class: 'Play Group',
    topic: '',
    duration: '30 mins',
    objective: '',
    activities: '',
    materials: ''
  })

  const [classFilter, setClassFilter] = useState('All')

  const handleOpenAdd = () => {
    setFormData({
      class: 'Play Group',
      topic: '',
      duration: '30 mins',
      objective: '',
      activities: '',
      materials: ''
    })
    setShowAddModal(true)
  }

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({ ...plan })
    setShowEditModal(true)
  }

  const handleCopyPlan = (plan) => {
    const copied = {
      ...plan,
      id: `LP${Date.now().toString().slice(-3)}`,
      topic: `${plan.topic} (Copy)`
    }
    setPlans([...plans, copied])
    alert('Lesson plan duplicated!')
  }

  const handleSavePlan = (e) => {
    e.preventDefault()
    if (showAddModal) {
      const newPlan = {
        ...formData,
        id: `LP${Date.now().toString().slice(-3)}`
      }
      setPlans([...plans, newPlan])
      setShowAddModal(false)
    } else if (showEditModal) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...formData } : p))
      setShowEditModal(false)
      setEditingPlan(null)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Delete this lesson plan?')) {
      setPlans(plans.filter(p => p.id !== id))
    }
  }

  const classesList = ['Play Group', 'Nursery', 'LKG', 'UKG']

  const filteredPlans = plans.filter(p => classFilter === 'All' ? true : p.class === classFilter)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Curriculum & Lesson Plans</h1>
          <p className="page-subtitle">Draft preschool objectives, materials required, and daily student activities.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          Create Plan
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Class Roster Filter:</span>
        <select 
          value={classFilter} 
          onChange={(e) => setClassFilter(e.target.value)} 
          className="form-control"
          style={{ minWidth: '150px', padding: '0.45rem' }}
        >
          <option value="All">All Classes</option>
          {classesList.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Lesson List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredPlans.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No lesson plans configured for this class yet.
          </div>
        ) : (
          filteredPlans.map(plan => (
            <div key={plan.id} className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-active">{plan.class}</span>
                  <span className="badge badge-primary">{plan.duration}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{plan.topic}</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <p><strong>Objective:</strong> <span style={{ color: 'var(--text-secondary)' }}>{plan.objective}</span></p>
                  <p><strong>Core Activities:</strong> <span style={{ color: 'var(--text-secondary)' }}>{plan.activities}</span></p>
                  <p><strong>Materials Required:</strong> <span style={{ color: 'var(--accent)', fontWeight: '500' }}>{plan.materials}</span></p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', alignItems: 'flex-end', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: 'auto' }}>ID: {plan.id}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleOpenEdit(plan)} className="btn btn-secondary btn-sm" title="Edit">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleCopyPlan(plan)} className="btn btn-secondary btn-sm" title="Duplicate/Copy">
                    <Copy size={13} />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{showAddModal ? 'Create Lesson Plan' : 'Edit Lesson Plan'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class Target</label>
                  <select 
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="form-control"
                  >
                    {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input 
                    type="text" 
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 45 mins" 
                    className="form-control" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lesson Topic / Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Introduction to Alphabets" 
                  className="form-control" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Learning Objective</label>
                <textarea 
                  required
                  rows="2"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="What will children learn..." 
                  className="form-control" 
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Core Activities</label>
                <textarea 
                  required
                  rows="3"
                  value={formData.activities}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  placeholder="e.g. 1. Reading animal board, 2. Mimicking noises..." 
                  className="form-control" 
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Materials Needed (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  placeholder="e.g. Chart Paper, Safety Scissors, Glue" 
                  className="form-control" 
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
