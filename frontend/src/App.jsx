import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProductCatalog from './components/ProductCatalog';
import AddProduct from './components/AddProduct';
import { getDashboardData } from './services/api';

function App() {
  const [view, setView] = useState('dashboard');
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
  }, []);

  const renderView = () => {
    if (loading) return (
      <div className="container" style={{ marginTop: '5rem', textAlign: 'center' }}>
        <div className="loading-shimmer" style={{ height: '300px', borderRadius: '16px' }}></div>
      </div>
    );

    switch (view) {
      case 'dashboard':
        return <Dashboard data={dashboardData} onRefresh={refreshData} />;
      case 'inventory':
        return <ProductCatalog />;
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
