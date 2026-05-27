import React, { useState } from 'react'
import { 
  Users, 
  Baby, 
  AlertTriangle, 
  CheckSquare, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Clock,
  Backpack,
  CheckCircle2,
  Trash2
} from 'lucide-react'

export default function DashboardView({ 
  students, 
  staff, 
  attendance, 
  inventory, 
  tasks, 
  setActiveView,
  onQuickAction
}) {
  const [todoText, setTodoText] = useState('')
  const [todos, setTodos] = useState([
    { id: 1, text: 'Confirm menu for next week with kitchen staff', done: false },
    { id: 2, text: 'Upload UKG worksheets PDF to parent files', done: true },
    { id: 3, text: 'Order hand sanitizers and safety scissors', done: false }
  ])

  // Calculations
  const totalStudents = students.filter(s => s.status === 'Active').length
  
  // Children Present
  const childrenAttendanceToday = attendance.students || []
  const childrenPresent = childrenAttendanceToday.filter(
    c => c.status === 'Present' || c.status === 'Half Day' || c.status === 'Early Departure'
  ).length
  const childrenPresentPct = totalStudents > 0 ? Math.round((childrenPresent / totalStudents) * 100) : 0

  // Staff Present
  const totalStaff = staff.filter(s => s.status === 'Active').length
  const staffPresentToday = (attendance.staff || []).filter(s => s.status === 'Present').length

  // Low Stock Count
  const lowStockItems = inventory.filter(item => item.stockLevel <= item.minStockLevel)

  // Tasks Summary
  const pendingTasks = tasks.filter(t => t.status !== 'Done')

  const handleAddTodo = (e) => {
    e.preventDefault()
    if (!todoText.trim()) return
    setTodos([...todos, { id: Date.now(), text: todoText.trim(), done: false }])
    setTodoText('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card" style={{ '--stat-glow-color': 'rgba(139, 92, 246, 0.12)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary)' }}>
            <Baby size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Children Present</span>
            <span className="stat-value">{childrenPresent} / {totalStudents}</span>
            <span className="stat-subtext">{childrenPresentPct}% attendance rate today</span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ '--stat-glow-color': 'rgba(16, 185, 129, 0.12)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--accent)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Staff On Duty</span>
            <span className="stat-value">{staffPresentToday} / {totalStaff}</span>
            <span className="stat-subtext">Check-ins starting at 7:55 AM</span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ '--stat-glow-color': 'rgba(217, 119, 6, 0.12)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Low Stock Items</span>
            <span className="stat-value">{lowStockItems.length}</span>
            <span className="stat-subtext">{lowStockItems.length > 0 ? `${lowStockItems[0].name} + more require restock` : 'All items fully stocked'}</span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ '--stat-glow-color': 'rgba(244, 63, 94, 0.12)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--danger)' }}>
            <CheckSquare size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Tasks</span>
            <span className="stat-value">{pendingTasks.length}</span>
            <span className="stat-subtext">{pendingTasks.filter(t => t.priority === 'High').length} High-priority action items</span>
          </div>
        </div>
      </div>

      {/* Main Row */}
      <div className="dashboard-main-row">
        
        {/* Left Hand Panel: Daily Summaries & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Actions */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">Quick Actions</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <button onClick={() => setActiveView('attendance')} className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.25rem 1rem', height: '100px', fontSize: '0.85rem' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--accent)', marginBottom: '0.5rem' }} />
                Mark Attendance
              </button>
              <button onClick={() => setActiveView('tasks')} className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.25rem 1rem', height: '100px', fontSize: '0.85rem' }}>
                <Plus size={20} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                Assign Task
              </button>
              <button onClick={() => setActiveView('lessons')} className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.25rem 1rem', height: '100px', fontSize: '0.85rem' }}>
                <BookOpen size={20} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                Create Lesson Plan
              </button>
              <button onClick={() => setActiveView('activities')} className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.25rem 1rem', height: '100px', fontSize: '0.85rem' }}>
                <CalendarDays size={20} style={{ color: 'var(--warning)', marginBottom: '0.5rem' }} />
                Add Event
              </button>
              <button onClick={() => setActiveView('inventory')} className="btn btn-secondary" style={{ flexDirection: 'column', padding: '1.25rem 1rem', height: '100px', fontSize: '0.85rem' }}>
                <Package size={20} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
                Check Inventory
              </button>
            </div>
          </div>

          {/* Detailed Lists (Staff Active Duty & Low Stock Details) */}
          <div className="form-row">
            
            {/* Staff checkin list */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="dashboard-panel-header">
                <h3 className="dashboard-panel-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} style={{ color: 'var(--accent)' }} />
                  Staff Present Today
                </h3>
              </div>
              <div className="dashboard-list" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {(attendance.staff || []).map(record => {
                  const employee = staff.find(st => st.id === record.staffId)
                  if (!employee) return null
                  return (
                    <div key={record.staffId} className="dashboard-list-item" style={{ padding: '0.65rem 0.85rem' }}>
                      <div>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{employee.name}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{employee.role}</span>
                      </div>
                      <span className="badge badge-active" style={{ fontSize: '0.65rem', gap: '0.25rem' }}>
                        {record.status === 'Present' ? `Checked-in: ${record.checkIn || '08:00 AM'}` : record.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Low stock alerts panel */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="dashboard-panel-header">
                <h3 className="dashboard-panel-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                  Low Stock Details
                </h3>
              </div>
              <div className="dashboard-list" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {lowStockItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No low stock items. All set!
                  </div>
                ) : (
                  lowStockItems.map(item => (
                    <div key={item.id} className="dashboard-list-item" style={{ padding: '0.65rem 0.85rem' }}>
                      <div>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{item.name}</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: 'var(--danger)', fontWeight: '700', fontSize: '0.85rem' }}>{item.stockLevel}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / min {item.minStockLevel} {item.unit}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* Right Hand Panel: Personal To-Do & Children present list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* To-Do List */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="dashboard-panel-header">
                <h2 className="dashboard-panel-title">Personal To-Do</h2>
                <span className="kanban-column-count">{todos.filter(t => !t.done).length} left</span>
              </div>
              
              <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  value={todoText} 
                  onChange={(e) => setTodoText(e.target.value)} 
                  placeholder="Add a fast task..." 
                  className="form-control" 
                  style={{ flex: 1, padding: '0.45rem 0.85rem', fontSize: '0.85rem' }} 
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>
                  <Plus size={16} />
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {todos.map(todo => (
                  <div key={todo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer' }} onClick={() => toggleTodo(todo.id)}>
                      <input 
                        type="checkbox" 
                        checked={todo.done} 
                        onChange={() => {}} 
                        style={{ cursor: 'pointer' }} 
                      />
                      <span style={{ 
                        fontSize: '0.85rem', 
                        textDecoration: todo.done ? 'line-through' : 'none', 
                        color: todo.done ? 'var(--text-muted)' : 'var(--text-primary)' 
                      }}>
                        {todo.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTodo(todo.id)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Children Attendance Breakdown */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title">Children Check-Ins</h2>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Today</span>
            </div>
            <div className="dashboard-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {childrenAttendanceToday.map(record => {
                const child = students.find(s => s.id === record.studentId)
                if (!child) return null
                
                let badgeClass = 'badge-active'
                if (record.status === 'Absent') badgeClass = 'badge-inactive'
                if (record.status === 'Half Day') badgeClass = 'badge-warning'
                if (record.status === 'Early Departure') badgeClass = 'badge-primary'

                return (
                  <div key={record.studentId} className="dashboard-list-item" style={{ padding: '0.65rem 0.85rem' }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{child.name}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class {child.class} - {child.section}</span>
                    </div>
                    <span className={`badge ${badgeClass}`} style={{ fontSize: '0.7rem' }}>
                      {record.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
