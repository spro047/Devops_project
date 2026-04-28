import React from 'react';

const StatCard = ({ title, value, color }) => {
  return (
    <div className="glass-card" style={{ transition: 'transform 0.3s' }}>
      <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <div className="value" style={{ fontSize: '2rem', fontWeight: 600, color: color || 'inherit' }}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;
