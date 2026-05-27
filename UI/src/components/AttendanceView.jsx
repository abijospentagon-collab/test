import React, { useState } from 'react'
import { Calendar, Users, ClipboardList, CheckCircle2, UserCheck, HelpCircle } from 'lucide-react'

export default function AttendanceView({ students, staff, attendance, setAttendance }) {
  const [tab, setTab] = useState('children') // 'children' or 'staff'
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [classFilter, setClassFilter] = useState('All')
  const [remarksState, setRemarksState] = useState({}) // { studentId: remark }

  const classesList = ['Play Group', 'Nursery', 'LKG', 'UKG']

  // Filter students based on selection
  const activeStudents = students.filter(s => s.status === 'Active')
  const filteredStudents = activeStudents.filter(s => {
    return classFilter === 'All' ? true : s.class === classFilter
  })

  // Get current attendance map
  const getChildrenAttendanceMap = () => {
    const list = attendance.students || []
    const map = {}
    list.forEach(item => {
      if (item.date === currentDate) {
        map[item.studentId] = { status: item.status, remarks: item.remarks }
      }
    })
    return map
  }

  const getStaffAttendanceMap = () => {
    const list = attendance.staff || []
    const map = {}
    list.forEach(item => {
      if (item.date === currentDate) {
        map[item.staffId] = { status: item.status, checkIn: item.checkIn, checkOut: item.checkOut }
      }
    })
    return map
  }

  const childrenMap = getChildrenAttendanceMap()
  const staffMap = getStaffAttendanceMap()

  // Update specific student attendance
  const updateStudentAttendance = (studentId, status, remarks = '') => {
    const list = [...(attendance.students || [])]
    const index = list.findIndex(item => item.date === currentDate && item.studentId === studentId)
    
    if (index > -1) {
      list[index] = { ...list[index], status, remarks: remarks || list[index].remarks }
    } else {
      list.push({ date: currentDate, studentId, status, remarks })
    }

    setAttendance({
      ...attendance,
      students: list
    })
  }

  // Update specific staff attendance
  const updateStaffAttendance = (staffId, status, checkIn = '', checkOut = '') => {
    const list = [...(attendance.staff || [])]
    const index = list.findIndex(item => item.date === currentDate && item.staffId === staffId)
    
    if (index > -1) {
      list[index] = { 
        ...list[index], 
        status, 
        checkIn: checkIn || list[index].checkIn || '08:00 AM', 
        checkOut: checkOut || list[index].checkOut 
      }
    } else {
      list.push({ date: currentDate, staffId, status, checkIn: checkIn || '08:00 AM', checkOut })
    }

    setAttendance({
      ...attendance,
      staff: list
    })
  }

  // Bulk mark all visible children
  const bulkMarkChildren = (status) => {
    const list = [...(attendance.students || [])]
    
    filteredStudents.forEach(student => {
      const index = list.findIndex(item => item.date === currentDate && item.studentId === student.id)
      if (index > -1) {
        list[index] = { ...list[index], status }
      } else {
        list.push({ date: currentDate, studentId: student.id, status, remarks: '' })
      }
    })

    setAttendance({
      ...attendance,
      students: list
    })
  }

  // Bulk mark all staff
  const bulkMarkStaff = (status) => {
    const list = [...(attendance.staff || [])]
    const activeStaff = staff.filter(s => s.status === 'Active')

    activeStaff.forEach(member => {
      const index = list.findIndex(item => item.date === currentDate && item.staffId === member.id)
      if (index > -1) {
        list[index] = { ...list[index], status }
      } else {
        list.push({ date: currentDate, staffId: member.id, status, checkIn: status === 'Present' ? '08:00 AM' : '', checkOut: '' })
      }
    })

    setAttendance({
      ...attendance,
      staff: list
    })
  }

  const handleRemarkChange = (studentId, text) => {
    setRemarksState({ ...remarksState, [studentId]: text })
  }

  const handleSaveRemark = (studentId) => {
    const remark = remarksState[studentId] || ''
    const currentStatus = childrenMap[studentId]?.status || 'Present'
    updateStudentAttendance(studentId, currentStatus, remark)
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Attendance Register</h1>
          <p className="page-subtitle">Track children check-ins and staff timesheets dynamically.</p>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Date:</span>
          <input 
            type="date" 
            value={currentDate} 
            onChange={(e) => setCurrentDate(e.target.value)} 
            className="form-control"
            style={{ width: '160px', padding: '0.5rem' }} 
          />
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setTab('children')} 
          className={`btn ${tab === 'children' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, maxWidth: '200px' }}
        >
          <ClipboardList size={16} />
          Children Register
        </button>
        <button 
          onClick={() => setTab('staff')} 
          className={`btn ${tab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, maxWidth: '200px' }}
        >
          <UserCheck size={16} />
          Staff Register
        </button>
      </div>

      {/* Bulk action & Filters panel */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {tab === 'children' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter Class:</span>
              <select 
                value={classFilter} 
                onChange={(e) => setClassFilter(e.target.value)} 
                className="form-control"
                style={{ minWidth: '130px', padding: '0.45rem' }}
              >
                <option value="All">All Classes</option>
                {classesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => bulkMarkChildren('Present')} className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                Mark All Present
              </button>
              <button onClick={() => bulkMarkChildren('Absent')} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                Mark All Absent
              </button>
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Active staff members on roster: <strong>{staff.filter(s => s.status === 'Active').length}</strong>
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => bulkMarkStaff('Present')} className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                Mark All Present
              </button>
              <button onClick={() => bulkMarkStaff('Absent')} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                Mark All Absent
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Listing */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        {tab === 'children' ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Attendance Status</th>
                  <th>Remarks (Fever, Doctor, etc.)</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Save Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No active students found in this class.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const currentStatus = childrenMap[student.id]?.status || 'Absent'
                    const remarkVal = remarksState[student.id] !== undefined ? remarksState[student.id] : (childrenMap[student.id]?.remarks || '')

                    return (
                      <tr key={student.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{student.id}</td>
                        <td style={{ fontWeight: '600' }}>{student.name}</td>
                        <td>
                          <span className="badge badge-warning">{student.class} - {student.section}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {['Present', 'Absent', 'Half Day', 'Early Departure'].map(st => {
                              const isActive = currentStatus === st
                              let statusStyle = { fontSize: '0.75rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }
                              let statusClass = 'btn-secondary'
                              
                              if (isActive) {
                                if (st === 'Present') statusClass = 'btn-primary'
                                if (st === 'Absent') statusClass = 'btn-danger'
                                if (st === 'Half Day') statusClass = 'btn-warning'
                                if (st === 'Early Departure') statusClass = 'btn-secondary' // default secondary with active styling
                              }

                              return (
                                <button
                                  key={st}
                                  onClick={() => updateStudentAttendance(student.id, st)}
                                  className={`btn ${statusClass} btn-sm`}
                                  style={{ 
                                    ...statusStyle, 
                                    opacity: isActive ? 1 : 0.45,
                                    background: isActive && st === 'Early Departure' ? 'hsl(263, 85%, 63%)' : undefined 
                                  }}
                                >
                                  {st}
                                </button>
                              )
                            })}
                          </div>
                        </td>
                        <td>
                          <input 
                            type="text" 
                            placeholder="Add sick note, late reason..." 
                            value={remarkVal}
                            onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                            className="form-control"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: '100%' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => handleSaveRemark(student.id)} 
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                </tr>
              </thead>
              <tbody>
                {staff.filter(s => s.status === 'Active').map(member => {
                  const currentStatus = staffMap[member.id]?.status || 'Absent'
                  const checkIn = staffMap[member.id]?.checkIn || ''
                  const checkOut = staffMap[member.id]?.checkOut || ''

                  return (
                    <tr key={member.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{member.id}</td>
                      <td style={{ fontWeight: '600' }}>{member.name}</td>
                      <td>
                        <span className="badge badge-primary">{member.role}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {['Present', 'Absent'].map(st => {
                            const isActive = currentStatus === st
                            let statusClass = isActive ? (st === 'Present' ? 'btn-primary' : 'btn-danger') : 'btn-secondary'
                            return (
                              <button
                                key={st}
                                onClick={() => updateStaffAttendance(member.id, st)}
                                className={`btn ${statusClass} btn-sm`}
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', opacity: isActive ? 1 : 0.45 }}
                              >
                                {st}
                              </button>
                            )
                          })}
                        </div>
                      </td>
                      <td>
                        {currentStatus === 'Present' ? (
                          <input 
                            type="text" 
                            value={checkIn || '08:00 AM'}
                            onChange={(e) => updateStaffAttendance(member.id, 'Present', e.target.value, checkOut)}
                            className="form-control"
                            style={{ padding: '0.35rem', fontSize: '0.8rem', width: '100px', display: 'inline-block' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>
                        )}
                      </td>
                      <td>
                        {currentStatus === 'Present' ? (
                          <input 
                            type="text" 
                            value={checkOut}
                            placeholder="Not checked out"
                            onChange={(e) => updateStaffAttendance(member.id, 'Present', checkIn, e.target.value)}
                            className="form-control"
                            style={{ padding: '0.35rem', fontSize: '0.8rem', width: '120px', display: 'inline-block' }}
                          />
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
