import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now Log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-aside">
        <div className="brand">
          <span className="brand-mark light">S</span>
          <span>Stockroom</span>
        </div>
        <div className="auth-copy">
          <p className="eyebrow">Your inventory, in good hands</p>
          <h1>Make room for better business.</h1>
          <p>A calmer, clearer way to keep track of your products, stock, and the details that keep things moving.</p>
          <div className="inventory-preview" aria-hidden="true">
            <div className="preview-heading">
              <span>Inventory overview</span>
              <span className="preview-dots"><i /><i /><i /></span>
            </div>
            <div className="preview-row">
              <span className="preview-icon">✳</span>
              <span className="preview-name">Everyday essentials</span>
              <span className="preview-meta">In stock</span>
            </div>
            <div className="preview-row">
              <span className="preview-icon">◈</span>
              <span className="preview-name">Thoughtful goods</span>
              <span className="preview-meta">Up to date</span>
            </div>
          </div>
        </div>
        <p className="auth-foot">A little more organized, every day.</p>
      </section>

      <section className="auth-main">
        <div className="auth-panel">
          <p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Get started'}</p>
          <h2>{mode === 'login' ? 'Sign in to Stockroom' : 'Create your account'}</h2>
          <p className="auth-intro">
            {mode === 'login'
              ? 'Enter your details to pick up where you left off.'
              : 'Create an account to start managing your inventory.'}
          </p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}

          <form onSubmit={submit}>
            <label>Username
              <input autoComplete="username" placeholder="Your username" value={form.username} onChange={set('username')} required autoFocus />
            </label>
            {mode === 'register' && (
              <label>Email address
                <input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </label>
            )}
            <label>Password
              <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Enter your password" value={form.password} onChange={set('password')} required minLength={6} />
            </label>
            <button className="auth-submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? 'New to Stockroom? ' : 'Already have an account? '}
            <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setNotice(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
