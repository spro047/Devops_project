import React, { useState } from 'react';
import StatCard from './StatCard';
import InventoryChart from './InventoryChart';
import api, { adjustInventory } from '../services/api';
import { RefreshCcw } from 'lucide-react';

const Dashboard = ({ data, onRefresh, onTrack }) => {
  const [adjustments, setAdjustments] = useState({});
  const [trackInput, setTrackInput] = useState('');

  const handleAdjust = async (product) => {
    const adj = adjustments[product.id];
    if (!adj || !adj.amount) return;

    try {
      const payload = {
        sku: product.sku,
        quantity: parseInt(adj.amount)
      };

      if (adj.type === 'SELL') {
        // Use direct sell for immediate dashboard updates
        await api.post('/sell', payload);
      } else if (adj.type === 'OUT') {
        // WASTE (OUT) uses the damage endpoint
        await api.post('/damage', {
          ...payload,
          notes: 'Manual waste recording from dashboard'
        });
      } else {
        // RESTOCK (IN) uses the receive endpoint
        await api.post('/receive', {
          ...payload,
          supplier: 'Express Restock'
        });
      }
      
      onRefresh();
      setAdjustments({ ...adjustments, [product.id]: { amount: '', type: 'IN' } });
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const updateAdj = (productId, field, value) => {
    setAdjustments({
      ...adjustments,
      [productId]: { ...adjustments[productId], [field]: value }
    });
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
            Dashboard <span style={{ color: 'var(--primary)' }}>Overview</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Real-time inventory and logistics monitoring</p>
        </div>
        <button onClick={onRefresh} className="btn" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', color: 'var(--primary)' }}>
          <RefreshCcw size={18} />
          <span>Sync Data</span>
        </button>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
        <StatCard title="Total Units" value={data?.total_stock || 0} />
        <StatCard title="Warehouse Capacity" value={`${data?.capacity_usage_percent || 0}% Full`} color={data?.capacity_usage_percent > 80 ? 'var(--danger)' : 'var(--success)'} />
        <StatCard 
          title="Low Stock Alerts" 
          value={data?.low_stock_count || 0} 
          color={data?.low_stock_count > 0 ? 'var(--warning)' : 'var(--success)'} 
        />
        <StatCard 
          title="Out of Stock" 
          value={data?.out_of_stock_count || 0} 
          color={data?.out_of_stock_count > 0 ? 'var(--danger)' : 'var(--success)'} 
        />
      </div>

      {/* NEW: Tracking Search Section */}
      <div className="glass-card slide-in" style={{ marginBottom: '2rem', background: 'var(--primary-light)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>Track Shipment</h2>
            <p style={{ color: 'var(--text-main)', opacity: 0.7, fontSize: '0.9rem', margin: 0 }}>Monitor real-time movement and delivery status</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, maxWidth: '400px' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="e.g. DEMO-777" 
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '0.75rem' }}
                onKeyDown={(e) => { if(e.key === 'Enter') onTrack(trackInput) }}
              />
              <button 
                className="btn btn-primary" 
                style={{ padding: '0 1.5rem' }}
                onClick={() => onTrack(trackInput)}
              >
                Track
              </button>
            </div>
            {/* Suggested IDs */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>Recent IDs:</span>
              <button 
                onClick={() => onTrack('DEMO-777')}
                style={{ background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}
              >
                DEMO-777
              </button>
              {data?.recent_transactions?.filter(t => t.type === 'DISPATCH' && t.notes.includes('Req:')).slice(0, 2).map(t => {
                const match = t.notes.match(/Req: (.*)\)/);
                const trackingId = match ? match[1] : null;
                if (!trackingId) return null;
                return (
                  <button 
                    key={t.id}
                    onClick={() => onTrack(trackingId)}
                    style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', color: 'var(--primary)', cursor: 'pointer', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}
                  >
                    {trackingId}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Stock Distribution</h2>
        <InventoryChart products={data?.recent_products} />
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
              {data?.recent_products?.map(product => (
                <tr key={product.id}>
                  <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{product.sku}</code></td>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                  <td>
                    {product.status === 'Out of Stock' ? (
                      <span className="badge badge-danger">🔴 {product.status}</span>
                    ) : product.status === 'Low Stock' ? (
                      <span className="badge badge-warning">🟡 {product.status}</span>
                    ) : (
                      <span className="badge badge-success">🟢 {product.status}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        min="1"
                        style={{ width: '70px', padding: '0.4rem' }}
                        value={adjustments[product.id]?.amount || ''}
                        onChange={(e) => updateAdj(product.id, 'amount', e.target.value)}
                      />
                      <select 
                        style={{ width: '70px', padding: '0.4rem' }}
                        value={adjustments[product.id]?.type || 'IN'}
                        onChange={(e) => updateAdj(product.id, 'type', e.target.value)}
                      >
                        <option value="IN">RESTOCK (IN)</option>
                        <option value="OUT">WASTE (OUT)</option>
                        <option value="SELL">SELL</option>
                      </select>
                      <button 
                        onClick={() => handleAdjust(product)}
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.recent_products || data.recent_products.length === 0) && (
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
