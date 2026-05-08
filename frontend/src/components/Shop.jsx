import React, { useEffect, useState } from 'react';
import { getProducts, placeStoreOrder } from '../services/api';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(null);
  const [message, setMessage] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
      const initialQuantities = {};
      res.data.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId, newQuantity, maxStock) => {
    let v = parseInt(newQuantity, 10) || 1;
    if (v < 1) v = 1;
    if (maxStock != null && v > maxStock) v = maxStock;
    setQuantities(prev => ({ ...prev, [productId]: v }));
  };

  const handleBuy = async (product) => {
    const quantity = quantities[product.id] || 1;
    setOrdering(product.id);
    setMessage(null);
    try {
      const res = await placeStoreOrder({
        sku: product.sku,
        quantity: quantity,
        customer_name: 'Store Customer'
      });
      setMessage({ type: 'success', text: `Order Placed! ID: ${res.data.order_id} (Qty: ${quantity})` });
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
      fetchProducts(); // Refresh stock
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Checkout failed.' });
    } finally {
      setOrdering(null);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <div className="loading-shimmer" style={{ height: '300px', borderRadius: '16px' }}></div>
    </div>
  );

  const displayedProducts = products.slice(0, displayLimit);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <ShoppingCart size={28} style={{ color: 'var(--primary)' }} />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Storefront</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Discover amazing deals on top products</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Show:</label>
          <select 
            value={displayLimit} 
            onChange={(e) => setDisplayLimit(Number(e.target.value))}
            style={{ width: '100px', padding: '0.5rem', borderRadius: '10px' }}
          >
            <option value={5}>5 Items</option>
            <option value={10}>10 Items</option>
            <option value={20}>20 Items</option>
            <option value={50}>50 Items</option>
          </select>
        </div>
      </header>

      {message && (
        <div className={`alert alert-${message.type} fade-in`} style={{ marginBottom: '2rem' }}>
          <span style={{ flex: 1 }}>{message.text}</span>
          <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {displayedProducts.map(product => (
          <div key={product.id} className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '0.75rem', display: 'inline-block' }}>
                {product.category || 'General'}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>{product.name}</h3>
            </div>
            
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
              ${product.price.toFixed(2)}
            </div>
            
            <div style={{ marginBottom: '1.5rem', flex: 1 }}>
              {product.quantity > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></span>
                  {product.quantity} in stock
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--danger)' }}></span>
                  Out of stock
                </div>
              )}
            </div>

            {product.quantity > 0 && (
              <div className="quantity-picker" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: 'var(--bg-main)', padding: '0.4rem' }}>
                <button className="qty-btn" onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) - 1, product.quantity)}>
                  <Minus size={14} />
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={product.quantity} 
                  value={quantities[product.id] || 1} 
                  onChange={(e)=> updateQuantity(product.id, e.target.value, product.quantity)} 
                  style={{ width: '45px', textAlign: 'center', padding: '0.25rem', border: 'none', background: 'transparent', fontWeight: 700 }} 
                />
                <button className="qty-btn" onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1, product.quantity)}>
                  <Plus size={14} />
                </button>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', opacity: product.quantity <= 0 ? 0.5 : 1 }}
              disabled={product.quantity <= 0 || ordering === product.id}
              onClick={() => handleBuy(product)}
            >
              {ordering === product.id ? 'Processing...' : `Buy (${quantities[product.id] || 1})`}
            </button>
          </div>
        ))}
        {products.length === 0 && (
           <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
             <p style={{ fontSize: '1.1rem' }}>No products available at the moment.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
