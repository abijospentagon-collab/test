import React, { useState } from 'react'
import { Plus, Edit2, Trash2, X, AlertCircle, Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react'

export default function TaskView({ tasks, setTasks, staff }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
    category: 'General'
  })

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [assigneeFilter, setAssigneeFilter] = useState('All')

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState(null)

  const activeStaff = staff.filter(s => s.status === 'Active')

  // Save/Create task
  const handleSaveTask = (e) => {
    e.preventDefault()
    if (showAddModal) {
      const newTask = {
        ...formData,
        id: `T${Date.now().toString().slice(-3)}`
      }
      setTasks([...tasks, newTask])
      setShowAddModal(false)
    } else if (showEditModal) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t))
      setShowEditModal(false)
      setEditingTask(null)
    }
  }

  const handleOpenAdd = (colStatus = 'Pending') => {
    setFormData({
      title: '',
      description: '',
      assignedTo: activeStaff[0]?.id || '',
      priority: 'Medium',
      status: colStatus,
      dueDate: new Date().toISOString().split('T')[0],
      category: 'General'
    })
    setShowAddModal(true)
  }

  const handleOpenEdit = (task) => {
    setEditingTask(task)
    setFormData({ ...task })
    setShowEditModal(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  // Shift status
  const moveTask = (task, newStatus) => {
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
  }

  // HTML5 Drag Handlers
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, newStatus) => {
    e.preventDefault()
    if (draggedTaskId) {
      setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, status: newStatus } : t))
      setDraggedTaskId(null)
    }
  }

  // Filters application
  const filteredTasks = tasks.filter(task => {
    const matchesPriority = priorityFilter === 'All' ? true : task.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'All' ? true : task.assignedTo === assigneeFilter
    return matchesPriority && matchesAssignee
  })

  // Columns helper
  const columns = [
    { id: 'Pending', name: 'To Do', color: 'var(--danger)' },
    { id: 'In Progress', name: 'In Progress', color: 'var(--warning)' },
    { id: 'Done', name: 'Completed', color: 'var(--accent)' }
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Tasks & Workflows</h1>
          <p className="page-subtitle">Assign operations to staff, monitor pending tasks, and view completion rates.</p>
        </div>
        <button onClick={() => handleOpenAdd('Pending')} className="btn btn-primary">
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* Filters bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Priority:</span>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)} 
            className="form-control"
            style={{ minWidth: '130px', padding: '0.45rem' }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assignee:</span>
          <select 
            value={assigneeFilter} 
            onChange={(e) => setAssigneeFilter(e.target.value)} 
            className="form-control"
            style={{ minWidth: '180px', padding: '0.45rem' }}
          >
            <option value="All">All Staff</option>
            {activeStaff.map(st => (
              <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id)
          return (
            <div 
              key={col.id} 
              className="glass-panel kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ background: 'rgba(15, 23, 42, 0.35)', border: `1px solid var(--border-glass)` }}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: col.color }} />
                  {col.name}
                </span>
                <span className="kanban-column-count">{colTasks.length}</span>
              </div>

              <div className="kanban-cards">
                {colTasks.length === 0 ? (
                  <div style={{ display: 'flex', flex: 1, border: '2px dashed var(--border-glass)', borderRadius: '10px', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Drag tasks here
                  </div>
                ) : (
                  colTasks.map(task => {
                    const assignee = staff.find(st => st.id === task.assignedTo)
                    return (
                      <div 
                        key={task.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`glass-panel kanban-card priority-${task.priority}`}
                        style={{ backgroundColor: 'var(--bg-glass-hover)', cursor: 'grab' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span className="kanban-card-title">{task.title}</span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button onClick={() => handleOpenEdit(task)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Edit">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDelete(task.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Delete">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <p className="kanban-card-desc">{task.description}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.25rem 0' }}>
                          <span className={`badge ${task.priority === 'High' ? 'badge-inactive' : task.priority === 'Medium' ? 'badge-warning' : 'badge-active'}`} style={{ fontSize: '0.65rem' }}>
                            {task.priority} Priority
                          </span>
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                            {task.category}
                          </span>
                        </div>

                        {/* Mobile view / Click controls to shift cards */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {col.id !== 'Pending' && (
                              <button 
                                onClick={() => moveTask(task, col.id === 'Done' ? 'In Progress' : 'Pending')}
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '0.2rem 0.35rem' }}
                                title="Move Left"
                              >
                                <ArrowLeft size={10} />
                              </button>
                            )}
                            {col.id !== 'Done' && (
                              <button 
                                onClick={() => moveTask(task, col.id === 'Pending' ? 'In Progress' : 'Done')}
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '0.2rem 0.35rem' }}
                                title="Move Right"
                              >
                                <ArrowRight size={10} />
                              </button>
                            )}
                          </div>
                          
                          <div className="kanban-card-assignee" style={{ fontSize: '0.75rem' }}>
                            <User size={10} />
                            <span>{assignee ? assignee.name : 'Unassigned'}</span>
                          </div>
                        </div>

                        <div className="kanban-card-meta">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={10} />
                            Due: {task.dueDate}
                          </span>
                          <span style={{ fontFamily: 'monospace' }}>{task.id}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add / Edit Task Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{showAddModal ? 'Create New Task' : 'Modify Task Details'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sanitize Play Group blocks" 
                  className="form-control" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What needs to be done..." 
                  className="form-control" 
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assign To Staff</label>
                  <select 
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="form-control"
                  >
                    {activeStaff.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Task Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-control"
                  >
                    <option value="General">General</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Teaching">Teaching</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="form-control"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="form-control" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="form-control"
                >
                  <option value="Pending">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Completed</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
