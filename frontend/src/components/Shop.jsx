import React, { useEffect, useState } from 'react';
import { getProducts, placeStoreOrder } from '../services/api';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (product) => {
    setOrdering(product.id);
    setMessage(null);
    try {
      const res = await placeStoreOrder({
        sku: product.sku,
        quantity: 1,
        customer_name: 'Store Customer'
      });
      setMessage({ type: 'success', text: `Order Placed! ID: ${res.data.order_id}` });
      fetchProducts(); // Refresh stock
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Checkout failed.' });
    } finally {
      setOrdering(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>Loading Store...</div>;

  return (
    <div className="container">
      <header style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Mini <span style={{ color: 'var(--primary)' }}>Amazon</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Customer Storefront Demo</p>
      </header>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginTop: '2rem', textAlign: 'center' }}>
          {message.text}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '2rem', 
        marginTop: '3rem' 
      }}>
        {products.map(product => (
          <div key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.name}</h3>
            <span className="badge" style={{ alignSelf: 'flex-start', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)' }}>
              {product.category || 'General'}
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
              ${product.price.toFixed(2)}
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
              {product.quantity > 0 ? (
                <span style={{ color: 'var(--success)' }}>In Stock: {product.quantity}</span>
              ) : (
                <span style={{ color: 'var(--danger)' }}>Out of Stock</span>
              )}
            </p>

            <button 
              className="btn btn-primary" 
              style={{ marginTop: 'auto', width: '100%', opacity: product.quantity <= 0 ? 0.5 : 1 }}
              disabled={product.quantity <= 0 || ordering === product.id}
              onClick={() => handleBuy(product)}
            >
              {ordering === product.id ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
        {products.length === 0 && (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>No products available in store.</div>
        )}
      </div>
    </div>
  );
};

export default Shop;
