import React, { useState, useEffect } from 'react';
import { getWarehouseStatus, getProducts, getDispatchQueue, processDispatch, getTransactions } from '../services/api';
import { Package, Truck, Activity, AlertTriangle, Clock, Layers } from 'lucide-react';

const WarehouseModule = () => {
  const [status, setStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sRes, pRes, qRes, lRes] = await Promise.all([
        getWarehouseStatus(),
        getProducts(),
        getDispatchQueue(),
        getTransactions()
      ]);
      setStatus(sRes.data);
      setProducts(pRes.data);
      setQueue(qRes.data);
      setLogs(lRes.data.filter(t => ['RECEIVE', 'DISPATCH', 'DAMAGE'].includes(t.type)).slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessQueue = async () => {
    try {
      await processDispatch();
      fetchData();
    } catch (err) {
      alert("Failed to process queue");
    }
  };

  if (loading) return <div className="container" style={{marginTop: '2rem'}}>Loading Warehouse Data...</div>;

  return (
    <div className="container">
      <header style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Warehouse <span style={{ color: 'var(--primary)' }}>Control Center</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Advanced storage, dispatch, and quality management.</p>
        </div>
        <button onClick={handleProcessQueue} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={18} /> Process Dispatch Queue
        </button>
      </header>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        
        {/* Capacity Indicator */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
              <Package size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Warehouse Capacity</h2>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {status?.capacity_usage_percent}% <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Full</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${status?.capacity_usage_percent}%`, 
              height: '100%', 
              background: status?.capacity_usage_percent > 80 ? 'var(--danger)' : 'var(--primary)',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Current Stock: {status?.total_stock} / {status?.max_capacity} units
          </p>
        </div>

        {/* Dispatch Queue */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--warning)' }}>
              <Clock size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Dispatch Queue</h2>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {queue.filter(q => q.status === 'Pending').map(req => (
              <div key={req.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{req.store_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.product_name} x {req.quantity}</div>
                </div>
                <span className={`badge ${req.priority === 3 ? 'badge-danger' : req.priority === 2 ? 'badge-warning' : 'badge-success'}`}>
                  P{req.priority}
                </span>
              </div>
            ))}
            {queue.filter(q => q.status === 'Pending').length === 0 && <p style={{ color: 'var(--text-muted)' }}>No pending requests.</p>}
          </div>
        </div>

        {/* Storage Zones */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
              <Layers size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Storage Zones Overview</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {['Zone A', 'Zone B', 'Zone C'].map(zone => (
              <div key={zone} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{zone}</h3>
                {products.filter(p => p.zone === zone).slice(0, 3).map(p => (
                  <div key={p.id} style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{p.name} ({p.quantity})</div>
                ))}
                {products.filter(p => p.zone === zone).length > 3 && <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>+ others</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Stock Aging & Batches */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
              <Clock size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Stock Aging Report</h2>
          </div>
          {status?.aging_report.slice(0, 5).map(item => (
            <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
              <span style={{ fontSize: '0.875rem', color: item.days > 30 ? 'var(--danger)' : 'inherit' }}>
                {item.days} days in stock
              </span>
            </div>
          ))}
        </div>

        {/* Damaged Stock */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--danger)' }}>
              <AlertTriangle size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Waste Management</h2>
          </div>
          {products.filter(p => p.damaged_quantity > 0).map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.875rem' }}>{p.name}</span>
              <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{p.damaged_quantity} units</span>
            </div>
          ))}
          {products.filter(p => p.damaged_quantity > 0).length === 0 && <p style={{ color: 'var(--text-muted)' }}>No damaged stock recorded.</p>}
        </div>

        {/* Warehouse Activity Log */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
              <Activity size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Warehouse Operations Log</h2>
          </div>
          <table style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Operation</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <span className={`badge ${log.type === 'RECEIVE' ? 'badge-success' : log.type === 'DAMAGE' ? 'badge-danger' : 'badge-warning'}`}>
                      {log.type}
                    </span>
                  </td>
                  <td>{log.product_name}</td>
                  <td>{log.quantity}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default WarehouseModule;
