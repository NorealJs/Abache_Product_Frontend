import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductList({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  const visibleProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();
    return !query || [product.product_name, product.description]
      .some((value) => String(value ?? '').toLowerCase().includes(query));
  });
  const totalUnits = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const inventoryValue = products.reduce((total, product) => total + Number(product.price || 0) * Number(product.quantity || 0), 0);
  const initials = user.username.slice(0, 2);

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>Stockroom</span>
        </div>
        <div className="topbar-right">
          <span className="topbar-label">Your workspace</span>
          <div className="user-chip">
            <span className="avatar">{initials}</span>
            <span className="user-name">{user.username}</span>
          </div>
          <button className="button-quiet" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Workspace / Inventory</p>
            <h1>Your products</h1>
            <p className="page-subtitle">A clear view of everything you have in stock.</p>
          </div>
          <button className="button-primary" onClick={() => setFormFor({})}>
            <span className="button-plus">+</span> Add product
          </button>
        </div>

        {error && <div className="alert error" role="alert">{error}</div>}
        {notice && <div className="alert success" role="status" onClick={() => setNotice('')}>{notice}</div>}

        <section className="stats-grid" aria-label="Inventory summary">
          <article className="stat-card">
            <span className="stat-icon">▤</span>
            <div><p className="stat-label">Products listed</p><p className="stat-value">{loading ? '—' : products.length}</p></div>
          </article>
          <article className="stat-card">
            <span className="stat-icon orange">▦</span>
            <div><p className="stat-label">Units in stock</p><p className="stat-value">{loading ? '—' : totalUnits.toLocaleString()}</p></div>
          </article>
          <article className="stat-card">
            <span className="stat-icon lavender">₱</span>
            <div><p className="stat-label">Inventory value</p><p className="stat-value">{loading ? '—' : peso.format(inventoryValue)}</p></div>
          </article>
        </section>

        <section className="products-card">
          <div className="products-toolbar">
            <div>
              <h2 className="products-title">All products</h2>
              <p className="products-count">{loading ? 'Loading your inventory…' : `${visibleProducts.length} of ${products.length} ${products.length === 1 ? 'product' : 'products'}`}</p>
            </div>
            <div className="search-wrap">
              <input className="search-input" aria-label="Search products" placeholder="Search products…" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </div>
          {loading ? <div className="loading-state">Loading your products…</div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Product</th><th>Description</th><th className="num">Price</th><th className="num">In stock</th><th>Added</th><th aria-label="Actions"></th></tr>
                </thead>
                <tbody>
                  {visibleProducts.length === 0 && (
                    <tr><td colSpan="6">
                      <div className="empty-state">
                        <span className="empty-icon">{products.length ? '⌕' : '+'}</span>
                        <strong>{products.length ? 'No matching products' : 'Your inventory starts here'}</strong>
                        <p>{products.length ? 'Try another name or description.' : 'Add your first product to keep everything organized.'}</p>
                      </div>
                    </td></tr>
                  )}
                  {visibleProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell">
                          <span className="product-symbol">{p.product_name?.trim().charAt(0)?.toUpperCase() || 'P'}</span>
                          <span className="product-name">{p.product_name}</span>
                        </div>
                      </td>
                      <td><div className="product-description" title={p.description || ''}>{p.description || '—'}</div></td>
                      <td className="num">{peso.format(p.price)}</td>
                      <td className="num"><span className={`stock-pill${Number(p.quantity) < 5 ? ' low' : ''}`}>{p.quantity}</span></td>
                      <td className="muted">{p.created_at || '—'}</td>
                      <td>
                        <div className="row-actions">
                          <button className="button-mini" onClick={() => setFormFor(p)}>Edit</button>
                          <button className="button-mini delete" onClick={() => handleDelete(p)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {formFor && (
        <ProductForm
          product={formFor.id ? formFor : null}
          onSaved={handleSaved}
          onCancel={() => setFormFor(null)}
        />
      )}
    </div>
  );
}
