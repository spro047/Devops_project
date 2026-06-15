import React from 'react';
import { LayoutDashboard, Box, PlusCircle, History, Layers, ShoppingCart } from 'lucide-react';

const NavButton = ({ active, onClick, children, title }) => (
  <button onClick={onClick} title={title} className={active ? 'active' : ''}>
    {children}
  </button>
);

const Navbar = ({ onNavigate, currentView }) => {
  return (
    <nav className="navbar">
      <div style={{ padding: '0 1.5rem', marginBottom: '2.5rem' }}>
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} style={{ padding: 0, margin: 0 }}>
          IMS<span style={{ color: 'var(--primary)' }}>Pro</span>
        </a>
      </div>

      <ul className="nav-links">
        <li><NavButton active={currentView==='dashboard'} onClick={() => onNavigate('dashboard')} title="Dashboard"><LayoutDashboard size={20}/> <span>Dashboard</span></NavButton></li>
        <li><NavButton active={currentView==='inventory'} onClick={() => onNavigate('inventory')} title="Inventory"><Box size={20}/> <span>Inventory</span></NavButton></li>
        <li><NavButton active={currentView==='activity'} onClick={() => onNavigate('activity')} title="Activity"><History size={20}/> <span>Activity</span></NavButton></li>
        <li><NavButton active={currentView==='warehouse'} onClick={() => onNavigate('warehouse')} title="Warehouse"><Layers size={20}/> <span>Warehouse</span></NavButton></li>
        <li><NavButton active={currentView==='shop'} onClick={() => onNavigate('shop')} title="Storefront"><ShoppingCart size={20}/> <span>Storefront</span></NavButton></li>
        
        <li style={{ marginTop: 'auto', padding: '1rem 1.5rem' }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('add')}>
            <PlusCircle size={18}/> <span>New Item</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
