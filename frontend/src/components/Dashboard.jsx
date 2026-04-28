import React, { useState } from 'react';
import StatCard from './StatCard';
import { adjustInventory } from '../services/api';
import { RefreshCcw } from 'lucide-react';

const Dashboard = ({ data, onRefresh }) => {
  const [adjustments, setAdjustments] = useState({});

  const handleAdjust = async (productId) => {
    const adj = adjustments[productId];
    if (!adj || !adj.amount) return;

    try {
      await adjustInventory(productId, {
        type: adj.type || 'IN',
        amount: parseInt(adj.amount),
        notes: 'Manual update from dashboard'
      });
      onRefresh();
      setAdjustments({ ...adjustments, [productId]: { amount: '', type: 'IN' } });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to adjust inventory');
    }
  };

  const updateAdj = (productId, field, value) => {
    setAdjustments({
      ...adjustments,
      [productId]: { ...adjustments[productId], [field]: value }
    });
  };

  return (
    <div className="container">
      <header style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Inventory <span style={{ color: 'var(--primary)' }}>Overview</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time stock metrics and health status.</p>
        </div>
        <button onClick={onRefresh} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
          <RefreshCcw size={20} />
        </button>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
        <StatCard title="Total Items" value={data.total_items} />
        <StatCard title="Inventory Value" value={`$${data.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <StatCard 
          title="Low Stock Alerts" 
          value={data.low_stock_count} 
          color={data.low_stock_count > 0 ? 'var(--danger)' : 'var(--success)'} 
        />
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Recent Inventory Health</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>In Stock</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_products.map(product => (
                <tr key={product.id}>
                  <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{product.sku}</code></td>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                  <td>
                    {product.quantity <= 0 ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : product.quantity <= product.threshold ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">Healthy</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        style={{ width: '70px', padding: '0.4rem' }}
                        value={adjustments[product.id]?.amount || ''}
                        onChange={(e) => updateAdj(product.id, 'amount', e.target.value)}
                      />
                      <select 
                        style={{ width: '70px', padding: '0.4rem' }}
                        value={adjustments[product.id]?.type || 'IN'}
                        onChange={(e) => updateAdj(product.id, 'type', e.target.value)}
                      >
                        <option value="IN">IN</option>
                        <option value="OUT">OUT</option>
                      </select>
                      <button 
                        onClick={() => handleAdjust(product.id)}
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.recent_products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No products found. Start by adding one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
