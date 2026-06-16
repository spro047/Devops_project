import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { Sun, Moon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProductCatalog from './components/ProductCatalog';
import AddProduct from './components/AddProduct';
import TransactionHistory from './components/TransactionHistory';
import WarehouseModule from './components/WarehouseModule';
import Shop from './components/Shop';
import DispatchManagement from './components/DispatchManagement';
import LogisticsTracking from './components/LogisticsTracking';
import ShipmentTracking from './components/ShipmentTracking';
import { getDashboardData, API_BASE_URL } from './services/api';

function App() {
  const [view, setView] = useState('dashboard');
  const [trackingId, setTrackingId] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem('ims-theme') === 'dark');

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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('ims-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const renderView = () => {
    if (loading) return (
      <div className="main-content-area">
        <div className="container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <div className="loading-shimmer" style={{ height: '300px', borderRadius: '16px' }}></div>
        </div>
      </div>
    );

    if (!dashboardData && (view === 'dashboard' || view === 'default')) {
      return (
        <div className="main-content-area">
          <div className="container" style={{ paddingTop: '3rem' }}>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Failed to connect to backend</h2>
              <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>Please ensure the Flask server is running at {API_BASE_URL.replace('/api', '')}</p>
              <button onClick={refreshData} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry Connection</button>
            </div>
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
      case 'shop':
        return <Shop />;
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
    <div className="app-layout">
      <Navbar onNavigate={setView} currentView={view} />
      <main className="main-content-area">
        <button className="theme-toggle" onClick={() => setDark(p => !p)} title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="container slide-in">
          {renderView()}
        </div>
        <footer className="app-footer">
          <p>&copy; ims pro final review </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
