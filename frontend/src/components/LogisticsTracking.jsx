import React, { useState, useEffect } from 'react';
import { getDispatchQueue } from '../services/api';
import { MapPin, Truck, Box, CheckCircle, Clock, Calendar, ArrowLeft } from 'lucide-react';

const LogisticsTracking = ({ onBack }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await getDispatchQueue();
        setDeliveries(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 10000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const activeDeliveries = deliveries.filter(d => ['Approved', 'Dispatched'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => d.status === 'Completed');
  
  // Calculate Fleet Stats
  const loadingCount = activeDeliveries.filter(d => d.status === 'Approved').length;
  const transitCount = activeDeliveries.filter(d => d.status === 'Dispatched').length;

  if (loading) return <div className="container" style={{marginTop: '2rem'}}>Loading Logistics Dashboard...</div>;

  return (
    <div className="container">
      <header style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={onBack} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Logistics <span style={{ color: 'var(--primary)' }}>Visual Tracking</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time fleet monitoring and delivery status.</p>
        </div>
      </header>

      {/* Hero Animation Section */}
      <div className="glass-card" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '50%', color: 'white', marginBottom: '0.5rem', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
              <Box size={32} />
            </div>
            <div style={{ fontWeight: 600 }}>Central Warehouse</div>
          </div>

          <div style={{ flex: 1, position: 'relative', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '0 2rem' }}>
            <div className={`truck-animation ${transitCount > 0 ? 'moving' : ''}`} style={{ 
              position: 'absolute', 
              top: '-20px', 
              left: transitCount > 0 ? '50%' : loadingCount > 0 ? '10%' : '0%',
              transform: 'translateX(-50%)',
              transition: 'left 2s ease-in-out',
              display: (loadingCount > 0 || transitCount > 0) ? 'block' : 'none'
            }}>
              <Truck size={40} color="var(--primary)" />
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {transitCount > 0 ? 'IN TRANSIT' : 'LOADING'}
              </div>
            </div>
            {/* Animated dashed line */}
            {transitCount > 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 50%, transparent 50%)',
                backgroundSize: '20px 100%',
                opacity: 0.3,
                animation: 'slideLine 1s linear infinite'
              }}></div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--success)', padding: '1rem', borderRadius: '50%', color: 'white', marginBottom: '0.5rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
              <MapPin size={32} />
            </div>
            <div style={{ fontWeight: 600 }}>Regional Stores</div>
          </div>
        </div>
        <div style={{ marginTop: '2rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <span><strong>{loadingCount}</strong> Vehicles Loading</span>
          <span><strong>{transitCount}</strong> Vehicles In Transit</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Simulated Map View */}
        <div className="glass-card" style={{ height: '400px', background: 'rgba(15, 23, 42, 0.9)', position: 'relative' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--primary)" /> Fleet Geography
          </h2>
          <div style={{ width: '100%', height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', position: 'relative', border: '1px solid var(--border)' }}>
            {/* Simulated Map Markers */}
            <div style={{ position: 'absolute', top: '50%', left: '20%', color: 'var(--primary)' }}>
              <Box size={24} />
              <div style={{ fontSize: '0.6rem', fontWeight: 700 }}>WH-01</div>
            </div>
            <div style={{ position: 'absolute', top: '30%', left: '70%', color: 'var(--text-muted)' }}>
              <MapPin size={20} />
              <div style={{ fontSize: '0.6rem' }}>Store A</div>
            </div>
            <div style={{ position: 'absolute', top: '70%', left: '80%', color: 'var(--text-muted)' }}>
              <MapPin size={20} />
              <div style={{ fontSize: '0.6rem' }}>Store B</div>
            </div>
            {activeDeliveries.map((d, i) => (
              <div key={d.id} style={{ 
                position: 'absolute', 
                top: `${40 + (i * 10)}%`, 
                left: `${30 + (i * 15)}%`, 
                color: 'var(--primary)',
                animation: 'floatTruck 3s ease-in-out infinite'
              }}>
                <Truck size={24} />
                <div style={{ fontSize: '0.5rem', background: 'var(--primary)', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>{d.store_name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Dispatch List */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Live Dispatches</h2>
          <div style={{ overflowY: 'auto', maxHeight: '320px' }}>
            {activeDeliveries.map(d => (
              <div key={d.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '1rem', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{d.product_name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>{d.status.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>To: {d.store_name}</span>
                  <span>Qty: {d.fulfilled_quantity || d.quantity}</span>
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> Est. Arrival: Tomorrow
                </div>
              </div>
            ))}
            {activeDeliveries.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No active deliveries.</p>}
          </div>
        </div>

        {/* Calendar / Timeline View */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--primary)" /> Dispatch Schedule
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{day}</div>
                <div style={{ 
                  height: '80px', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  {day === 'Wed' && <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', marginBottom: '4px' }}></div>}
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{day === 'Wed' ? '30' : Math.floor(Math.random() * 28) + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Panel */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Delivery History</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Completion Date</th>
              </tr>
            </thead>
            <tbody>
              {completedDeliveries.map(d => (
                <tr key={d.id}>
                  <td>{d.product_name}</td>
                  <td>{d.store_name}</td>
                  <td><span className="badge badge-success">DELIVERED</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {completedDeliveries.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No completed deliveries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes slideLine {
          from { background-position: 0 0; }
          to { background-position: 20px 0; }
        }
        @keyframes floatTruck {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

export default LogisticsTracking;
