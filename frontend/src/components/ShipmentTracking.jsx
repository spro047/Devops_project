import React, { useState, useEffect, useRef } from 'react';
import { getTrackingDetails } from '../services/api';
import { Truck, MapPin, Box, CheckCircle, ArrowLeft, Clock, Activity, Navigation, AlertTriangle } from 'lucide-react';

const ShipmentTracking = ({ trackingId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await getTrackingDetails(trackingId);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Tracking ID not found");
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 2000); // Faster polling for smooth movement
    return () => clearInterval(interval);
  }, [trackingId]);

  useEffect(() => {
    if (!data || !window.L) return;

    const lat = data.lat || 12.9716;
    const lng = data.lng || 77.5946;

    if (!mapInstance.current) {
      // Initialize Map
      mapInstance.current = window.L.map('map-container', {
        zoomControl: false,
        attributionControl: false
      }).setView([lat, lng], 10);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);

      // Warehouse Marker
      window.L.marker([12.9716, 77.5946], {
        icon: window.L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background:var(--primary); padding:8px; border-radius:50%; color:white; border:2px solid white;'>📦</div>",
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(mapInstance.current).bindPopup("Central Warehouse");

      // Store Marker
      window.L.marker([data.dest_lat || 12.2958, data.dest_lng || 76.6394], {
        icon: window.L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background:var(--success); padding:8px; border-radius:50%; color:white; border:2px solid white;'>📍</div>",
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(mapInstance.current).bindPopup(data.store_name);

      // Route Line
      window.L.polyline([
        [12.9716, 77.5946],
        [data.dest_lat || 12.2958, data.dest_lng || 76.6394]
      ], { color: 'var(--primary)', dashArray: '10, 10', opacity: 0.5 }).addTo(mapInstance.current);

      // Truck Marker
      markerRef.current = window.L.marker([lat, lng], {
        icon: window.L.divIcon({
          className: 'truck-icon',
          html: "<div style='color:var(--primary); filter: drop-shadow(0 0 5px white);'><svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='1' y='3' width='15' height='13'></rect><polygon points='16 8 20 8 23 11 23 16 16 16 16 8'></polygon><circle cx='5.5' cy='18.5' r='2.5'></circle><circle cx='18.5' cy='18.5' r='2.5'></circle></svg></div>",
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }).addTo(mapInstance.current);
    }

    if (markerRef.current) {
       markerRef.current.setLatLng([lat, lng]);
       if (data.status === 'Dispatched') {
          mapInstance.current.panTo([lat, lng]);
       }
    }
  }, [data]);

  if (loading) return <div className="container" style={{marginTop: '4rem', textAlign: 'center'}}>📡 Connecting to satellite...</div>;
  if (error) return (
    <div className="container" style={{marginTop: '4rem', textAlign: 'center'}}>
      <AlertTriangle size={64} color="var(--danger)" style={{marginBottom: '1rem'}} />
      <h2 style={{color: 'var(--danger)'}}>{error}</h2>
      <button onClick={onBack} className="btn btn-primary" style={{marginTop: '1rem'}}>Go Back</button>
    </div>
  );

  const steps = [
    { label: 'Order Created', status: 'Pending' },
    { label: 'Loading', status: 'Approved' },
    { label: 'In Transit', status: 'Dispatched' },
    { label: 'Delivered', status: 'Completed' }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === data.status);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={onBack} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Shipment <span style={{ color: 'var(--primary)' }}>Tracking</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time movement via GPS Simulation</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Left Side: Summary & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Summary */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tracking ID</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{data.tracking_id}</div>
               </div>
               <span className={`badge ${data.status === 'Completed' ? 'badge-success' : 'badge-warning'}`} style={{ height: 'fit-content' }}>
                  {data.status.toUpperCase()}
               </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
               <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Product</h4>
                  <div style={{ fontWeight: 600 }}>{data.product_name}</div>
               </div>
               <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Quantity</h4>
                  <div style={{ fontWeight: 600 }}>{data.quantity} units</div>
               </div>
               <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Source</h4>
                  <div style={{ fontWeight: 600 }}>{data.source}</div>
               </div>
               <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Destination</h4>
                  <div style={{ fontWeight: 600 }}>{data.store_name}</div>
               </div>
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <Clock size={20} color="var(--primary)" />
               <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Est. Delivery</h4>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{data.estimated_delivery}</div>
               </div>
            </div>
          </div>

          {/* Section 2: Timeline */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Activity size={18} color="var(--primary)" /> Status Timeline
            </h3>
            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
               <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.05)' }}></div>
               {steps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={idx} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                       <div style={{ 
                         position: 'absolute', 
                         left: '-2rem', 
                         width: '16px', 
                         height: '16px', 
                         background: isCurrent ? 'var(--primary)' : isDone ? 'var(--success)' : 'var(--bg-card)', 
                         borderRadius: '50%',
                         border: `3px solid ${isCurrent ? 'white' : 'var(--border)'}`,
                         zIndex: 1,
                         boxShadow: isCurrent ? '0 0 10px var(--primary)' : 'none'
                       }}></div>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--text-main)' : isDone ? 'var(--text-main)' : 'var(--text-muted)' }}>
                             {step.label} {isDone && idx !== currentStepIndex && '✔'}
                          </span>
                          {isCurrent && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Currently: {data.current_location}</span>}
                       </div>
                    </div>
                  );
               })}
            </div>
          </div>
        </div>

        {/* Right Side: Map & Visual Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 3: Visual Flow */}
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
             <h3 style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Live Transit Path</h3>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center', zIndex: 2 }}>
                   <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '50%', color: 'white', marginBottom: '0.5rem' }}>
                      <Box size={24} />
                   </div>
                   <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>WH-MAIN</div>
                </div>

                 <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.1)', position: 'relative', margin: '0 1rem' }}>
                    {/* Calculate smooth percentage based on coordinates for the 2D icon */}
                    {(() => {
                      const startLat = 12.9716;
                      const endLat = data.dest_lat || 12.2958;
                      const currentLat = data.lat;
                      
                      let progress = 0;
                      if (data.status === 'Dispatched') {
                        // Calculate progress based on how far we are from startLat to endLat
                        const totalDist = Math.abs(startLat - endLat);
                        const currentDist = Math.abs(startLat - currentLat);
                        progress = Math.min(95, Math.max(5, (currentDist / totalDist) * 100));
                      } else if (data.status === 'Approved') {
                        progress = 5;
                      } else if (data.status === 'Completed') {
                        progress = 100;
                      } else {
                        progress = 0;
                      }

                      return (
                        <div style={{ 
                          position: 'absolute', 
                          left: `${progress}%`, 
                          top: '-20px', 
                          transition: 'left 1s linear',
                          color: 'var(--primary)',
                          transform: 'translateX(-50%)'
                        }}>
                           <Truck size={32} />
                        </div>
                      );
                    })()}
                 </div>

                <div style={{ textAlign: 'center', zIndex: 2 }}>
                   <div style={{ background: 'var(--success)', padding: '0.75rem', borderRadius: '50%', color: 'white', marginBottom: '0.5rem' }}>
                      <MapPin size={24} />
                   </div>
                   <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>{data.store_name}</div>
                </div>
             </div>
          </div>

          {/* Section 4: Map View */}
          <div className="glass-card" style={{ padding: '0.5rem', overflow: 'hidden' }}>
             <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Navigation size={18} color="var(--primary)" /> Real-Time Satellite Map
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>LIVE GPS</span>
             </div>
             <div id="map-container" style={{ width: '100%', height: '400px', borderRadius: '12px' }}></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShipmentTracking;
