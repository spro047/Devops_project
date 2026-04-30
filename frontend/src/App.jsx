import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProductCatalog from './components/ProductCatalog';
import AddProduct from './components/AddProduct';
import TransactionHistory from './components/TransactionHistory';
import WarehouseModule from './components/WarehouseModule';
import DispatchManagement from './components/DispatchManagement';
import LogisticsTracking from './components/LogisticsTracking';
import ShipmentTracking from './components/ShipmentTracking';
import { getDashboardData, API_BASE_URL } from './services/api';

function App() {
  const [view, setView] = useState('dashboard');
  const [trackingId, setTrackingId] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const res = await getDashboardData();
      setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const handleNavLogistics = () => setView('logistics');
    window.addEventListener('nav-logistics', handleNavLogistics);
    return () => window.removeEventListener('nav-logistics', handleNavLogistics);
  }, []);

  const renderView = () => {
    if (loading) return (
      <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
        <div className="loading-shimmer" style={{ height: '300px', borderRadius: '16px' }}></div>
      </div>
    );

    if (!dashboardData && (view === 'dashboard' || view === 'default')) {
      return (
        <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
          <div className="glass-card">
            <h2 style={{ color: 'var(--danger)' }}>Failed to connect to backend</h2>
            <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>Please ensure the Flask server is running at {API_BASE_URL.replace('/api', '')}</p>
            <button onClick={refreshData} className="btn btn-primary">Retry Connection</button>
          </div>
        </div>
      );
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard 
                  data={dashboardData} 
                  onRefresh={refreshData} 
                  onTrack={(id) => { setTrackingId(id); setView('tracking'); }}
                />;
      case 'inventory':
        return <ProductCatalog />;
      case 'activity':
        return <TransactionHistory />;
      case 'warehouse':
        return <WarehouseModule onProcessQueue={() => setView('dispatch')} />;
      case 'dispatch':
        return <DispatchManagement onBack={() => setView('warehouse')} />;
      case 'logistics':
        return <LogisticsTracking onBack={() => setView('dispatch')} />;
      case 'tracking':
        return <ShipmentTracking trackingId={trackingId} onBack={() => setView('dashboard')} />;
      case 'add':
        return <AddProduct 
                  onSuccess={() => { setView('dashboard'); refreshData(); }} 
                  onCancel={() => setView('dashboard')} 
               />;
      default:
        return <Dashboard data={dashboardData} onRefresh={refreshData} />;
    }
  };

  return (
    <div className="App">
      <Navbar onNavigate={setView} currentView={view} />
      <main>
        {renderView()}
      </main>
      <footer style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>&copy; 2026 IMS Pro - Simple & Stable Inventory Solutions</p>
      </footer>
    </div>
  );
}

export default App;
