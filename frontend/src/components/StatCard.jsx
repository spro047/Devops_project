import React from 'react';

const safetyBand = {
  healthy: { bg: 'var(--success-bg)', border: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning)' },
  critical: { bg: 'var(--danger-bg)', border: 'var(--danger)' },
};

const StatCard = ({ title, value, health }) => {
  const band = safetyBand[health] || { bg: 'transparent', border: 'var(--border)' };

  return (
    <div className="card" style={{
      padding: '1.25rem 1.5rem',
      borderTop: `3px solid ${band.border}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '2.5rem',
        fontWeight: 400,
        lineHeight: 1.1,
        color: 'var(--text-heading)',
        marginBottom: '0.25rem',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
      }}>
        {title}
      </div>
    </div>
  );
};

export default StatCard;
