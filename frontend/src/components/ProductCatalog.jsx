import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="container">
      <header style={{ marginTop: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600 }}>Product <span style={{ color: 'var(--primary)' }}>Catalog</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your entire inventory list.</p>
      </header>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td><code>{product.sku}</code></td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td>{product.quantity}</td>
                  <td>
                    {product.quantity <= 0 ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : product.quantity <= product.threshold ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Catalog is empty.</td>
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
