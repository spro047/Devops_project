import React, { useState, useEffect } from 'react';
import { 
  getWarehouseStatus, 
  getProducts, 
  getDispatchQueue, 
  getTransactions,
  receiveShipment,
  markDamage,
  moveZone,
  clearOldStock
} from '../services/api';
import { Package, Truck, Activity, AlertTriangle, Clock, Layers, Move, Trash2, Plus, ArrowRight } from 'lucide-react';

const WarehouseModule = ({ onProcessQueue }) => {
  const [status, setStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveForm, setReceiveForm] = useState({ sku: '', quantity: '', supplier: '', zone: 'Zone A' });

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
      setLogs(lRes.data.filter(t => ['RECEIVE', 'DISPATCH', 'DAMAGE', 'ADJUST'].includes(t.type)).slice(0, 15));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReceive = async (e) => {
    e.preventDefault();
    try {
      await receiveShipment({
        sku: receiveForm.sku,
        quantity: parseInt(receiveForm.quantity),
        supplier: receiveForm.supplier
      });
      // If zone is different from default, move it
      const p = products.find(p => p.sku === receiveForm.sku);
      if (p && p.zone !== receiveForm.zone) {
        await moveZone({ sku: receiveForm.sku, zone: receiveForm.zone });
      }
      setShowReceiveModal(false);
      setReceiveForm({ sku: '', quantity: '', supplier: '', zone: 'Zone A' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to receive shipment");
    }
  };

  const handleMoveZone = async (sku, newZone) => {
    try {
      await moveZone({ sku, zone: newZone });
      fetchData();
    } catch (err) {
      alert("Failed to move product");
    }
  };

  const handleClearOld = async (sku) => {
    if (!window.confirm("Are you sure you want to clear the oldest batch of this product?")) return;
    try {
      await clearOldStock({ sku });
      fetchData();
    } catch (err) {
      alert("Clearance failed");
    }
  };

  const handleMarkDamage = async () => {
    const sku = prompt("Enter Product SKU:");
    if (!sku) return;
    const qty = prompt("Enter Damaged Quantity:");
    if (!qty) return;
    try {
      await markDamage({ sku, quantity: parseInt(qty) });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Action failed");
    }
  };

  if (loading) return <div className="container" style={{marginTop: '2rem'}}>Loading Warehouse Control System...</div>;

  const zones = {
    'Zone A': products.filter(p => p.zone === 'Zone A'),
    'Zone B': products.filter(p => p.zone === 'Zone B'),
    'Zone C': products.filter(p => p.zone === 'Zone C'),
  };

  return (
    <div className="container">
      <header style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Warehouse <span style={{ color: 'var(--primary)' }}>Control Center</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Advanced storage, dispatch, and quality management.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button onClick={() => setShowReceiveModal(true)} className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Receive Shipment
          </button>
          <button onClick={onProcessQueue} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={18} /> Process Dispatch Queue
          </button>
        </div>
      </header>

      {/* Capacity & Queue Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
              <Package size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Warehouse Capacity</h2>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>
            {status?.capacity_usage_percent}% <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 400 }}>Full</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ width: `${status?.capacity_usage_percent}%`, height: '100%', background: 'var(--primary)', transition: 'width 1s ease' }}></div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current Stock: {status?.total_stock} / {status?.max_capacity} units</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px', color: 'var(--warning)' }}>
              <Clock size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Dispatch Queue</h2>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
            {queue.filter(q => q.status === 'Pending').map(q => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <span>{q.product_name} ➔ {q.store_name}</span>
                <span className="badge badge-warning">{q.quantity} units</span>
              </div>
            ))}
            {queue.filter(q => q.status === 'Pending').length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>No pending requests.</p>}
          </div>
        </div>
      </div>

      {/* Storage Zones with Movement */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layers size={24} color="var(--primary)" /> Storage Zones Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {['Zone A', 'Zone B', 'Zone C'].map(zoneName => (
            <div key={zoneName} className="glass-card" style={{ minHeight: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{zoneName}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{zones[zoneName].length} items</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {zones[zoneName].map(p => (
                  <div key={p.id} style={{ fontSize: '0.875rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{p.name} ({p.quantity})</span>
                    <select 
                      onChange={(e) => handleMoveZone(p.sku, e.target.value)} 
                      value={zoneName}
                      style={{ fontSize: '0.7rem', padding: '0.2rem', background: 'transparent', border: 'none', color: 'var(--primary)' }}
                    >
                      <option value="Zone A">Move to A</option>
                      <option value="Zone B">Move to B</option>
                      <option value="Zone C">Move to C</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aging & Waste */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '3rem' }}>
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary)" /> Stock Aging Report
          </h2>
          <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Days in Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {status?.aging_report.map(item => (
                  <tr key={item.sku}>
                    <td>{item.name}</td>
                    <td style={{ color: item.days > 30 ? 'var(--danger)' : 'var(--text-main)' }}>
                      {item.days} days {item.days > 30 && <span style={{ fontSize: '0.7rem' }}>(Stale)</span>}
                    </td>
                    <td>
                      <button onClick={() => handleClearOld(item.sku)} className="btn" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}>
                        <Trash2 size={16} /> Clear
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--danger)" /> Waste Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Record damaged or unusable stock immediately to update usable inventory.</p>
          <button onClick={handleMarkDamage} className="btn btn-danger" style={{ width: '100%' }}>
             Mark as Damaged Stock
          </button>
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Total Waste Recorded:</h4>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>
              {products.reduce((acc, p) => acc + (p.damaged_quantity || 0), 0)} units
            </div>
          </div>
        </div>
      </div>

      {/* Operations Log */}
      <div className="glass-card" style={{ marginTop: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--primary)" /> Warehouse Operations Log
        </h2>
        <table>
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
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td>
                  <span className={`badge ${log.type === 'RECEIVE' ? 'badge-success' : log.type === 'DAMAGE' ? 'badge-danger' : 'badge-primary'}`}>
                    {log.type}
                  </span>
                </td>
                <td>{log.product_name}</td>
                <td>{log.quantity}</td>
                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Receive New Shipment</h2>
            <form onSubmit={handleReceive}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Select Product (SKU)</label>
                <select 
                  value={receiveForm.sku} 
                  onChange={(e) => setReceiveForm({...receiveForm, sku: e.target.value})}
                  required
                >
                  <option value="">Select SKU...</option>
                  {products.map(p => <option key={p.id} value={p.sku}>{p.sku} - {p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>Quantity</label>
                  <input type="number" required value={receiveForm.quantity} onChange={(e) => setReceiveForm({...receiveForm, quantity: e.target.value})} />
                </div>
                <div>
                  <label>Storage Zone</label>
                  <select value={receiveForm.zone} onChange={(e) => setReceiveForm({...receiveForm, zone: e.target.value})}>
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label>Supplier Name</label>
                <input type="text" value={receiveForm.supplier} onChange={(e) => setReceiveForm({...receiveForm, supplier: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Entry</button>
                <button type="button" onClick={() => setShowReceiveModal(false)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseModule;
