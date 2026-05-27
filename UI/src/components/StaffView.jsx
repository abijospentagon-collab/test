import React, { useState } from 'react'
import { Plus, Edit2, Trash2, X, ShieldAlert } from 'lucide-react'

export default function StaffView({ staff, setStaff }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    role: 'Teacher',
    contact: '',
    email: '',
    status: 'Active',
    assignedArea: ''
  })

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase()) || 
                          member.assignedArea.toLowerCase().includes(search.toLowerCase()) ||
                          member.id.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'All' ? true : member.role === roleFilter
    return matchesSearch && matchesRole
  })

  const rolesList = ['Admin', 'Teacher', 'Support Staff']

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      role: 'Teacher',
      contact: '',
      email: '',
      status: 'Active',
      assignedArea: ''
    })
    setShowAddModal(true)
  }

  const handleOpenEdit = (member) => {
    setEditingStaff(member)
    setFormData({ ...member })
    setShowEditModal(true)
  }

  const handleSaveStaff = (e) => {
    e.preventDefault()
    if (showAddModal) {
      const newMember = {
        ...formData,
        id: `ST${Date.now().toString().slice(-3)}`
      }
      setStaff([...staff, newMember])
      setShowAddModal(false)
    } else if (showEditModal) {
      setStaff(staff.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s))
      setShowEditModal(false)
      setEditingStaff(null)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaff(staff.filter(s => s.id !== id))
    }
  }

  const toggleStatus = (id) => {
    setStaff(staff.map(s => {
      if (s.id !== id) return s
      return { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' }
    }))
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Staff Coordination</h1>
          <p className="page-subtitle">Manage preschool administrators, classroom teachers, and support operations.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          Add Staff Member
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input 
            type="text" 
            placeholder="Search by staff name, ID or assignment..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control" 
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role Filter:</span>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)} 
            className="form-control"
            style={{ minWidth: '130px', padding: '0.5rem' }}
          >
            <option value="All">All Roles</option>
            {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Assigned Class/Area</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Status</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No staff members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map(member => {
                  let badgeClass = 'badge-primary'
                  if (member.role === 'Admin') badgeClass = 'badge-active'
                  if (member.role === 'Support Staff') badgeClass = 'badge-warning'

                  return (
                    <tr key={member.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{member.id}</td>
                      <td style={{ fontWeight: '600' }}>{member.name}</td>
                      <td>
                        <span className={`badge ${badgeClass}`}>
                          {member.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: '500' }}>{member.assignedArea || 'Not Assigned'}</td>
                      <td>{member.contact}</td>
                      <td>{member.email}</td>
                      <td>
                        <button 
                          onClick={() => toggleStatus(member.id)}
                          className={`badge ${member.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}
                          style={{ border: '1px solid transparent', cursor: 'pointer', outline: 'none' }}
                          title="Click to toggle status"
                        >
                          {member.status}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button onClick={() => handleOpenEdit(member)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem' }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(member.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', color: 'var(--danger)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{showAddModal ? 'Add Staff Member' : 'Edit Staff Profile'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Savitri Devi" 
                  className="form-control" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-control"
                  >
                    {rolesList.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Area / Class mapping</label>
                <input 
                  type="text" 
                  value={formData.assignedArea}
                  onChange={(e) => setFormData({ ...formData, assignedArea: e.target.value })}
                  placeholder="e.g. Nursery - Sec A, Kitchen, Play Area" 
                  className="form-control" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="e.g. +91 99999 55555" 
                    className="form-control" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. name@sorted.edu" 
                    className="form-control" 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
