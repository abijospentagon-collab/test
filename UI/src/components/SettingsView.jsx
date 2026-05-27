import React, { useState } from 'react'
import { Settings, Save, Home, Layers, User } from 'lucide-react'

export default function SettingsView() {
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'Sorted Preschool Academy',
    address: 'Sector 15, Vasant Kunj, New Delhi',
    phone: '+91 11 2345 6789',
    email: 'info@sorted.edu.in',
    website: 'www.sortedpreschool.edu'
  })

  const [classes, setClasses] = useState([
    { id: 1, name: 'Play Group', sections: 'A, B', maxCapacity: 20 },
    { id: 2, name: 'Nursery', sections: 'A, B, C', maxCapacity: 25 },
    { id: 3, name: 'LKG', sections: 'A, B', maxCapacity: 25 },
    { id: 4, name: 'UKG', sections: 'A, B, C', maxCapacity: 30 }
  ])

  const [adminProfile, setAdminProfile] = useState({
    name: 'Rohan Das',
    role: 'Principal Admin',
    email: 'rohan.admin@sorted.edu',
    username: 'rohan_sorted'
  })

  const handleSaveSettings = (section) => {
    alert(`${section} settings saved successfully!`)
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">SaaS Settings</h1>
          <p className="page-subtitle">Configure institutional profiles, class divisions, and administrator security settings.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        
        {/* Left Side: School Info & Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* School Details */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Home size={16} style={{ color: 'var(--primary)' }} />
                Preschool Profile
              </h2>
              <button onClick={() => handleSaveSettings('School Profile')} className="btn btn-primary btn-sm">
                <Save size={12} />
                Save
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">School Name</label>
                <input 
                  type="text" 
                  value={schoolInfo.name} 
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  className="form-control" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Physical Address</label>
                <input 
                  type="text" 
                  value={schoolInfo.address} 
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  className="form-control" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Office Contact Phone</label>
                  <input 
                    type="text" 
                    value={schoolInfo.phone} 
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                    className="form-control" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email</label>
                  <input 
                    type="email" 
                    value={schoolInfo.email} 
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                    className="form-control" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Profile */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="dashboard-panel-header">
              <h2 className="dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <User size={16} style={{ color: 'var(--accent)' }} />
                Administrator Account
              </h2>
              <button onClick={() => handleSaveSettings('Account Profile')} className="btn btn-primary btn-sm">
                <Save size={12} />
                Save
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Admin User Full Name</label>
                  <input 
                    type="text" 
                    value={adminProfile.name} 
                    onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                    className="form-control" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Title</label>
                  <input 
                    type="text" 
                    value={adminProfile.role} 
                    onChange={(e) => setAdminProfile({ ...adminProfile, role: e.target.value })}
                    className="form-control" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    value={adminProfile.username} 
                    onChange={(e) => setAdminProfile({ ...adminProfile, username: e.target.value })}
                    className="form-control" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Email</label>
                  <input 
                    type="email" 
                    value={adminProfile.email} 
                    onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                    className="form-control" 
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Class Group Management */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="dashboard-panel-header">
            <h2 className="dashboard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <Layers size={16} style={{ color: 'var(--warning)' }} />
              Class Groups & Capacities
            </h2>
            <button onClick={() => handleSaveSettings('Class Configuration')} className="btn btn-primary btn-sm">
              <Save size={12} />
              Save
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {classes.map(cls => (
              <div 
                key={cls.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem', 
                  padding: '1rem', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: '10px' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{cls.name}</strong>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Active Group</span>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Configured Sections</label>
                    <input 
                      type="text" 
                      value={cls.sections} 
                      onChange={(e) => {
                        setClasses(classes.map(c => c.id === cls.id ? { ...c, sections: e.target.value } : c))
                      }}
                      className="form-control"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Student Cap</label>
                    <input 
                      type="number" 
                      value={cls.maxCapacity} 
                      onChange={(e) => {
                        setClasses(classes.map(c => c.id === cls.id ? { ...c, maxCapacity: parseInt(e.target.value) || 0 } : c))
                      }}
                      className="form-control"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
