import React, { useState } from 'react'
import { Plus, Edit2, Trash2, ArrowUpRight, GraduationCap, X } from 'lucide-react'

export default function StudentView({ students, setStudents }) {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [editingStudent, setEditingStudent] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    class: 'Play Group',
    section: 'A',
    age: '',
    parentName: '',
    parentPhone: '',
    email: '',
    status: 'Active'
  })

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.parentName.toLowerCase().includes(search.toLowerCase()) ||
                          student.id.toLowerCase().includes(search.toLowerCase())
    const matchesClass = classFilter === 'All' ? true : student.class === classFilter
    return matchesSearch && matchesClass
  })

  // Classes list
  const classesList = ['Play Group', 'Nursery', 'LKG', 'UKG', 'Alumni']

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      class: 'Play Group',
      section: 'A',
      age: '',
      parentName: '',
      parentPhone: '',
      email: '',
      status: 'Active'
    })
    setShowAddModal(true)
  }

  const handleOpenEdit = (student) => {
    setEditingStudent(student)
    setFormData({ ...student })
    setShowEditModal(true)
  }

  const handleSaveStudent = (e) => {
    e.preventDefault()
    if (showAddModal) {
      const newStudent = {
        ...formData,
        id: `S${Date.now().toString().slice(-3)}`,
        enrollmentDate: new Date().toISOString().split('T')[0]
      }
      setStudents([...students, newStudent])
      setShowAddModal(false)
    } else if (showEditModal) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s))
      setShowEditModal(false)
      setEditingStudent(null)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(s => s.id !== id))
      setSelectedStudents(selectedStudents.filter(sid => sid !== id))
    }
  }

  const toggleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(sid => sid !== id))
    } else {
      setSelectedStudents([...selectedStudents, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  // Bulk promote class progression
  const promoteSelected = () => {
    if (selectedStudents.length === 0) return
    if (confirm(`Promote the ${selectedStudents.length} selected students to the next grade?`)) {
      setStudents(students.map(s => {
        if (!selectedStudents.includes(s.id)) return s
        let nextClass = s.class
        let nextStatus = s.status
        if (s.class === 'Play Group') nextClass = 'Nursery'
        else if (s.class === 'Nursery') nextClass = 'LKG'
        else if (s.class === 'LKG') nextClass = 'UKG'
        else if (s.class === 'UKG') {
          nextClass = 'Alumni'
          nextStatus = 'Inactive' // Alumni are placed as Inactive in the current student ledger
        }
        return { ...s, class: nextClass, status: nextStatus }
      }))
      setSelectedStudents([])
      alert('Students promoted successfully!')
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header controls */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Student Directory</h1>
          <p className="page-subtitle">Manage class mapping, parental contacts, and academic promotions.</p>
        </div>
        <div className="header-actions">
          {selectedStudents.length > 0 && (
            <button onClick={promoteSelected} className="btn btn-secondary" style={{ color: 'var(--accent)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <GraduationCap size={16} />
              Promote Selected ({selectedStudents.length})
            </button>
          )}
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input 
            type="text" 
            placeholder="Search by student name, ID or parent..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control" 
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Class:</span>
          <select 
            value={classFilter} 
            onChange={(e) => setClassFilter(e.target.value)} 
            className="form-control"
            style={{ minWidth: '130px', padding: '0.5rem' }}
          >
            <option value="All">All Classes</option>
            {classesList.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingRight: '0' }}>
                  <input 
                    type="checkbox" 
                    checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length} 
                    onChange={toggleSelectAll} 
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class Mapping</th>
                <th>Age</th>
                <th>Parent/Guardian</th>
                <th>Parent Phone</th>
                <th>Status</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td style={{ paddingRight: '0' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.includes(student.id)} 
                        onChange={() => toggleSelectStudent(student.id)} 
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{student.id}</td>
                    <td style={{ fontWeight: '600' }}>{student.name}</td>
                    <td>
                      <span className={`badge ${student.class === 'Alumni' ? 'badge-primary' : 'badge-warning'}`}>
                        {student.class} {student.class !== 'Alumni' && `- Sec ${student.section}`}
                      </span>
                    </td>
                    <td>{student.age} yrs</td>
                    <td>{student.parentName}</td>
                    <td>{student.parentPhone}</td>
                    <td>
                      <span className={`badge ${student.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button onClick={() => handleOpenEdit(student)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(student.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', color: 'var(--danger)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
              <h2 className="modal-title">{showAddModal ? 'Add New Student' : 'Edit Student Profile'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Reyansh Gupta" 
                  className="form-control" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class Mapping</label>
                  <select 
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="form-control"
                  >
                    {classesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select 
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="form-control"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input 
                    type="number" 
                    step="0.5"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 4.5" 
                    className="form-control" 
                  />
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
                <label className="form-label">Parent/Guardian Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g. Rajesh Sharma" 
                  className="form-control" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Parent Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="e.g. +91 98765 43210" 
                    className="form-control" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rajesh@example.com" 
                    className="form-control" 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
