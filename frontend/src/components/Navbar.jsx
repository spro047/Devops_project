import React from 'react';
import { LayoutDashboard, Package, PlusCircle, History, Layers, ShoppingCart } from 'lucide-react';

const Navbar = ({ onNavigate, currentView }) => {
  return (
    <nav className="navbar" style={{ 
      background: 'rgba(2, 6, 23, 0.7)', 
      backdropFilter: 'blur(20px)', 
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '1.2rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="#" className="logo" style={{ 
          fontSize: '1.8rem', 
          fontWeight: 800, 
          background: 'linear-gradient(to right, #f8fafc, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
          letterSpacing: '-1px'
        }}>
          IMSPro
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
              onClick={() => onNavigate('warehouse')} 
              style={{ background: 'none', border: 'none', color: currentView === 'warehouse' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Layers size={18} /> Warehouse
            </button>
          </li>
          <li>
            <button 
              onClick={() => onNavigate('shop')} 
              style={{ background: 'none', border: 'none', color: currentView === 'shop' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ShoppingCart size={18} /> Storefront
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
