import React from 'react';
import { LayoutDashboard, Package, PlusCircle } from 'lucide-react';

const Navbar = ({ onNavigate, currentView }) => {
  return (
    <nav className="navbar" style={{ 
      background: 'rgba(15, 23, 42, 0.8)', 
      backdropFilter: 'blur(12px)', 
      borderBottom: '1px solid var(--border)',
      padding: '1.2rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="#" className="logo" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}>
          IMS<span style={{ color: 'var(--primary)' }}>Pro</span>
        </a>
        <ul className="nav-links" style={{ display: 'flex', listStyle: 'none', gap: '2rem', alignItems: 'center' }}>
          <li>
            <button 
              onClick={() => onNavigate('dashboard')} 
              style={{ background: 'none', border: 'none', color: currentView === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('inventory')} 
              style={{ background: 'none', border: 'none', color: currentView === 'inventory' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Package size={18} /> Inventory
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('activity')} 
              style={{ background: 'none', border: 'none', color: currentView === 'activity' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <History size={18} /> Activity
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('add')} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <PlusCircle size={18} /> Add Product
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
