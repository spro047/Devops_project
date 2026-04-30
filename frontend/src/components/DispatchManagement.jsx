import React, { useState, useEffect } from 'react';
import { getDispatchQueue, updateDispatch } from '../services/api';
import { Truck, CheckCircle, XCircle, AlertCircle, ArrowLeft, Clock } from 'lucide-react';

const DispatchManagement = ({ onBack }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partialQtys, setPartialQtys] = useState({});
  const [message, setMessage] = useState(null);

  const fetchQueue = async () => {
    try {
      const res = await getDispatchQueue();
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id, action, quantity = null) => {
    try {
      const res = await updateDispatch(id, { action, quantity });
      setMessage({ type: 'success', text: res.data.message });
      fetchQueue();
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Action failed' });
    }
  };

  if (loading) return <div className="container" style={{marginTop: '2rem'}}>Loading Queue...</div>;

  const pending = queue.filter(q => ['Pending', 'Approved', 'Dispatched'].includes(q.status));
  const history = queue.filter(q => ['Completed', 'Rejected', 'Cancelled'].includes(q.status));

  return (
    <div className="container">
      <header style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={onBack} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Dispatch <span style={{ color: 'var(--primary)' }}>Management</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Fulfill store requests and track stock movement.</p>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('nav-logistics'))} 
          className="btn btn-primary" 
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Truck size={18} /> View Logistics / Visual Tracking
        </button>
      </header>

      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{ marginTop: '2rem' }}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={24} color="var(--warning)" /> Active Requests
        </h2>
        
        {pending.length === 0 && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <h3>No requests yet.</h3>
            <p>Go to the <strong>Inventory</strong> page and click "Request" on any product to see it here.</p>
          </div>
        )}

        {pending.length > 0 && (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Store</th>
                  <th>Product</th>
                  <th>Qty (Req / Fill)</th>
                  <th>Warehouse Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(req => {
                  const isShortage = req.available_stock < (req.quantity - req.fulfilled_quantity);
                  const displayStatus = req.status === 'Dispatched' ? 'In Transit' : req.status;
                  return (
                    <tr key={req.id}>
                      <td><code>{req.request_id}</code></td>
                      <td>{req.store_name}</td>
                      <td>
                        <div>{req.product_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.sku}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{req.quantity}</span> / {req.fulfilled_quantity}
                      </td>
                      <td>
                        <span style={{ color: isShortage ? 'var(--danger)' : 'var(--success)' }}>
                          {req.available_stock} units
                        </span>
                        {isShortage && <div style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Shortage!</div>}
                      </td>
                      <td>
                        <span className={`badge ${req.status === 'Pending' ? 'badge-warning' : req.status === 'Dispatched' ? 'badge-primary' : 'badge-success'}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {req.status === 'Pending' && (
                            <>
                              <button onClick={() => handleAction(req.id, 'APPROVE')} className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>Approve</button>
                              <button onClick={() => handleAction(req.id, 'REJECT')} className="btn btn-danger" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--danger)' }}>Reject</button>
                            </>
                          )}
                          {(req.status === 'Approved' || req.status === 'Dispatched') && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input 
                                type="number" 
                                placeholder="Qty" 
                                style={{ width: '60px', padding: '0.4rem' }}
                                value={partialQtys[req.id] || ''}
                                onChange={(e) => setPartialQtys({...partialQtys, [req.id]: e.target.value})}
                              />
                              <button 
                                onClick={() => handleAction(req.id, 'FULFILL', partialQtys[req.id])} 
                                className="btn btn-success" 
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                                disabled={isShortage && !partialQtys[req.id]}
                              >
                                {req.status === 'Dispatched' ? 'Complete' : 'Dispatch'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Dispatch History</h2>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Store</th>
                <th>Product</th>
                <th>Fulfilled</th>
                <th>Status</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map(req => (
                <tr key={req.id}>
                  <td>{req.request_id}</td>
                  <td>{req.store_name}</td>
                  <td>{req.product_name}</td>
                  <td>{req.fulfilled_quantity} / {req.quantity}</td>
                  <td>
                    <span className={`badge ${req.status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DispatchManagement;
