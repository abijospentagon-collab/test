import React, { useState } from 'react'
import { Plus, Edit2, Trash2, X, AlertTriangle, PackageOpen, RotateCcw } from 'lucide-react'

export default function InventoryView({ inventory, setInventory }) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'Replaceable items',
    stockLevel: 0,
    minStockLevel: 0,
    unit: 'units'
  })

  const categories = ['Teaching aids', 'Cleaning items', 'Replaceable items']

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All' ? true : item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: 'Replaceable items',
      stockLevel: '',
      minStockLevel: '',
      unit: 'units'
    })
    setShowAddModal(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setShowEditModal(true)
  }

  const handleSaveItem = (e) => {
    e.preventDefault()
    const parsedData = {
      ...formData,
      stockLevel: parseInt(formData.stockLevel) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 0
    }

    if (showAddModal) {
      const newItem = {
        ...parsedData,
        id: `INV${Date.now().toString().slice(-3)}`
      }
      setInventory([...inventory, newItem])
      setShowAddModal(false)
    } else if (showEditModal) {
      setInventory(inventory.map(item => item.id === editingItem.id ? { ...item, ...parsedData } : item))
      setShowEditModal(false)
      setEditingItem(null)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      setInventory(inventory.filter(item => item.id !== id))
    }
  }

  const adjustStock = (id, amount) => {
    setInventory(inventory.map(item => {
      if (item.id !== id) return item
      const newStock = Math.max(0, item.stockLevel + amount)
      return { ...item, stockLevel: newStock }
    }))
  }

  // Activity Consumption Simulation
  const simulateConsumption = () => {
    if (confirm("Simulate material consumption for today's Origami Animal Craft activity? This consumes: 5 sheets of 'Colored Chart Paper' and 2 units of 'Safety Scissors' (recycled/re-stocked by 1).")) {
      setInventory(inventory.map(item => {
        if (item.name === 'Colored Chart Paper') {
          return { ...item, stockLevel: Math.max(0, item.stockLevel - 5) }
        }
        if (item.name === 'Paper Glue Sticks') {
          return { ...item, stockLevel: Math.max(0, item.stockLevel - 2) }
        }
        return item
      }))
      alert("Material consumption logged! Stock levels updated.")
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Inventory Ledger</h1>
          <p className="page-subtitle">Track materials, stationary, learning aids, and cleaning supplies.</p>
        </div>
        <div className="header-actions">
          <button onClick={simulateConsumption} className="btn btn-secondary" style={{ borderColor: 'rgba(124, 58, 237, 0.3)' }}>
            <RotateCcw size={16} style={{ color: 'var(--primary)' }} />
            Simulate Activity Consumption
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            Add Material
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input 
            type="text" 
            placeholder="Search material inventory..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control" 
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category:</span>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)} 
            className="form-control"
            style={{ minWidth: '150px', padding: '0.5rem' }}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Main Panel */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Material Name</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Stock Level</th>
                <th style={{ textAlign: 'center' }}>Min Threshold</th>
                <th>Unit</th>
                <th>Status Alert</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Adjust Stock</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No inventory items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isLow = item.stockLevel <= item.minStockLevel
                  let categoryBadge = 'badge-primary'
                  if (item.category === 'Cleaning items') categoryBadge = 'badge-active'
                  if (item.category === 'Replaceable items') categoryBadge = 'badge-warning'

                  return (
                    <tr key={item.id} style={{ background: isLow ? 'rgba(244, 63, 94, 0.02)' : 'none' }}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.id}</td>
                      <td style={{ fontWeight: '600' }}>{item.name}</td>
                      <td>
                        <span className={`badge ${categoryBadge}`}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700', fontSize: '1rem', color: isLow ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {item.stockLevel}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{item.minStockLevel}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.unit}</td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-inactive" style={{ gap: '0.25rem' }}>
                            <AlertTriangle size={12} />
                            Reorder Required
                          </span>
                        ) : (
                          <span className="badge badge-active">
                            Ok
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button onClick={() => adjustStock(item.id, -1)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontWeight: '800' }}>
                            -
                          </button>
                          <button onClick={() => adjustStock(item.id, 5)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontWeight: '800', color: 'var(--accent)' }}>
                            +5
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button onClick={() => handleOpenEdit(item)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem' }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', color: 'var(--danger)' }}>
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
              <h2 className="modal-title">{showAddModal ? 'Register New Material' : 'Edit Inventory Item'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Material Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Non-Toxic Glue Sticks" 
                  className="form-control" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-control"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Starting Stock Quantity</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stockLevel}
                    onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
                    placeholder="e.g. 50" 
                    className="form-control" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Warning Threshold</label>
                  <input 
                    type="number" 
                    required
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    placeholder="e.g. 10" 
                    className="form-control" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Measurement Unit</label>
                <input 
                  type="text" 
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g. boxes, units, bottles, sheets" 
                  className="form-control" 
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
