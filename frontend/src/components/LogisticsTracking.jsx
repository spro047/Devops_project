import React, { useState, useEffect } from 'react';
import { getDispatchQueue } from '../services/api';
import { MapPin, Truck, Box, CheckCircle, Clock, Calendar, ArrowLeft, Activity } from 'lucide-react';

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
    const interval = setInterval(fetchDeliveries, 5000); // Poll faster for demo
    return () => clearInterval(interval);
  }, []);

  const activeDeliveries = deliveries.filter(d => ['Approved', 'Dispatched'].includes(d.status));
  const completedDeliveries = deliveries.filter(d => d.status === 'Completed');
  
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
      <div className="glass-card" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center', overflow: 'hidden', position: 'relative', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div className={loadingCount > 0 ? 'pulse-icon' : ''} style={{ background: 'var(--primary)', padding: '1.25rem', borderRadius: '50%', color: 'white', marginBottom: '0.75rem', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)', transition: 'all 0.3s ease' }}>
              <Box size={32} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Central Warehouse</div>
          </div>

          <div style={{ flex: 1, position: 'relative', height: '4px', background: 'rgba(255,255,255,0.05)', margin: '0 2rem', borderRadius: '2px' }}>
            {/* The Truck */}
            <div className="truck-container" style={{ 
              position: 'absolute', 
              top: '-32px', 
              left: transitCount > 0 ? '50%' : loadingCount > 0 ? '10%' : '0%',
              transform: 'translateX(-50%)',
              transition: 'all 2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: (loadingCount > 0 || transitCount > 0) ? 'flex' : 'none',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10
            }}>
              <div style={{ background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', border: '1px solid var(--primary)', marginBottom: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                {transitCount > 0 ? 'IN TRANSIT' : 'LOADING'}
              </div>
              <Truck size={42} color="var(--primary)" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
            </div>

            {/* Path Animation */}
            {transitCount > 0 && (
              <div className="path-animation" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'repeating-linear-gradient(90deg, var(--primary) 0, var(--primary) 10px, transparent 10px, transparent 20px)',
                backgroundSize: '200% 100%',
                opacity: 0.4,
                borderRadius: '2px'
              }}></div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className={transitCount > 0 ? 'pulse-success' : ''} style={{ background: 'var(--success)', padding: '1.25rem', borderRadius: '50%', color: 'white', marginBottom: '0.75rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', transition: 'all 0.3s ease' }}>
              <MapPin size={32} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Regional Stores</div>
          </div>
        </div>
        <div style={{ marginTop: '2.5rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '3rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: loadingCount > 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }}></div>
            <span><strong>{loadingCount}</strong> Vehicles Loading</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: transitCount > 0 ? 'var(--success)' : 'rgba(255,255,255,0.1)' }}></div>
            <span><strong>{transitCount}</strong> Vehicles In Transit</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Simulated Map View */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <MapPin size={18} color="var(--primary)" /> Fleet Geography
          </h2>
          <div className="map-container" style={{ 
            width: '100%', 
            height: '320px', 
            background: '#0f172a', 
            borderRadius: '12px', 
            position: 'relative', 
            border: '1px solid var(--border)',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}>
            {/* Warehouse Marker */}
            <div style={{ position: 'absolute', top: '50%', left: '15%', color: 'var(--primary)', textAlign: 'center' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                <Box size={20} />
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, marginTop: '4px' }}>WH-MAIN</div>
            </div>

            {/* Store Markers */}
            <div style={{ position: 'absolute', top: '25%', left: '75%', color: 'var(--text-muted)', textAlign: 'center' }}>
              <MapPin size={24} />
              <div style={{ fontSize: '0.6rem' }}>Store A</div>
            </div>
            <div style={{ position: 'absolute', top: '75%', left: '85%', color: 'var(--text-muted)', textAlign: 'center' }}>
              <MapPin size={24} />
              <div style={{ fontSize: '0.6rem' }}>Store B</div>
            </div>

            {/* Dynamic Fleet Markers */}
            {activeDeliveries.map((d, i) => (
              <div key={d.id} className="fleet-marker" style={{ 
                position: 'absolute', 
                top: `${35 + (i * 15)}%`, 
                left: `${35 + (i * 20)}%`, 
                color: 'var(--primary)',
                zIndex: 20
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div style={{ fontSize: '0.5rem', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginBottom: '2px', fontWeight: 700 }}>{d.store_name}</div>
                   <Truck size={28} style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Dispatch List */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Live Dispatches</h2>
          <div style={{ overflowY: 'auto', maxHeight: '320px', paddingRight: '0.5rem' }}>
            {activeDeliveries.map(d => (
              <div key={d.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '1rem', borderLeft: `4px solid ${d.status === 'Dispatched' ? 'var(--success)' : 'var(--primary)'}`, transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.product_name}</span>
                  <span className={`badge ${d.status === 'Dispatched' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                    {d.status === 'Dispatched' ? 'IN TRANSIT' : 'LOADING'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>To: {d.store_name}</span>
                  <span>Qty: {d.fulfilled_quantity || d.quantity}</span>
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={12} /> <span style={{ fontWeight: 600 }}>ETA: 30s Simulation</span>
                </div>
              </div>
            ))}
            {activeDeliveries.length === 0 && (
               <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                 <p style={{ fontSize: '0.85rem' }}>No active deliveries.</p>
                 <p style={{ fontSize: '0.75rem' }}>Approve a request in Dispatch to see it here.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* History & Calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
         <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Calendar size={18} color="var(--primary)" /> Dispatch History
            </h2>
            <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
               <table>
                  <thead>
                     <tr><th>Product</th><th>To</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                     {completedDeliveries.map(d => (
                        <tr key={d.id}>
                           <td>{d.product_name}</td>
                           <td>{d.store_name}</td>
                           <td><span className="badge badge-success">DELIVERED</span></td>
                        </tr>
                     ))}
                     {completedDeliveries.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No history yet.</td></tr>}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Weekly Schedule</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
               {['M','T','W','T','F','S','S'].map((day, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{day}</div>
                     <div style={{ height: '60px', background: i === 2 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: i === 2 ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                        {i === 2 ? activeDeliveries.length + completedDeliveries.length : 0}
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <style>{`
        .path-animation { animation: movePath 1.5s linear infinite; }
        .fleet-marker { animation: floatTruck 3s ease-in-out infinite; }
        @keyframes movePath { from { background-position: 0 0; } to { background-position: 40px 0; } }
        @keyframes floatTruck { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-icon { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
        @keyframes pulse-success { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .pulse-icon { animation: pulse-icon 2s infinite; }
        .pulse-success { animation: pulse-success 2s infinite; }
      `}</style>
    </div>
  );
};

export default LogisticsTracking;
