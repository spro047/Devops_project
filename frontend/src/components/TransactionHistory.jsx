import React, { useEffect, useState } from 'react';
import { getTransactions } from '../services/api';
import { History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container">
      <header style={{ marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Activity <span style={{ color: 'var(--primary)' }}>Log</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Historical record of all inventory movements.</p>
      </header>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatDate(t.timestamp)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.product_name}</div>
                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.sku}</code>
                  </td>
                  <td>
                    {t.type === 'IN' ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <ArrowUpRight size={14} /> Stock In
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <ArrowDownLeft size={14} /> Stock Out
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{t.quantity}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.notes || '-'}</td>
                </tr>
              ))}
              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
