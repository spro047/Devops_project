import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter(p => 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === 'All' || p.category === categoryFilter)
    );
    setFilteredProducts(results);
  }, [searchTerm, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Product <span style={{ color: 'var(--primary)' }}>Catalog</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your entire inventory list.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search by SKU or Name..." 
          style={{ flex: 1 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          style={{ width: '200px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {[...new Set(products.map(p => p.category))].filter(Boolean).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {products.filter(p => p.quantity > 0 && p.quantity <= p.threshold).map(product => (
        <div key={product.id} className="alert alert-warning">
          <span role="img" aria-label="warning">⚠️</span>
          Product <strong>{product.name}</strong> is running low ({product.quantity} remaining)
        </div>
      ))}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '1rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Storage Zone</th>
                <th>Usable Stock</th>
                <th>Damaged</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td><code>{product.sku}</code></td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td><span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>{product.zone}</span></td>
                  <td style={{ 
                    color: product.status === 'Out of Stock' ? 'var(--danger)' : product.status === 'Low Stock' ? 'var(--warning)' : 'inherit',
                    fontWeight: product.status === 'Out of Stock' ? 'bold' : 'normal'
                  }}>
                    {product.quantity}
                  </td>
                  <td style={{ color: product.damaged_quantity > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {product.damaged_quantity || 0}
                  </td>
                  <td>
                    {product.status === 'Out of Stock' ? (
                      <span className="badge badge-danger">🔴 {product.status}</span>
                    ) : product.status === 'Low Stock' ? (
                      <span className="badge badge-warning">🟡 {product.status}</span>
                    ) : (
                      <span className="badge badge-success">🟢 {product.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {searchTerm || categoryFilter !== 'All' ? 'No matches found.' : 'Catalog is empty.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
