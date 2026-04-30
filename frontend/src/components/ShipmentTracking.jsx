import React, { useState, useEffect } from 'react';
import { trackShipment } from '../services/api';
import { Truck, MapPin, Box, CheckCircle, Search, ArrowLeft, Clock, Info } from 'lucide-react';

const ShipmentTracking = ({ initialTrackingId, onBack }) => {
  const [trackingId, setTrackingId] = useState(initialTrackingId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!trackingId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await trackShipment(trackingId);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Tracking ID not found');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingId) {
      handleTrack();
    }
  }, [initialTrackingId]);

  const steps = [
    { label: 'Order Created', status: 'Pending' },
    { label: 'Dispatched', status: 'Approved' },
    { label: 'In Transit', status: 'Dispatched' },
    { label: 'Delivered', status: 'Completed' }
  ];

  const getCurrentStepIndex = () => {
    if (!data) return -1;
    const index = steps.findIndex(s => s.status === data.status);
    return index !== -1 ? index : (data.status === 'Rejected' ? -2 : 0);
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="container">
      <header style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={onBack} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Shipment <span style={{ color: 'var(--primary)' }}>Tracking</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time status of your goods in movement.</p>
        </div>
      </header>

      <div className="glass-card" style={{ marginTop: '2rem', padding: '2rem' }}>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', maxWidth: '600px' }}>
          <input 
            type="text" 
            placeholder="Enter Tracking ID (e.g. TRK12345)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            style={{ flex: 1, padding: '1rem' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 2rem' }}>
            {loading ? 'Searching...' : <><Search size={18} /> Track</>}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginTop: '2rem' }}>
          <Info size={18} /> {error}
        </div>
      )}

      {data && (
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          
          {/* Summary & Timeline */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tracking ID</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{data.tracking_id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</h3>
                <span className={`badge ${data.status === 'Completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '1rem' }}>
                  {data.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Timeline View */}
            <div style={{ marginTop: '3rem', position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
              {/* Timeline Line */}
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '5%', 
                width: '90%', 
                height: '4px', 
                background: 'rgba(255,255,255,0.05)', 
                zIndex: 0 
              }}>
                <div style={{ 
                  height: '100%', 
                  background: 'var(--primary)', 
                  width: `${(currentStep / (steps.length - 1)) * 100}%`, 
                  transition: 'width 1s ease' 
                }}></div>
              </div>

              {steps.map((step, i) => (
                <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '20%' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: i <= currentStep ? 'var(--primary)' : 'rgba(15, 23, 42, 0.9)', 
                    border: `2px solid ${i <= currentStep ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '50%', 
                    margin: '0 auto 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: i <= currentStep ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none'
                  }}>
                    {i < currentStep ? <CheckCircle size={20} /> : i === currentStep ? <Truck size={20} className="animate-pulse" /> : i + 1}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: i <= currentStep ? 600 : 400, color: i <= currentStep ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Product Details</h4>
                <p style={{ fontWeight: 600 }}>{data.product_name} ({data.quantity} units)</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Estimated Arrival</h4>
                <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{data.estimated_delivery}</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>From</h4>
                <p style={{ fontWeight: 600 }}>{data.source}</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>To</h4>
                <p style={{ fontWeight: 600 }}>{data.destination}</p>
              </div>
            </div>
          </div>

          {/* Map & Visual Animation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', height: '300px', position: 'relative', overflow: 'hidden' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Live Path</h2>
              <div style={{ position: 'relative', width: '100%', height: '150px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem' }}>
                <Box size={40} color="var(--primary)" />
                <div style={{ flex: 1, position: 'relative', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }}>
                   <div style={{ 
                     position: 'absolute', 
                     top: '-20px', 
                     left: `${(currentStep / (steps.length - 1)) * 100}%`,
                     transition: 'left 2s ease-in-out',
                     color: 'var(--primary)'
                   }}>
                     <Truck size={30} />
                   </div>
                </div>
                <MapPin size={40} color="var(--success)" />
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentStep === 3 ? 'Package Delivered!' : currentStep >= 1 ? 'Shipment is on the way.' : 'Awaiting dispatch.'}
              </div>
            </div>

            <div className="glass-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Tracking History</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Clock size={16} color="var(--text-muted)" style={{ marginTop: '4px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Shipment Processed</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(data.created_at).toLocaleString()}</div>
                  </div>
                </div>
                {currentStep >= 1 && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <Truck size={16} color="var(--primary)" style={{ marginTop: '4px' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Handed over to Fleet</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updating...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      <style>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export default ShipmentTracking;
