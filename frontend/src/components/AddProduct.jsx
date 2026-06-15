import React, { useState } from 'react';
import { addProduct } from '../services/api';
import { Package, MapPin, Hash, DollarSign, Layers, Calendar } from 'lucide-react';

const zoneMeta = {
  'Zone A': { desc: 'General Storage', color: 'var(--primary)' },
  'Zone B': { desc: 'High Value / Tech', color: 'var(--warning)' },
  'Zone C': { desc: 'Bulk / Large Items', color: 'var(--success)' },
};

const AddProduct = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    threshold: 10,
    zone: 'Zone A',
    batch_id: '',
    arrival_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addProduct(formData);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add product');
    }
  };

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="container">
      <header style={{ marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Add New <span style={{ color: 'var(--primary)' }}>Product</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Register a new SKU into the warehouse system.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ maxWidth: '720px', margin: '2.5rem auto', padding: '2rem' }}>

          {/* Product Information */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--icon-bg)', padding: '0.6rem', borderRadius: '10px', color: 'var(--primary)' }}>
                <Package size={18} />
              </div>
              <h2 style={{ fontSize: '1.15rem' }}>Product <span style={{ color: 'var(--primary)' }}>Information</span></h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Hash size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  SKU
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRD-001"
                  value={formData.sku}
                  onChange={set('sku')}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', letterSpacing: '0.04em' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Mouse"
                  value={formData.name}
                  onChange={set('name')}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electronics"
                  value={formData.category}
                  onChange={set('category')}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <DollarSign size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={set('price')}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Initial Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={set('quantity')}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.threshold}
                  onChange={set('threshold')}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
            </div>
          </div>

          {/* Warehouse Assignment */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--icon-bg)', padding: '0.6rem', borderRadius: '10px', color: 'var(--primary)' }}>
                <MapPin size={18} />
              </div>
              <h2 style={{ fontSize: '1.15rem' }}>Warehouse <span style={{ color: 'var(--primary)' }}>Assignment</span></h2>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Layers size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Storage Zone
              </label>
              <select
                value={formData.zone}
                onChange={set('zone')}
                style={{ fontWeight: 500 }}
              >
                {Object.entries(zoneMeta).map(([zone, meta]) => (
                  <option key={zone} value={zone}>{zone} — {meta.desc}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Hash size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Batch ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. BAT-2024-01"
                  value={formData.batch_id}
                  onChange={set('batch_id')}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Arrival Date
                </label>
                <input
                  type="date"
                  value={formData.arrival_date}
                  onChange={set('arrival_date')}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.85rem', fontSize: '0.9rem' }}>
              <Package size={18} />
              Register & Store in Warehouse
            </button>
            <button type="button" onClick={onCancel} className="btn" style={{ padding: '0.85rem 1.5rem', fontSize: '0.9rem' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
