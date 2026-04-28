import React, { useState } from 'react';
import { addProduct } from '../services/api';

const AddProduct = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    threshold: 10
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

  return (
    <div className="container">
      <div className="glass-card" style={{ maxWidth: '600px', margin: '3rem auto', padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Add New <span style={{ color: 'var(--primary)' }}>Product</span></h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Register a new SKU into the system.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>SKU</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. PRD-001"
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Product Name</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Wireless Mouse"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Category</label>
              <input 
                type="text" 
                placeholder="e.g. Electronics"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Initial Qty</label>
              <input 
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Threshold</label>
              <input 
                type="number"
                min="1"
                value={formData.threshold}
                onChange={(e) => setFormData({...formData, threshold: e.target.value})}
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Product</button>
            <button 
              type="button" 
              onClick={onCancel}
              style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
