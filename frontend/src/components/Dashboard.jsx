import React, { useState } from 'react';
import StatCard from './StatCard';
import InventoryChart from './InventoryChart';
import api from '../services/api';
import { BarChart3, MapPin, Package } from 'lucide-react';

const Dashboard = ({ data, onRefresh, onTrack }) => {
  const [adjustments, setAdjustments] = useState({});
  const [trackInput, setTrackInput] = useState('');

  const handleAdjust = async (product) => {
    const adj = adjustments[product.id];
    if (!adj || !adj.amount) return;

    try {
      const payload = { sku: product.sku, quantity: parseInt(adj.amount) };

      if (adj.type === 'SELL') {
        await api.post('/sell', payload);
      } else if (adj.type === 'OUT') {
        await api.post('/damage', { ...payload, notes: 'Manual waste from dashboard' });
      } else {
        await api.post('/receive', { ...payload, supplier: 'Express Restock' });
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
      [productId]: { ...adjustments[productId], [field]: value },
    });
  };

  const capacityHealth = data?.capacity_usage_percent > 80 ? 'critical' : data?.capacity_usage_percent > 60 ? 'warning' : 'healthy';
  const lowStockHealth = data?.low_stock_count > 0 ? 'warning' : 'healthy';
  const outOfStockHealth = data?.out_of_stock_count > 0 ? 'critical' : 'healthy';

  return (
    <div className="container">
      <header style={{ marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Dashboard <span style={{ color: 'var(--primary)' }}>Overview</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time inventory and warehouse monitoring.</p>
      </header>

      {/* KPI Safety Band Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2.5rem',
      }}>
        <StatCard title="Total Units" value={data?.total_stock?.toLocaleString() || '0'} health="healthy" />
        <StatCard title="Warehouse Capacity" value={`${data?.capacity_usage_percent || 0}%`} health={capacityHealth} />
        <StatCard title="Low Stock" value={data?.low_stock_count || 0} health={lowStockHealth} />
        <StatCard title="Out of Stock" value={data?.out_of_stock_count || 0} health={outOfStockHealth} />
      </div>

      {/* Stock Distribution */}
      <div style={{ marginTop: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.65rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <BarChart3 size={20} />
            </div>
            <h2 style={{ fontSize: '1.15rem' }}>Stock <span style={{ color: 'var(--primary)' }}>Distribution</span></h2>
          </div>
          <InventoryChart products={data?.recent_products} />
        </div>
      </div>

      {/* Track Shipment */}
      <div className="glass-card" style={{
        marginTop: '2.5rem',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        background: 'var(--primary-light)',
        borderColor: 'var(--primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <MapPin size={18} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)' }}>Track Shipment</span>
        </div>
        <input
          type="text"
          placeholder="Enter tracking ID (e.g. DEMO-777)"
          value={trackInput}
          onChange={(e) => setTrackInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => { if (e.key === 'Enter') onTrack(trackInput); }}
          style={{ flex: 1, minWidth: '200px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
        />
        <button
          className="btn btn-primary"
          style={{ padding: '0.5rem 1.25rem', flexShrink: 0 }}
          onClick={() => onTrack(trackInput)}
        >
          Track
        </button>
        {data?.recent_transactions?.filter(t => t.type === 'DISPATCH' && t.notes.includes('Req:')).slice(0, 2).map(t => {
          const match = t.notes.match(/Req: (.*)\)/);
          const id = match ? match[1] : null;
          if (!id) return null;
          return (
            <button
              key={t.id}
              onClick={() => onTrack(id)}
              style={{
                background: 'transparent',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                cursor: 'pointer',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0,
              }}
            >
              {id}
            </button>
          );
        })}
      </div>

      {/* Inventory Health */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '2.5rem' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.55rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <Package size={18} />
            </div>
            <h2 style={{ fontSize: '1.15rem' }}>Inventory <span style={{ color: 'var(--primary)' }}>Health</span></h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
            {data?.total_items || 0} items
          </span>
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
                  <td>
                    <code style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.8rem',
                      background: 'var(--surface)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      {product.sku}
                    </code>
                  </td>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem' }}>{product.quantity}</td>
                  <td>
                    {product.status === 'Out of Stock' ? (
                      <span className="badge badge-danger">{product.status}</span>
                    ) : product.status === 'Low Stock' ? (
                      <span className="badge badge-warning">{product.status}</span>
                    ) : (
                      <span className="badge badge-success">{product.status}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        style={{
                          width: '68px',
                          padding: '0.4rem 0.5rem',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                        value={adjustments[product.id]?.amount || ''}
                        onChange={(e) => updateAdj(product.id, 'amount', e.target.value)}
                      />
                      <select
                        style={{
                          width: '105px',
                          padding: '0.4rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                        value={adjustments[product.id]?.type || 'IN'}
                        onChange={(e) => updateAdj(product.id, 'type', e.target.value)}
                      >
                        <option value="IN">RESTOCK</option>
                        <option value="OUT">WASTE</option>
                        <option value="SELL">SELL</option>
                      </select>
                      <button
                        onClick={() => handleAdjust(product)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.recent_products || data.recent_products.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No products yet. Add your first item to get started.
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
