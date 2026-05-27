import React from 'react'
import { 
  LayoutDashboard, 
  Mic,
  Users, 
  UserSquare2, 
  CheckSquare, 
  FolderCheck, 
  Package, 
  Sparkles, 
  BookOpen, 
  CalendarDays, 
  MessageSquare, 
  Settings 
} from 'lucide-react'

export default function Sidebar({ activeView, setActiveView, counts }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'voice-portal', name: 'Voice Portal', icon: Mic },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'staff', name: 'Staff Management', icon: UserSquare2 },
    { id: 'attendance', name: 'Attendance', icon: CheckSquare },
    { id: 'tasks', name: 'Tasks Board', icon: FolderCheck, badge: counts.pendingTasks },
    { id: 'inventory', name: 'Inventory', icon: Package, badge: counts.lowStockItems ? '!' : null },
    { id: 'cleaning', name: 'Cleaning & Support', icon: Sparkles },
    { id: 'lessons', name: 'Lesson Planning', icon: BookOpen },
    { id: 'activities', name: 'Activities & Events', icon: CalendarDays },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'settings', name: 'School Settings', icon: Settings }
  ]


  return (
    <aside className="sidebar">
      <div className="sidebar-container">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">S</div>
          <span className="sidebar-logo-text">Sorted OS</span>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <div 
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`sidebar-link ${activeView === item.id ? 'active' : ''}`}
                title={item.name}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className={`kanban-column-count ${item.badge === '!' ? 'badge-warning' : ''}`} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                    {item.badge}
                  </span>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">AD</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">Admin Dashboard</span>
          <span className="sidebar-user-role">SaaS School Administrator</span>
        </div>
      </div>
    </aside>
  )
}
