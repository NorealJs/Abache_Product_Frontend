import { useState } from 'react';
import { createProduct, updateProduct, errorMessage } from '../api.js';

const empty = { product_name: '', description: '', price: '', quantity: '' };

export default function ProductForm({ product, onSaved, onCancel }) {
  const editing = !!product;
  const [form, setForm] = useState(editing ? { ...product } : empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const payload = {
      product_name: form.product_name,
      description: form.description,
      price: form.price,
      quantity: form.quantity,
    };
    try {
      editing ? await updateProduct(product.id, payload) : await createProduct(payload);
      onSaved(editing ? 'Product updated.' : 'Product added.');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{editing ? 'Update inventory' : 'New inventory item'}</p>
            <h2 id="product-form-title">{editing ? 'Edit product' : 'Add a product'}</h2>
            <p>Keep your product details accurate and up to date.</p>
          </div>
          <span className="stat-icon">✳</span>
        </div>
        {error && <div className="alert error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <label>Product name
            <input placeholder="e.g. Canvas tote bag" value={form.product_name} onChange={set('product_name')} maxLength={100} required autoFocus />
          </label>
          <label>Description
            <textarea rows={3} placeholder="A short description (optional)" value={form.description ?? ''} onChange={set('description')} />
          </label>
          <div className="row">
            <label>Price
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={set('price')} required />
            </label>
            <label>Quantity
              <input type="number" min="0" step="1" placeholder="0" value={form.quantity} onChange={set('quantity')} required />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="button-quiet" onClick={onCancel}>Cancel</button>
            <button className="button-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
